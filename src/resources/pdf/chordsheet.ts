//pdf with every basic chord and how to play it, loaded only when the user asks for it
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { drawSpecial, FontBytes } from "./build";
import { SPECIAL_WIDTH, splitSpecial } from "./layout";

export type Instrument = "guitar" | "ukulele";

export interface ChordPosition {
    frets: number[]; //-1 muted, 0 open, otherwise relative to baseFret
    fingers?: number[];
    barres?: number[];
    capo?: boolean;
    baseFret: number;
}

export interface SheetChord {
    name: string; //already written in the scale from the settings
    position?: ChordPosition;
}

//one row of the grid is one note, one column is one kind of chord
export const SHEET_ROWS = 12;
export const SHEET_COLUMNS = 6;
const ROWS_PER_PAGE = 6;

const A4 = { width: 595.28, height: 841.89 };
const MARGIN_X = 40;
const MARGIN_BOTTOM = 40;
const GRID_TOP = A4.height - 96;

//diagram is drawn in units of the react-chords one (strings 10 apart, frets 12 apart, y down)
const FRET_HEIGHT = 12;
const FRETS = 4;
const STRING_GAP = 10;
const UNIT = { guitar: 1.2, ukulele: 1.3 };

const ink = rgb(0.27, 0.27, 0.27);
const light = rgb(0.85, 0.85, 0.85);

function drawText(page: PDFPage, text: string, cx: number, y: number, size: number, font: PDFFont, align: "center" | "right" = "center") {
    const parts = splitSpecial(text);
    const width = parts.reduce((w, p) => w + (p.special ? SPECIAL_WIDTH[p.text] * size : font.widthOfTextAtSize(p.text, size)), 0);
    let x = align === "center" ? cx - width / 2 : cx - width;
    parts.forEach((p) => {
        if (p.special) {
            drawSpecial(page, p.text, x, y, size, "bold", 0.15);
            x += SPECIAL_WIDTH[p.text] * size;
        } else {
            page.drawText(p.text, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
            x += font.widthOfTextAtSize(p.text, size);
        }
    });
}

//same picture as the diagram shown above lyrics; (ox, oy) is the top left corner of the neck
function drawDiagram(page: PDFPage, c: ChordPosition, strings: number, ox: number, oy: number, s: number, font: PDFFont) {
    const X = (u: number) => ox + u * s;
    const Y = (u: number) => oy - u * s;
    const right = (strings - 1) * STRING_GAP;
    const fretY = (fret: number) => FRET_HEIGHT * fret - FRET_HEIGHT / 2;
    const stringX = (index: number) => index * STRING_GAP;
    const line = (x1: number, y1: number, x2: number, y2: number, w: number) =>
        page.drawLine({ start: { x: X(x1), y: Y(y1) }, end: { x: X(x2), y: Y(y2) }, thickness: w * s, color: ink });

    for (let i = 0; i <= FRETS; i++) line(0, i * FRET_HEIGHT, right, i * FRET_HEIGHT, 0.5);
    for (let i = 0; i < strings; i++) line(stringX(i), 0, stringX(i), FRETS * FRET_HEIGHT, 0.5);

    if (c.baseFret === 1) line(0, 0, right, 0, 2.5);
    else drawText(page, `${c.baseFret}fr`, X(-3), Y(fretY(1) - 2.5), 6.5 * s, font, "right");

    const barres = c.barres || [];
    const number = (n: number | undefined, x: number, fret: number) => {
        if (!n) return;
        const size = 4.8 * s;
        page.drawText(String(n), { x: X(x) - font.widthOfTextAtSize(String(n), size) / 2, y: Y(fretY(fret)) - size * 0.35, size, font, color: rgb(1, 1, 1) });
    };

    barres.forEach((barre, k) => {
        const at = c.frets.map((f, i) => (f === barre ? i : -1)).filter((i) => i >= 0);
        if (!at.length) return;
        const top = fretY(barre) - 4.125;
        if (k === 0 && c.capo)
            page.drawRectangle({ x: X(0), y: Y(top + 8.25), width: right * s, height: 8.25 * s, color: ink, opacity: 0.2 });
        page.drawRectangle({ x: X(stringX(at[0])), y: Y(top + 8.25), width: (stringX(at[at.length - 1]) - stringX(at[0])) * s, height: 8.25 * s, color: ink });
        at.forEach((i) => {
            page.drawCircle({ x: X(stringX(i)), y: Y(fretY(barre)), size: 4 * s, color: ink });
            number(c.fingers?.[at[0]], stringX(i), barre);
        });
    });

    c.frets.forEach((fret, i) => {
        if (barres.includes(fret)) return;
        const x = stringX(i);
        if (fret === -1) {
            const r = 1.8;
            line(x - r, -4 - r, x + r, -4 + r, 0.8);
            line(x - r, -4 + r, x + r, -4 - r, 0.8);
        } else if (fret === 0) {
            page.drawCircle({ x: X(x), y: Y(-4), size: 2 * s, borderColor: ink, borderWidth: 0.6 * s });
        } else {
            page.drawCircle({ x: X(x), y: Y(fretY(fret)), size: 4 * s, color: ink });
            number(c.fingers?.[i], x, fret);
        }
    });
}

//chords are in reading order, SHEET_COLUMNS per row
export async function buildChordSheet(instrument: Instrument, chords: SheetChord[], fontBytes: FontBytes, title: string): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const regular = await doc.embedFont(fontBytes.regular, { subset: true });
    const bold = await doc.embedFont(fontBytes.bold, { subset: true });

    const strings = instrument === "guitar" ? 6 : 4;
    const s = UNIT[instrument];
    const cellW = (A4.width - 2 * MARGIN_X) / SHEET_COLUMNS;
    const rowH = (GRID_TOP - MARGIN_BOTTOM) / ROWS_PER_PAGE;
    const pageCount = Math.ceil(chords.length / (SHEET_COLUMNS * ROWS_PER_PAGE));

    for (let p = 0; p < pageCount; p++) {
        const page = doc.addPage([A4.width, A4.height]);
        drawText(page, title, A4.width / 2, A4.height - 58, 22, bold);
        chords.slice(p * SHEET_COLUMNS * ROWS_PER_PAGE, (p + 1) * SHEET_COLUMNS * ROWS_PER_PAGE).forEach((chord, i) => {
            const row = Math.floor(i / SHEET_COLUMNS);
            const rowTop = GRID_TOP - row * rowH;
            const cx = MARGIN_X + (i % SHEET_COLUMNS) * cellW + cellW / 2;
            if (i % SHEET_COLUMNS === 0 && row > 0)
                page.drawLine({ start: { x: MARGIN_X, y: rowTop }, end: { x: A4.width - MARGIN_X, y: rowTop }, thickness: 0.5, color: light });

            drawText(page, chord.name, cx, rowTop - 20, 14, bold);
            if (chord.position) {
                const width = (strings - 1) * STRING_GAP * s;
                drawDiagram(page, chord.position, strings, cx - width / 2, rowTop - 32 - 8 * s, s, regular);
            }
        });
    }

    doc.setTitle(title);
    doc.setProducer("Zpěvník");
    doc.setCreator("Zpěvník");
    return doc.save();
}
