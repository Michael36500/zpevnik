//table of contents of the songbook: alphabetical, with letters, page numbers and links
import { DrawItem, MARGIN_BOTTOM, MARGIN_TOP, MARGIN_X, Metrics, Page, sanitize, textWidth } from "./layout";

export interface TocEntry {
    title: string;
    author: string;
}

const SIZE = 9.5;
const ROW = 14.5;
const LETTER_SIZE = 12;
const LETTER_ROW = 24; //space for a letter heading incl. the gap above it
const COLUMNS = 2;
const COLUMN_GAP = 24;
const NUMBER_WIDTH = 26;

function ellipsize(m: Metrics, text: string, style: "regular" | "italic", size: number, max: number): string {
    if (textWidth(m, text, style) * size <= max) return text;
    let t = text;
    while (t.length > 1 && textWidth(m, t + "…", style) * size > max) t = t.slice(0, -1);
    return t.trimEnd() + "…";
}

export function letterOf(title: string): string {
    const first = Array.from(title.trim())[0] || "#";
    return /^\p{L}$/u.test(first) ? first.toLocaleUpperCase("cs") : "#";
}

//pageOf gives the page number of each song (the numbers do not change how much space the table needs)
export function layoutToc(
    entries: TocEntry[],
    m: Metrics,
    page: { width: number; height: number },
    pageOf: (i: number) => number,
    heading: string,
): Page[] {
    const colW = (page.width - 2 * MARGIN_X - (COLUMNS - 1) * COLUMN_GAP) / COLUMNS;
    const bottom = page.height - MARGIN_BOTTOM;
    const pages: Page[] = [];

    let items: DrawItem[] = [];
    let col = 0;
    let y = 0;
    let top = 0;
    let lastLetter = "";

    const newPage = () => {
        const first = pages.length === 0;
        items = [];
        pages.push({ width: page.width, height: page.height, items, numbered: false });
        col = 0;
        top = MARGIN_TOP;
        if (first) {
            const w = textWidth(m, heading, "bold") * 30;
            items.push({ t: "text", x: (page.width - w) / 2, y: MARGIN_TOP + 24, text: heading, style: "bold", size: 30 });
            top = MARGIN_TOP + 62;
        }
        y = top;
    };
    //moves to the next column (or page) when the needed height does not fit
    const room = (needed: number) => {
        if (y + needed <= bottom) return;
        if (col + 1 < COLUMNS) {
            col++;
            y = top;
        } else newPage();
    };
    newPage();

    entries.forEach((entry, i) => {
        const letter = letterOf(entry.title);
        if (letter !== lastLetter) {
            room(LETTER_ROW + ROW);
            if (y > top) y += LETTER_ROW - ROW;
            const x = MARGIN_X + col * (colW + COLUMN_GAP);
            y += LETTER_SIZE;
            items.push({ t: "text", x, y, text: letter, style: "bold", size: LETTER_SIZE });
            items.push({ t: "line", x1: x + 18, y1: y - 3.5, x2: x + colW, y2: y - 3.5, w: 0.5, gray: 0.75 });
            y += ROW - LETTER_SIZE + 2;
            lastLetter = letter;
        }
        room(ROW);
        const x = MARGIN_X + col * (colW + COLUMN_GAP);
        const baseline = y + SIZE + 2;
        const room2 = colW - NUMBER_WIDTH - 6;

        const title = ellipsize(m, sanitize(m, entry.title), "regular", SIZE, room2);
        const titleW = textWidth(m, title, "regular") * SIZE;
        items.push({ t: "text", x, y: baseline, text: title, style: "regular", size: SIZE });
        let end = x + titleW;

        const left = room2 - titleW - 8;
        const author = sanitize(m, entry.author).trim();
        if (author && left > 30) {
            const a = ellipsize(m, author, "italic", SIZE - 1.5, left);
            items.push({ t: "text", x: end + 6, y: baseline, text: a, style: "italic", size: SIZE - 1.5, gray: 0.5 });
            end += 6 + textWidth(m, a, "italic") * (SIZE - 1.5);
        }

        const number = String(pageOf(i));
        const numW = textWidth(m, number, "regular") * SIZE;
        items.push({ t: "text", x: x + colW - numW, y: baseline, text: number, style: "regular", size: SIZE });
        if (x + colW - numW - end > 14)
            items.push({
                t: "line",
                x1: end + 4,
                y1: baseline - 1.2,
                x2: x + colW - numW - 4,
                y2: baseline - 1.2,
                w: 0.7,
                gray: 0.65,
                dash: [0.1, 2.6],
            });
        items.push({ t: "link", x, y, w: colW, h: ROW, page: pageOf(i) - 1 });
        y += ROW;
    });
    return pages;
}
