import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import ChordHelper from "../model/chordHelper";
import { buildPdf, LayoutOptions } from "./build";

jest.mock("../model/model", () => ({ __esModule: true, default: { settings: { preferedScale: 0 } } }));

const fontDir = path.join(__dirname, "../../assets/fonts");
const font = (name: string) => new Uint8Array(fs.readFileSync(path.join(fontDir, name)));
const fonts = {
    regular: font("Nunito-Regular.ttf"),
    bold: font("Nunito-Bold.ttf"),
    italic: font("Nunito-Italic.ttf"),
    boldItalic: font("Nunito-BoldItalic.ttf"),
};

const layout: LayoutOptions = {
    fontSize: 12,
    columns: 1,
    chords: true,
    transpose: 0,
    scale: 0,
    transposeCapo: false,
    yeet: false,
    page: { width: 595.28, height: 841.89 },
};
const chordName = (t: string, tr: number, sc: number) => ChordHelper.getChordInfoFromString(t, tr, sc)?.name || t;

const song = (id: string, title: string, n = 1) => ({
    id,
    title,
    author: "Karel Kryl",
    capo: 2,
    verses: Array.from({ length: n }, (_, i) => ({
        name: i + 1 + ".",
        lyrics: "[Em]Bratříčku, nevzlykej, to nejsou [G]bubáci,\n[D]vždyť už jsi *velikej*, to jsou jen [B♭7]vojáci,\n|: [C]přijeli v hranatých železných maringot[B7]kách. :|",
    })),
});

test("builds a songbook with contents, one song per page", async () => {
    const songs = [song("a", "Čmelák"), song("b", "Zebra", 40), song("c", "Alfa")];
    const bytes = await buildPdf(songs, fonts, { layout, chordName, title: "Zpěvník", songbook: true });
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getTitle()).toBe("Zpěvník");
    //contents + 3 songs, the long one needs more pages
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(5);
    if (process.env.PDF_OUT) fs.writeFileSync(process.env.PDF_OUT + "-small.pdf", bytes);
});

test("builds a single song in columns", async () => {
    const bytes = await buildPdf([song("a", "Čmelák", 8)], fonts, {
        layout: { ...layout, columns: 2, transpose: 2, page: { width: 841.89, height: 595.28 } },
        chordName,
        title: "Čmelák",
        songbook: false,
    });
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
});

const real = process.env.PDF_SONGS;
(real ? test : test.skip)("real songs", async () => {
    const items = JSON.parse(fs.readFileSync(real as string, "utf8")).items as any[];
    const { lyricsToVerses } = require("../model/songHelper");
    const songs = items
        .map((s) => ({ id: s.id, title: s.title, author: s.author, capo: s.capo, verses: lyricsToVerses(s.lyrics) }))
        .sort((a, b) => a.title.localeCompare(b.title, "cs"));
    const t = Date.now();
    const bytes = await buildPdf(songs, fonts, { layout, chordName, title: "Zpěvník", songbook: true });
    console.log("songbook", songs.length, "songs", bytes.length, "bytes", Date.now() - t, "ms");
    fs.writeFileSync(process.env.PDF_OUT + "-book.pdf", bytes);
    const single = await buildPdf([songs.find((s) => s.title.startsWith("Červená"))!], fonts, {
        layout: { ...layout, columns: 2, page: { width: 841.89, height: 595.28 } },
        chordName,
        title: "x",
        songbook: false,
    });
    fs.writeFileSync(process.env.PDF_OUT + "-single2col.pdf", single);
}, 120000);

describe("chord sheet", () => {
    it.each(["guitar", "ukulele"] as const)("fits %s chords on two pages", async (instrument) => {
        const { buildChordSheet } = await import("./chordsheet");
        const chords = ChordHelper.notes.flatMap((n) =>
            ["", "m", "7", "m7", "maj7", "sus4"].map((suffix) => {
                const info: any = ChordHelper.getChordInfoFromString(n[0] + suffix, 0, 1);
                return { name: info.name, position: info.diagrams[instrument].positions[0] };
            }),
        );
        const bytes = await buildChordSheet(instrument, chords, fonts, "All chords for " + instrument);
        expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
        if (process.env.SHEET_DIR) fs.writeFileSync(path.join(process.env.SHEET_DIR, instrument + ".pdf"), bytes);
    });
});
