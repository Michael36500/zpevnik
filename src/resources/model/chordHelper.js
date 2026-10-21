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
    //scaleId defaults to the scale selected in settings
    static getNoteNameById(id, scaleId = model.settings.preferedScale) {
        return this.scales?.[scaleId]?.[id]
    }

    static getNoteNameFromString(string) {
        return this.getNoteNameById(this.getNoteId(string))
    }

    static getTransposedNoteNameFromString(string, howMuch, scaleId) {
        return this.getNoteNameById((this.getNoteId(string) + howMuch) % 12, scaleId)
    }

    static getChordInfoFromString(string, trans, scaleId) {
        if (typeof string !== "string") return undefined
        const ogNote = string.match(/[CDEFGABH][#b]?/)?.[0]
        if(!ogNote || this.getNoteId(ogNote) < 0)return {name:string}
        const noteId = (this.getNoteId(ogNote) + trans) % 12;
        let suffix = string.replace(/[CDEFGABH][#b]?/, "") 
        suffix = suffix.replace(/\/[CDEFGABH][#b]?/, (str) => {
            const note = str.substring(1,str.length)
            return "/"+this.getTransposedNoteNameFromString(note, trans, scaleId)
        })
        if (suffix === "mi") suffix = "m"
        let diagramSuffix = suffix;
        if (diagramSuffix === "m" || diagramSuffix === "mi") diagramSuffix = "minor"
        if (diagramSuffix === "maj") diagramSuffix = "maj7"
        if (!diagramSuffix.length) diagramSuffix = "major"

        let chordInfo = {
            name: this.getNoteNameById(noteId, scaleId).replace("b","♭") + suffix,
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

