//turns one line of song lyrics into words made of pieces, the same way the web page reads it
//
//  [Em]Bratříčku, nevzlykej, to nejsou [G]bubáci,   chords in [], placed above the following text
//  \h{1em}                                          horizontal skip (\hskip{} too)
//  |:  :|                                           repeat signs
//  *italic*  **bold**                               markdown emphasis

export type FontStyle = "regular" | "bold" | "italic" | "boldItalic";

export interface Run {
    text: string;
    style: FontStyle;
}

//a part of a word; the chords (already named) are drawn above its beginning
export interface Piece {
    chords: string[];
    runs: Run[];
    skip: number; //fixed horizontal space in pt (a piece is either text or a skip)
}

export type Word = Piece[];

export interface ParseOptions {
    size: number; //font size in pt, for converting em
    chords: boolean;
    yeet: boolean;
    chordName: (token: string) => string;
}

type Ev =
    | { k: "text"; s: string }
    | { k: "space" }
    | { k: "chord"; tokens: string[] }
    | { k: "skip"; w: number }
    | { k: "star"; n: number; paired: boolean };

const TOKEN = /\\h(?:skip)?\{(.*?)\}|\[(.*?)\]|(\*+)|(\s+)|([^\\[*\s]+|[\\[])/g;

//css length -> pt
export function lengthToPt(value: string, size: number): number {
    const m = value.trim().match(/^(-?\d*\.?\d+)\s*(em|rem|ex|px|pt|cm|mm|in)?$/);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    const unit: { [u: string]: number } = {
        em: size,
        rem: size,
        ex: size / 2,
        px: 0.75,
        pt: 1,
        cm: 28.346,
        mm: 2.8346,
        in: 72,
    };
    const w = n * unit[m[2] || "px"];
    return Math.max(0, Math.min(w, size * 8));
}

function tokenize(raw: string, o: ParseOptions): Ev[] {
    let text = raw.replace(/\|:/g, "𝄆").replace(/:\|/g, "𝄇");
    if (o.yeet) text = text.replace(/[Jj]ít/g, (s) => (s[0] === "J" ? "Yeet" : "yeet"));

    const events: Ev[] = [];
    for (const m of Array.from(text.matchAll(TOKEN))) {
        if (m[1] !== undefined) events.push({ k: "skip", w: lengthToPt(m[1], o.size) });
        else if (m[2] !== undefined) {
            if (o.chords) {
                const tokens = m[2].split(/\s+/).filter(Boolean);
                if (tokens.length) events.push({ k: "chord", tokens: tokens.map(o.chordName) });
            }
        } else if (m[3] !== undefined) events.push({ k: "star", n: m[3].length, paired: false });
        else if (m[4] !== undefined) events.push({ k: "space" });
        else events.push({ k: "text", s: m[5] });
    }
    return events;
}

//decides which asterisks open/close emphasis, the others stay literal
function pairStars(events: Ev[]) {
    const open: { i: number; n: number }[] = [];
    events.forEach((e, i) => {
        if (e.k !== "star" || e.n > 3) return;
        const prev = events[i - 1];
        const next = events[i + 1];
        const canClose = !!prev && prev.k !== "space";
        const canOpen = !!next && next.k !== "space";
        const at = open.map((x) => x.n).lastIndexOf(e.n);
        if (canClose && at >= 0) {
            (events[open[at].i] as any).paired = true;
            e.paired = true;
            open.length = at;
        } else if (canOpen) open.push({ i, n: e.n });
    });
}

export function parseLine(raw: string, o: ParseOptions): Word[] {
    const events = tokenize(raw, o);
    pairStars(events);

    const words: Word[] = [];
    let word: Word = [];
    let piece: Piece | null = null;
    let pending: string[] = []; //chords waiting for the text they belong to
    let italic = 0;
    let bold = 0;

    const style = (): FontStyle => (bold && italic ? "boldItalic" : bold ? "bold" : italic ? "italic" : "regular");
    const addText = (s: string) => {
        if (!piece) {
            piece = { chords: pending, runs: [], skip: 0 };
            pending = [];
            word.push(piece);
        }
        const last = piece.runs[piece.runs.length - 1];
        if (last && last.style === style()) last.text += s;
        else piece.runs.push({ text: s, style: style() });
    };
    //chords that have no text after them stay at the end of the word
    const flushPending = () => {
        if (pending.length && word.length) {
            word.push({ chords: pending, runs: [], skip: 0 });
            pending = [];
        }
    };
    const endWord = () => {
        piece = null;
        flushPending();
        if (word.length) words.push(word);
        word = [];
    };

    for (const e of events) {
        if (e.k === "text") addText(e.s);
        else if (e.k === "star") {
            if (!e.paired) addText("*".repeat(e.n));
            else {
                if (e.n === 1 || e.n === 3) italic ^= 1;
                if (e.n === 2 || e.n === 3) bold ^= 1;
            }
        } else if (e.k === "chord") {
            piece = null;
            pending = pending.concat(e.tokens);
        } else if (e.k === "skip") {
            piece = null;
            word.push({ chords: pending, runs: [], skip: e.w });
            pending = [];
        } else endWord(); //space
    }
    endWord();
    if (pending.length) words.push([{ chords: pending, runs: [], skip: 0 }]);

    //skips at the end of the line are invisible
    while (words.length) {
        const w = words[words.length - 1];
        while (w.length && !w[w.length - 1].chords.length && !w[w.length - 1].runs.length) w.pop();
        if (w.length) break;
        words.pop();
    }
    return words;
}
