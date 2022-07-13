import React from 'react';
import ChordHelper from '../../resources/model/chordHelper';
import model from '../../resources/model/model';
import './ChordBox.scss';
import Diagram from '@tombatossals/react-chords/lib/Chord';

export function ChordBox({ children }) {
    let string = children?.[0]
    if (typeof string !== "string") string = ""

    let chords = string.split(" ")

    return <span className='chord-box'>
        {chords.map(c => {
            return <Chord chord={c} />
        })}
    </span>

}


class Chord extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            diagramOpen: false
        }
    }

    render() {
        const chordInfo = ChordHelper.getChordInfoFromString(this.props.chord, model.settings.transpose)

        let chord = chordInfo?.diagrams?.[model.settings.chords]?.positions?.[0]

        return <span className='chord' onClick={()=>this.setState({diagramOpen:!this.state.diagramOpen})}>
            {this.state.diagramOpen && ["guitar", "ukulele"].includes(model.settings.chords) && <div className="chord-chart">
                {chord?<Diagram
                    chord={chord}
                    instrument={
                        {
                            "guitar":ChordHelper.instrumentGuitar,
                            "ukulele":ChordHelper.instrumentUkulele,
                        }[model.settings.chords]
                    }
                />:<span className='no-chord'>
                    😢    
                </span>}
            </div>}
            {chordInfo?.name||"ERR"}
        </span>
    }
}





/*



export class Chord extends React.Component {
    constructor() {
        super()
        this.state = {
            displayChart: false,
        }
    }

    render() {
        const chordName = this.props.children[0] //[Em G Em]

        let diagram = false, instrument, note = "", suffix = "", chord

        if (["guitar", "ukulele"].includes(this.props.instrument)) {  //if chords turned on          
            diagram = true;
            const chords = (this.props.instrument === "guitar") ? guitar : ukulele
            const notes = (this.props.instrument === "guitar") ? notesGuitar : notesUkulele

            instrument = {
                ...chords.main,
                key: chords.keys,
                tunings: {
                    standard: ["", "", "", "", "", ""]
                }
            }

            //get chord suffix
            suffix = chordName.replace(/[CDEFGAB]#?/, n => { note = notes[n]; return "" }) //get note (/g za regexem by nahradilo všechny)
            if (suffix === "m" || suffix === "mi") suffix = "minor"
            if (suffix === "maj") suffix = "maj7"
            if (!suffix.length) suffix = "major"

            chord = chords.chords?.[note]?.filter(chord => chord.suffix === suffix)?.[0]

            if (!chord) diagram = false;

        }



        return <span>
            <span
                className="chord unselectable"
                onClick={() => {
                    this.setState({ displayChart: !this.state.displayChart })
                }}>
                {this.props.children}
                {diagram && this.state.displayChart && <div className="chord-chart">
                    <Diagram
                        chord={chord.positions[0]}
                        instrument={instrument}
                    />
                </div>}
            </span>

        </span>
    }
}


const notesGuitar = {
    "C": "C",
    "C#": "Csharp",
    "Db": "Csharp",
    "D": "D",
    "D#": "Eb",
    "Eb": "Eb",
    "E": "E",
    "F": "F",
    "F#": "Fsharp",
    "Gb": "Fsharp",
    "G": "G",
    "G#": "Ab",
    "Ab": "Ab",
    "A": "A",
    "A#": "Bb",
    "Bb": "Bb",
    "B": "B",
    "H": "B",
    "Hb": "Bb"
}

const notesUkulele = {
    "C": "C",
    "C#": "Db",
    "Db": "Db",
    "D": "D",
    "D#": "Eb",
    "Eb": "Eb",
    "E": "E",
    "F": "F",
    "F#": "Gb",
    "Gb": "Gb",
    "G": "G",
    "G#": "Ab",
    "Ab": "Ab",
    "A": "A",
    "A#": "Bb",
    "Bb": "Bb",
    "B": "B",
    "H": "B",
    "Hb": "Bb"
}


*/