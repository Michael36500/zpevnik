//lays songs out on pages; knows nothing about pdf-lib, only about text widths (Metrics)
import { FontStyle, parseLine, Piece, Word } from "./parse";

export type { FontStyle };

export interface Metrics {
    //width of text in em (font size 1)
    width(text: string, style: FontStyle): number;
    //does the font have a glyph for the code point
    has(codePoint: number): boolean;
}

export interface PdfSong {
    id: string;
    title: string;
    author: string;
    capo: number;
    verses: { name?: string; lyrics?: string }[];
}

export interface LayoutOptions {
    fontSize: number; //pt
    columns: number;
    chords: boolean;
    transpose: number;
    scale: number;
    transposeCapo: boolean;
    yeet: boolean;
    page: { width: number; height: number };
}

export interface LayoutDeps {
    metrics: Metrics;
    chordName: (token: string, transpose: number, scale: number) => string;
}

export type DrawItem =
    | { t: "text"; x: number; y: number; text: string; style: FontStyle; size: number; gray?: number }
    | { t: "line"; x1: number; y1: number; x2: number; y2: number; w: number; gray: number; dash?: [number, number] }
    | { t: "link"; x: number; y: number; w: number; h: number; page: number };

export interface Page {
    width: number;
    height: number;
    items: DrawItem[];
    numbered: boolean; //page number goes to the footer
}

export const MARGIN_X = 48;
export const MARGIN_TOP = 52;
export const MARGIN_BOTTOM = 62;

//symbols the font lacks, they are drawn as vector shapes (see render.ts)
export const SPECIAL_WIDTH: { [ch: string]: number } = { "♭": 0.4, "♯": 0.58, "𝄆": 0.95, "𝄇": 0.95 };

export function splitSpecial(text: string): { text: string; special: boolean }[] {
    const out: { text: string; special: boolean }[] = [];
    let buf = "";
    for (const ch of Array.from(text)) {
        if (SPECIAL_WIDTH[ch] !== undefined) {
            if (buf) out.push({ text: buf, special: false });
            buf = "";
            out.push({ text: ch, special: true });
        } else buf += ch;
    }
    if (buf) out.push({ text: buf, special: false });
    return out;
}

export function textWidth(m: Metrics, text: string, style: FontStyle): number {
    return splitSpecial(text).reduce((sum, p) => sum + (p.special ? SPECIAL_WIDTH[p.text] : m.width(p.text, style)), 0);
}

//drops characters the font cannot show
export function sanitize(m: Metrics, text: string): string {
    return Array.from(text)
        .filter((ch) => SPECIAL_WIDTH[ch] !== undefined || /\s/.test(ch) || m.has(ch.codePointAt(0) as number))
        .join("");
}

//line box metrics, in multiples of the font size
const LINE = 1.38;
const BASELINE = 1.02;
const CHORD_LINE = 2.38;
const CHORD_BASELINE = 2.02;
const CHORD_RISE = 1.0;
const CHORD_GAP = 0.35; //minimal space between two chords
const TOKEN_GAP = 0.5; //space between chords in one []
const VERSE_GAP = 0.9;
const CONTINUATION_INDENT = 1;

type LineItem = { t: "text" | "chord"; x: number; text: string; style: FontStyle };

interface VLine {
    top: number; //from the top of the block
    height: number;
    baseline: number; //from the top of the block
    items: LineItem[];
    chords: boolean;
}

interface Block {
    gap: number; //space above, unless at the top of a column
    height: number;
    lines: VLine[];
    indent: number; //where the text starts, names of verses hang to the left of it
}

const isLetter = (s: string) => /^\p{L}$/u.test(s);
const lastChar = (p: Piece) => Array.from(p.runs.length ? p.runs[p.runs.length - 1].text : "").pop() || "";
const firstChar = (p: Piece) => Array.from(p.runs.length ? p.runs[0].text : "")[0] || "";

//puts words on one line, moves text that would lie under a chord
function placeWords(words: Word[], size: number, m: Metrics, indent: number) {
    const items: LineItem[] = [];
    const space = m.width(" ", "regular") * size;
    let x = indent;
    let chordEnd = -Infinity;
    let hasChords = false;

    words.forEach((word, wi) => {
        if (wi > 0) x += space;
        word.forEach((piece, pi) => {
            if (piece.chords.length) {
                hasChords = true;
                let need = chordEnd + CHORD_GAP * size - x;
                if (need > 0) {
                    //chord inside of a word: make room and mark the break with a hyphen
                    const inside = pi > 0 && isLetter(lastChar(word[pi - 1])) && isLetter(firstChar(piece));
                    if (inside) {
                        const hy = m.width("-", "regular") * size;
                        need = Math.max(need, hy + 0.2 * size);
                        items.push({ t: "text", x: x + 0.08 * size, text: "-", style: "regular" });
                    }
                    x += need;
                }
                let cx = x;
                piece.chords.forEach((token) => {
                    items.push({ t: "chord", x: cx, text: token, style: "bold" });
                    cx += textWidth(m, token, "bold") * size + TOKEN_GAP * size;
                });
                chordEnd = cx - TOKEN_GAP * size;
            }
            x += piece.skip;
            piece.runs.forEach((run) => {
                items.push({ t: "text", x, text: run.text, style: run.style });
                x += textWidth(m, run.text, run.style) * size;
            });
        });
    });
    return { items, width: Math.max(x, chordEnd), chords: hasChords };
}

function wrapWords(words: Word[], avail: number, size: number, m: Metrics) {
    const lines: ReturnType<typeof placeWords>[] = [];
    let line: Word[] = [];
    for (const word of words) {
        const indent = lines.length ? CONTINUATION_INDENT * size : 0;
        if (line.length && placeWords([...line, word], size, m, indent).width > avail) {
            lines.push(placeWords(line, size, m, indent));
            line = [];
        }
        line.push(word);
    }
    if (line.length) lines.push(placeWords(line, size, m, lines.length ? CONTINUATION_INDENT * size : 0));
    return lines;
}

//breaks text into lines no wider than maxWidth
function wrapPlain(text: string, style: FontStyle, size: number, maxWidth: number, m: Metrics): string[] {
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
        const test = line ? line + " " + word : word;
        if (line && textWidth(m, test, style) * size > maxWidth) {
            lines.push(line);
            line = word;
        } else line = test;
    }
    if (line) lines.push(line);
    return lines;
}

const cleanName = (name?: string) => {
    const n = (name || "").trim();
    return n === "null" || n === "undefined" ? "" : n;
};

function buildBlocks(song: PdfSong, o: LayoutOptions, d: LayoutDeps, textWidthAvail: number, gutter: number) {
    const { metrics: m } = d;
    const size = o.fontSize;
    const blocks: Block[] = [];

    const capo = (12 + (song.capo || 0) - (o.transposeCapo ? o.transpose : 0)) % 12;
    if (capo || song.capo) {
        const h = LINE * size;
        blocks.push({
            gap: 0,
            height: h,
            indent: 0,
            lines: [
                {
                    top: 0,
                    height: h,
                    baseline: BASELINE * size,
                    chords: false,
                    items: [{ t: "text", x: 0, text: "Capo " + capo, style: "regular" }],
                },
            ],
        });
    }

    for (const verse of song.verses || []) {
        const lines: VLine[] = [];
        let top = 0;
        const add = (items: LineItem[], chords: boolean) => {
            const height = (chords ? CHORD_LINE : LINE) * size;
            lines.push({ top, height, baseline: top + (chords ? CHORD_BASELINE : BASELINE) * size, items, chords });
            top += height;
        };

        const name = sanitize(m, cleanName(verse.name));
        const nameWidth = name ? textWidth(m, name, "bold") * size : 0;
        const nameFits = nameWidth <= gutter - 0.3 * size;
        if (name && !nameFits) add([{ t: "text", x: 0, text: name, style: "bold" }], false);

        const parseOptions = {
            size,
            chords: o.chords,
            yeet: o.yeet,
            chordName: (token: string) => sanitize(m, d.chordName(token, o.transpose, o.scale)),
        };
        const raw = sanitize(m, verse.lyrics || "").split(/\r?\n/);
        raw.forEach((line) => {
            const words = parseLine(line, parseOptions);
            if (!words.length) return;
            wrapWords(words, textWidthAvail, size, m).forEach((l) => add(l.items, l.chords));
        });
        if (!lines.length) continue;

        if (name && nameFits) {
            const first = lines[0];
            first.items.push({ t: "text", x: -nameWidth - 0.3 * size, text: name, style: "bold" });
        }
        blocks.push({ gap: VERSE_GAP * size, height: top, lines, indent: gutter });
    }
    return blocks;
}

//splits blocks that do not fit on one column, keeps whole verses together otherwise
function splitTall(blocks: Block[], max: number): Block[] {
    const out: Block[] = [];
    for (const b of blocks) {
        if (b.height <= max) {
            out.push(b);
            continue;
        }
        let lines: VLine[] = [];
        let start = 0;
        const flush = () => {
            if (!lines.length) return;
            const shifted = lines.map((l) => ({ ...l, top: l.top - start, baseline: l.baseline - start }));
            const last = lines[lines.length - 1];
            out.push({
                gap: start === 0 ? b.gap : 0,
                height: last.top + last.height - start,
                lines: shifted,
                indent: b.indent,
            });
        };
        for (const l of b.lines) {
            if (lines.length && l.top + l.height - start > max) {
                flush();
                lines = [];
                start = l.top;
            }
            lines.push(l);
        }
        flush();
    }
    return out;
}

//puts blocks in n columns, none higher than h; null if impossible
function pack(blocks: Block[], n: number, h: number): Block[][] | null {
    const cols: Block[][] = [[]];
    let used = 0;
    for (const b of blocks) {
        if (b.height > h + 0.01) return null;
        let col = cols[cols.length - 1];
        let gap = col.length ? b.gap : 0;
        if (used + gap + b.height > h + 0.01) {
            if (cols.length === n) return null;
            col = [];
            cols.push(col);
            gap = 0;
            used = 0;
        }
        used += gap + b.height;
        col.push(b);
    }
    return cols;
}

//like CSS columns: the shortest columns that still hold everything
function balance(blocks: Block[], n: number, h: number): Block[][] | null {
    if (!pack(blocks, n, h)) return null;
    let lo = Math.max(...blocks.map((b) => b.height), 0);
    let hi = h;
    for (let i = 0; i < 24 && hi - lo > 0.5; i++) {
        const mid = (lo + hi) / 2;
        if (pack(blocks, n, mid)) hi = mid;
        else lo = mid;
    }
    return pack(blocks, n, hi);
}

//fills the page column by column; returns the blocks that did not fit
function fill(blocks: Block[], n: number, h: number): { cols: Block[][]; rest: Block[] } {
    const cols: Block[][] = [];
    let rest = blocks.slice();
    for (let c = 0; c < n && rest.length; c++) {
        const col: Block[] = [];
        let used = 0;
        while (rest.length) {
            const b = rest[0];
            const gap = col.length ? b.gap : 0;
            if (used + gap + b.height > h + 0.01) break;
            used += gap + b.height;
            col.push(b);
            rest = rest.slice(1);
        }
        cols.push(col);
    }
    return { cols, rest };
}

export function layoutSong(song: PdfSong, o: LayoutOptions, d: LayoutDeps, numbered: boolean): Page[] {
    const m = d.metrics;
    const size = o.fontSize;
    const { width: pw, height: ph } = o.page;
    const contentW = pw - 2 * MARGIN_X;
    const colGap = 2 * size;
    const n = Math.max(1, Math.round(o.columns));
    const colW = (contentW - (n - 1) * colGap) / n;

    const title = sanitize(m, song.title || "").trim();
    const author = sanitize(m, song.author || "").trim();

    //the widest short verse name decides how far the text is moved right
    const names = (song.verses || []).map((v) => sanitize(m, cleanName(v.name)));
    const widths = names.map((nm) => (nm ? textWidth(m, nm, "bold") * size : 0)).filter((w) => w <= 2.5 * size);
    const gutter = Math.min(3 * size, Math.max(1.6 * size, Math.max(0, ...widths) + 0.45 * size));

    const blocks = buildBlocks(song, o, d, colW - gutter, gutter);

    //heading of the first page
    const items: DrawItem[] = [];
    let y = MARGIN_TOP;
    const titleSize = 1.5 * size;
    wrapPlain(title, "bold", titleSize, contentW, m).forEach((line) => {
        y += 1.2 * titleSize;
        items.push({ t: "text", x: (pw - textWidth(m, line, "bold") * titleSize) / 2, y, text: line, style: "bold", size: titleSize });
    });
    const authorSize = 1.1 * size;
    wrapPlain(author, "italic", authorSize, contentW, m).forEach((line, i) => {
        y += (i === 0 ? 1.45 : 1.3) * authorSize;
        items.push({ t: "text", x: (pw - textWidth(m, line, "italic") * authorSize) / 2, y, text: line, style: "italic", size: authorSize });
    });
    const firstTop = y + 1.1 * size;
    const bottom = ph - MARGIN_BOTTOM;
    const restTop = MARGIN_TOP;

    const pages: Page[] = [];
    const maxColumn = bottom - restTop;
    let rest = splitTall(blocks, maxColumn);

    do {
        const first = pages.length === 0;
        const top = first ? firstTop : restTop;
        const h = bottom - top;
        const pageItems: DrawItem[] = first ? items : [];
        if (!first) {
            const head = [title, author].filter(Boolean).join(" – ");
            pageItems.push({ t: "text", x: MARGIN_X, y: MARGIN_TOP - 20, text: head, style: "italic", size: 0.75 * size, gray: 0.5 });
        }

        let cols = balance(rest, n, h);
        if (cols) rest = [];
        else {
            const f = fill(rest, n, h);
            cols = f.cols;
            rest = f.rest;
        }

        cols.forEach((col, c) => {
            let by = top;
            col.forEach((b, bi) => {
                if (bi) by += b.gap;
                const colX = MARGIN_X + c * (colW + colGap) + b.indent;
                b.lines.forEach((l) => {
                    const baseline = by + l.baseline;
                    l.items.forEach((it) =>
                        pageItems.push({
                            t: "text",
                            x: colX + it.x,
                            y: it.t === "chord" ? baseline - CHORD_RISE * size : baseline,
                            text: it.text,
                            style: it.style,
                            size,
                        }),
                    );
                });
                by += b.height;
            });
        });
        pages.push({ width: pw, height: ph, items: pageItems, numbered });
    } while (rest.length);

    return pages;
}
