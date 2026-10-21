import { normalize } from "../helpers";
import type { song } from "./model";

interface SongIndex {
    lyrics: string;
    chords: Set<string>;
}

//computed lazily, once per song object (songs are replaced when reloaded from server)
const index = new WeakMap<song, SongIndex>();

//semitone of each root name (Czech notation: B is B flat, H is B)
const ROOTS: { [root: string]: number } = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 10, H: 11,
};
const ROOT_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "B", "H"];

//reduces a chord to the few kinds a player picks from: "C", "Cm" or "C7"
//(bass notes and extensions are dropped, e.g. "Ami7/G" -> "Am", "Cmaj7" -> "C")
//returns null for things that are not chords ("rec", "3", "x", ...), those are assumed playable by everyone
export function canonicalChord(chord: string): string | null {
    const m = chord.trim().match(/^([A-H])([#b]?)((?:m|mi|maj|sus|dim|aug|add|\d|[+\-(/]).*|)$/);
    if (!m) return null;
    const note = ROOTS[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" && m[1] !== "B" ? -1 : 0);
    const suffix = m[3].replace(/\/.*$/, "");
    const quality = /^(m(?!aj)|mi)/.test(suffix) ? "m" : /^7/.test(suffix) ? "7" : "";
    return ROOT_NAMES[(note + 12) % 12] + quality;
}

//how a canonical chord ("D#m") is written in the scale the user picked in settings (e.g. "Ebm")
//noteName gives the name of a note (0 = C ... 11 = B/H) in that scale
export function chordLabel(chord: string, noteName: (id: number) => string | undefined): string {
    const m = chord.match(/^([A-H]#?)(m|7)?$/);
    const name = m && noteName(ROOT_NAMES.indexOf(m[1]));
    return name ? name.replace("b", "♭") + (m![2] || "") : chord;
}

function buildIndex(s: song): SongIndex {
    const chords = new Set<string>();
    const text = (Array.isArray(s.verses) ? s.verses : [])
        .map((v: any) => (typeof v?.lyrics === "string" ? v.lyrics : ""))
        .join("\n")
        .replace(/\[(.*?)\]/g, (_, chord: string) => {
            const c = canonicalChord(chord);
            if (c) chords.add(c);
            return "";
        })
        .replace(/\\h(?:skip)?{.*?}/g, "")
        .replace(/\|:|:\|/g, "");

    return { lyrics: normalize(text).replace(/\s+/g, " "), chords };
}

function getIndex(s: song): SongIndex {
    let i = index.get(s);
    if (!i) index.set(s, (i = buildIndex(s)));
    return i;
}

export function songChords(s: song): Set<string> {
    return getIndex(s).chords;
}

//every canonical chord used in the given songs, ordered by root, then C, Cm, C7
function rank(chord: string): number {
    const m = chord.match(/^([A-H][#]?)(m|7)?$/);
    return m ? ROOT_NAMES.indexOf(m[1]) * 3 + (m[2] === "m" ? 1 : m[2] === "7" ? 2 : 0) : 1000;
}

export function collectChords(songs: song[]): string[] {
    const all = new Set<string>();
    songs.forEach((s) => songChords(s).forEach((c) => all.add(c)));
    return Array.from(all).sort((a, b) => rank(a) - rank(b));
}

export function lyricsContain(s: song, query: string): boolean {
    return getIndex(s).lyrics.includes(normalize(query).replace(/\s+/g, " ").trim());
}

//songs playable using only the selected chords (and using at least one chord)
export function onlyUsesChords(s: song, selected: string[]): boolean {
    const chords = songChords(s);
    return chords.size > 0 && Array.from(chords).every((c) => selected.includes(c));
}
