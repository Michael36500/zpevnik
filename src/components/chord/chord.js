import React from 'react';
import './chord.scss';
import Diagram from '@tombatossals/react-chords/lib/Chord';
import guitar from '@tombatossals/chords-db/lib/guitar.json'
console.log(guitar)


const instrument = {
    ...guitar.main,
    key: guitar.keys,
    tunings: {
        standard: ["", "", "", "", "", ""]
    }
}

const notes = {
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
    "H":"B",
    "Hb":"Bb"
}


export class Chord extends React.Component {
    constructor() {
        super()
        this.state = {
            displayChart: false,
        }
    }

    render() {
        const chordName = this.props.children[0]
        let note = ""
        let suffix = ""
        suffix = chordName.replace(/[CDEFGAB]#?/g,n=>{note = notes[n]; return ""})
        if(suffix==="m") suffix = "minor"
        if(!suffix.length)suffix="major"
        const chord = guitar.chords[note].filter(chord => chord.suffix === suffix)[0]
        console.log(note,suffix,chord)

        return <span
            className="chord"
            onClick={() => {
                this.setState({ displayChart: !this.state.displayChart })
            }}>
            {this.props.children}
            {this.state.displayChart && <div className="chord-chart">
                <Diagram
                    chord={chord.positions[0]}   
                    instrument={instrument}
                />
            </div>}
        </span>
    }
}