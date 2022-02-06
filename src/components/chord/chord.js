import React from 'react';
import './chord.scss';
import Diagram from '@tombatossals/react-chords/lib/Chord';
import guitar from '@tombatossals/chords-db/lib/guitar.json';
import ukulele from '@tombatossals/chords-db/lib/ukulele.json';

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
    "H":"B",
    "Hb":"Bb"
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
        const chordName = this.props.children[0] //[Em G Em]

        let diagram = false, instrument, note="", suffix="", chord

        if(["guitar","ukulele"].includes(this.props.instrument)){  //if chords turned on          
            diagram = true;
            const chords = (this.props.instrument==="guitar")?guitar:ukulele
            const notes = (this.props.instrument==="guitar")?notesGuitar:notesUkulele

            instrument = {
                ...chords.main,
                key: chords.keys,
                tunings: {
                    standard: ["", "", "", "", "", ""]
                }
            }
            
            //get chord suffix
            suffix = chordName.replace(/[CDEFGAB]#?/,n=>{note = notes[n]; return ""}) //get note (/g za regexem by nahradilo všechny)
            if(suffix==="m" || suffix==="mi") suffix = "minor"
            if(!suffix.length)suffix="major"

            console.table({chordName, note, suffix})
            
            chord = chords.chords?.[note]?.filter(chord => chord.suffix === suffix)?.[0]
            
            console.log(chord||"fail")
            if(!chord)diagram = false;
            
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