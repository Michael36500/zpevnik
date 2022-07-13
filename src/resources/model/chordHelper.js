import model from "./model"
import guitar from '@tombatossals/chords-db/lib/guitar.json';
import ukulele from '@tombatossals/chords-db/lib/ukulele.json';

console.log(guitar)
console.log(ukulele)

class ChordHelper {
    static notes = [
        ["C", "B#", "H#"],
        ["C#", "Db"],
        ["D"],
        ["D#", "Eb"],
        ["E", "Fb"],
        ["F", "E#"],
        ["F#", "Gb"],
        ["G"],
        ["G#", "Ab"],
        ["A"],
        ["A#", "Bb", "Hb"],
        ["B", "H", "Cb"],
    ]

    static scales = [
        ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"],
        ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C"],
        ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "H", "C"],
        ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Hb", "H", "C"],
        ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "B", "H", "C"],
        ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "B", "H", "C"],
    ]

    static guitarScale = ["C", "Csharp", "D", "Eb", "E", "F", "Fsharp", "G", "Ab", "A", "Bb", "B"]
    static ukuleleScale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

    static getNoteId(string) {
        return this.notes.findIndex(row => row.includes(string))
    }

    //returns note name from selected scale in settings
    static getNoteNameById(id) {
        const scaleId = model.settings.preferedScale
        return this.scales?.[scaleId]?.[id]
    }

    static getNoteNameFromString(string) {
        return this.getNoteNameById(this.getNoteId(string))
    }

    static getTransposedNoteNameFromString(string, howMuch) {
        return this.getNoteNameById((this.getNoteId(string) + howMuch) % 12)
    }

    static getChordInfoFromString(string, trans) {
        if (typeof string !== "string") return undefined
        const ogNote = string.match(/[CDEFGABH][#b]?/)?.[0]
        if(!ogNote)return {name:string}
        const noteId = (this.getNoteId(ogNote) + trans) % 12;
        const suffix = string.replace(/[CDEFGABH][#b]?/, "")
        let diagramSuffix = suffix;
        if (diagramSuffix === "m" || diagramSuffix === "mi") diagramSuffix = "minor"
        if (diagramSuffix === "maj") diagramSuffix = "maj7"
        if (!diagramSuffix.length) diagramSuffix = "major"

        let chordInfo = {
            name: this.getNoteNameById(noteId) + suffix,
            diagrams: {
                guitar: guitar.chords?.[this.guitarScale[noteId]]?.filter(chord => chord.suffix === diagramSuffix)?.[0],
                ukulele: ukulele.chords?.[this.ukuleleScale[noteId]]?.filter(chord => chord.suffix === diagramSuffix)?.[0],
            }
        }


        return chordInfo
    }

    static instrumentGuitar = {
        ...guitar.main,
        key: guitar.keys,
        tunings: {
            standard: ["", "", "", "", "", ""]
        }
    }
    static instrumentUkulele = {
        ...ukulele.main,
        key: ukulele.keys,
        tunings: {
            standard: ["", "", "", ""]
        }
    }
}

export default ChordHelper

