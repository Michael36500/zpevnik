//builds the pdf file from songs (pdf-lib), this is loaded only when the user asks for a pdf
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFHexString, PDFName, PDFPage, PDFString, rgb } from "pdf-lib";
import {
    DrawItem,
    FontStyle,
    layoutSong,
    LayoutDeps,
    LayoutOptions,
    Metrics,
    Page,
    PdfSong,
    splitSpecial,
    SPECIAL_WIDTH,
    MARGIN_BOTTOM,
    textWidth,
} from "./layout";
import { layoutToc } from "./toc";

export type { PdfSong, LayoutOptions };

export type FontBytes = { [style in FontStyle]: ArrayBuffer | Uint8Array };

export interface BuildOptions {
    layout: LayoutOptions;
    chordName: LayoutDeps["chordName"];
    title: string; //document title
    //songbook: table of contents, page numbers and bookmarks
    songbook: boolean;
    onProgress?: (done: number, total: number) => void;
}

const gray = (g: number) => rgb(g, g, g);
const sleep = () => new Promise((r) => setTimeout(r, 0));

//flat, sharp and repeat signs are not in the font
export function drawSpecial(page: PDFPage, ch: string, x: number, y: number, size: number, style: FontStyle, color: number) {
    const bold = style === "bold" || style === "boldItalic";
    const c = gray(color);
    const t = (bold ? 0.085 : 0.065) * size;
    const slant = style === "italic" || style === "boldItalic" ? 0.12 : 0;
    const X = (em: number, up = 0) => x + em * size + up * slant * size;

    if (ch === "♭") {
        page.drawLine({ start: { x: X(0.1, 0), y: y - 0.1 * size }, end: { x: X(0.1, 0.82), y: y + 0.82 * size }, thickness: t, color: c });
        page.drawSvgPath("M 0 -0.02 C 0.2 -0.06 0.36 -0.2 0.3 -0.35 C 0.24 -0.5 0.06 -0.42 0 -0.34", {
            x: X(0.1, 0),
            y,
            scale: size,
            borderColor: c,
            borderWidth: t / size,
        });
    } else if (ch === "♯") {
        [0.18, 0.38].forEach((e) =>
            page.drawLine({ start: { x: X(e), y: y - 0.12 * size }, end: { x: X(e), y: y + 0.82 * size }, thickness: t * 0.9, color: c }),
        );
        [0.2, 0.46].forEach((e) =>
            page.drawLine({ start: { x: X(0.07), y: y + (e - 0.08) * size }, end: { x: X(0.5), y: y + (e + 0.08) * size }, thickness: t * 1.9, color: c }),
        );
    } else {
        //repeat sign: thick bar, thin bar, two dots; ending mirrors the beginning
        const dir = ch === "𝄆" ? 1 : -1;
        const w = SPECIAL_WIDTH[ch];
        const at = (em: number) => x + (dir === 1 ? em : w - em) * size;
        const bottom = y - 0.1 * size;
        const top = y + 0.82 * size;
        page.drawLine({ start: { x: at(0.08), y: bottom }, end: { x: at(0.08), y: top }, thickness: 0.17 * size, color: c });
        page.drawLine({ start: { x: at(0.27), y: bottom }, end: { x: at(0.27), y: top }, thickness: 0.05 * size, color: c });
        [0.26, 0.56].forEach((e) => page.drawCircle({ x: at(0.5), y: y + e * size, size: 0.065 * size, color: c, borderWidth: 0 }));
    }
}

function draw(page: PDFPage, item: DrawItem, fonts: { [style in FontStyle]: PDFFont }, m: Metrics, pageIndexToPage: (i: number) => PDFPage, doc: PDFDocument) {
    const H = page.getHeight();
    if (item.t === "text") {
        const color = gray(item.gray || 0);
        let x = item.x;
        splitSpecial(item.text).forEach((part) => {
            if (part.special) {
                drawSpecial(page, part.text, x, H - item.y, item.size, item.style, item.gray || 0);
                x += SPECIAL_WIDTH[part.text] * item.size;
            } else {
                page.drawText(part.text, { x, y: H - item.y, size: item.size, font: fonts[item.style], color });
                x += m.width(part.text, item.style) * item.size;
            }
        });
    } else if (item.t === "line") {
        page.drawLine({
            start: { x: item.x1, y: H - item.y1 },
            end: { x: item.x2, y: H - item.y2 },
            thickness: item.w,
            color: gray(item.gray),
            dashArray: item.dash,
            lineCap: item.dash ? 1 : 0,
        });
    } else {
        const target = pageIndexToPage(item.page);
        const ctx = doc.context;
        const link = ctx.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [item.x, H - item.y - item.h, item.x + item.w, H - item.y],
            Border: [0, 0, 0],
            Dest: [target.ref, "Fit"],
        });
        page.node.addAnnot(ctx.register(link));
    }
}

//bookmarks in the side panel of pdf viewers
function addOutline(doc: PDFDocument, entries: { title: string; page: PDFPage }[]) {
    const ctx = doc.context;
    const root = ctx.nextRef();
    const refs = entries.map(() => ctx.nextRef());
    entries.forEach((e, i) => {
        const dict: { [key: string]: any } = {
            Title: PDFHexString.fromText(e.title || "?"),
            Parent: root,
            Dest: [e.page.ref, "Fit"],
        };
        if (i > 0) dict.Prev = refs[i - 1];
        if (i < entries.length - 1) dict.Next = refs[i + 1];
        ctx.assign(refs[i], ctx.obj(dict));
    });
    ctx.assign(root, ctx.obj({ Type: "Outlines", First: refs[0], Last: refs[refs.length - 1], Count: entries.length }));
    doc.catalog.set(PDFName.of("Outlines"), root);
    doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

export async function buildPdf(songs: PdfSong[], fontBytes: FontBytes, o: BuildOptions): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);

    const styles: FontStyle[] = ["regular", "bold", "italic", "boldItalic"];
    const fonts = {} as { [style in FontStyle]: PDFFont };
    for (const s of styles) fonts[s] = await doc.embedFont(fontBytes[s], { subset: true });

    //font sizes are relative to 1 so one cache per style serves every size
    const cache: { [style: string]: Map<string, number> } = {};
    const supported = new Set(fonts.regular.getCharacterSet());
    const metrics: Metrics = {
        width(text, style) {
            const c = cache[style] || (cache[style] = new Map());
            let w = c.get(text);
            if (w === undefined) c.set(text, (w = fonts[style].widthOfTextAtSize(text, 1)));
            return w;
        },
        has: (cp) => supported.has(cp),
    };
    const deps: LayoutDeps = { metrics, chordName: o.chordName };

    //lay out all songs first, page numbers are needed for the table of contents
    const songPages: Page[][] = [];
    for (let i = 0; i < songs.length; i++) {
        songPages.push(layoutSong(songs[i], o.layout, deps, o.songbook));
        o.onProgress?.(i + 1, songs.length * 2);
        if (i % 6 === 5) await sleep();
    }

    const entries = songs.map((s) => ({ title: s.title, author: s.author }));
    const tocFor = (offset: (i: number) => number) => layoutToc(entries, metrics, o.layout.page, offset, "Zpěvník");
    let toc: Page[] = [];
    const firstPage: number[] = []; //1-based number of the first page of each song
    if (o.songbook && songs.length) {
        const count = tocFor(() => 1).length;
        let next = count + 1;
        songPages.forEach((p, i) => {
            firstPage[i] = next;
            next += p.length;
        });
        toc = tocFor((i) => firstPage[i]);
    }

    const all = [...toc, ...songPages.reduce((a, p) => a.concat(p), [] as Page[])];
    const pdfPages = all.map((p) => doc.addPage([p.width, p.height]));
    for (let i = 0; i < all.length; i++) {
        const page = pdfPages[i];
        all[i].items.forEach((it) => draw(page, it, fonts, metrics, (n) => pdfPages[n], doc));
        if (all[i].numbered) {
            const number = String(i + 1);
            const w = textWidth(metrics, number, "regular") * 9;
            page.drawText(number, { x: (all[i].width - w) / 2, y: MARGIN_BOTTOM / 2 - 2, size: 9, font: fonts.regular, color: gray(0.45) });
        }
        if (i % 12 === 11) {
            o.onProgress?.(songs.length + Math.round((i / all.length) * songs.length), songs.length * 2);
            await sleep();
        }
    }

    if (o.songbook && songs.length)
        addOutline(
            doc,
            songs.map((s, i) => ({ title: s.title, page: pdfPages[firstPage[i] - 1] })),
        );

    doc.setTitle(o.title);
    doc.setProducer("Zpěvník");
    doc.setCreator("Zpěvník");
    doc.catalog.set(PDFName.of("Lang"), PDFString.of("cs"));
    o.onProgress?.(songs.length * 2, songs.length * 2);
    return doc.save();
}
