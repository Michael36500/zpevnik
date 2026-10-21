//pdf export used by the app: reads songs and settings from the model, then downloads the file
import ChordHelper from "../model/chordHelper";
import model from "../model/model";
import boldItalicUrl from "../../assets/fonts/Nunito-BoldItalic.ttf";
import boldUrl from "../../assets/fonts/Nunito-Bold.ttf";
import italicUrl from "../../assets/fonts/Nunito-Italic.ttf";
import regularUrl from "../../assets/fonts/Nunito-Regular.ttf";
import type { LayoutOptions, PdfSong } from "./build";

const FONT_SIZE = 12;
const A4 = { width: 595.28, height: 841.89 };
const A4_LANDSCAPE = { width: A4.height, height: A4.width };

let fonts: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer; italic: ArrayBuffer; boldItalic: ArrayBuffer }> | null = null;

//fonts are part of the app (and cached by the service worker), loaded when the first pdf is made
function loadFonts() {
    const get = (url: string) =>
        fetch(url).then((r) => {
            if (!r.ok) throw new Error("Font not found");
            return r.arrayBuffer();
        });
    if (!fonts)
        fonts = Promise.all([get(regularUrl), get(boldUrl), get(italicUrl), get(boldItalicUrl)])
            .then(([regular, bold, italic, boldItalic]) => ({ regular, bold, italic, boldItalic }))
            .catch((err) => {
                fonts = null;
                throw err;
            });
    return fonts;
}

function chordName(token: string, transpose: number, scale: number): string {
    try {
        return ChordHelper.getChordInfoFromString(token, transpose, scale)?.name || token;
    } catch (e) {
        return token;
    }
}

function toPdfSong(s: any): PdfSong {
    return {
        id: s.id,
        title: s.title || "",
        author: s.author || "",
        capo: s.capo || 0,
        verses: Array.isArray(s.verses) ? s.verses : [],
    };
}

function save(bytes: Uint8Array, name: string) {
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

const fileName = (title: string) => (title.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "zpevnik") + ".pdf";

//the song as it looks on the screen now: transposition, capo, chords and columns from settings
export async function downloadSong(song: any) {
    const [{ buildPdf }, bytes] = await Promise.all([import("./build"), loadFonts()]);
    const s = model.settings;
    const columns = Math.max(1, s.columns || 1);
    const layout: LayoutOptions = {
        fontSize: FONT_SIZE,
        columns,
        chords: !!s.displayChords,
        transpose: s.transpose || 0,
        scale: s.preferedScale || 0,
        transposeCapo: !!s.transposeCapo,
        yeet: !!s.yeet,
        page: columns > 1 ? A4_LANDSCAPE : A4,
    };
    const pdf = await buildPdf([toPdfSong(song)], bytes, {
        layout,
        chordName,
        title: song.title || "Zpěvník",
        songbook: false,
    });
    save(pdf, fileName(song.title));
}

//every song in alphabetical order, default settings (one column, no transposition, chords on)
export async function downloadSongbook(onProgress?: (done: number, total: number) => void) {
    const [{ buildPdf }, bytes] = await Promise.all([import("./build"), loadFonts()]);
    const songs = [...((model.state.songs as any[]) || [])]
        .filter((s) => s && (s.title || s.verses?.length))
        .sort((a, b) => (a.title || "").localeCompare(b.title || "", "cs"))
        .map(toPdfSong);
    const layout: LayoutOptions = {
        fontSize: FONT_SIZE,
        columns: 1,
        chords: true,
        transpose: 0,
        scale: 0,
        transposeCapo: false,
        yeet: false,
        page: A4,
    };
    const pdf = await buildPdf(songs, bytes, { layout, chordName, title: "Zpěvník", songbook: true, onProgress });
    save(pdf, "zpevnik.pdf");
}

//one column of the chord sheet each (as written in songs)
const SHEET_SUFFIXES = ["", "m", "7", "m7", "maj7", "sus4"];

//every note with the basic chords and how to play them, named in the scale from settings
export async function downloadChordSheet(instrument: "guitar" | "ukulele") {
    const [{ buildChordSheet }, bytes] = await Promise.all([import("./chordsheet"), loadFonts()]);
    const scale = model.settings.preferedScale || 0;
    const chords = ChordHelper.notes.reduce((all, note) => {
        SHEET_SUFFIXES.forEach((suffix) => {
            const info: any = ChordHelper.getChordInfoFromString(note[0] + suffix, 0, scale);
            all.push({ name: info?.name || note[0] + suffix, position: info?.diagrams?.[instrument]?.positions?.[0] });
        });
        return all;
    }, [] as { name: string; position?: any }[]);
    const title = `All chords for ${instrument}`;
    save(await buildChordSheet(instrument, chords, bytes, title), `${title}.pdf`);
}
