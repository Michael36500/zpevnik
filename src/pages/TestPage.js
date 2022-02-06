import React from 'react';
import Chord from '@tombatossals/react-chords/lib/Chord'
import guitar from '@tombatossals/chords-db/lib/guitar.json'
import Markdown from 'markdown-to-jsx'


export default class TestPage extends React.Component {
    
    render() {
        const chord = guitar.chords["Csharp"][0].positions[0]
        const instrument = {
                ...guitar.main,
                key: guitar.keys,
                tunings: {
                    standard: ["","","","","",""]
                }
            }

        const name="1."
        const children = "[G]A proto [Em]prosím věř mi, [G]chtěl jsem ho [D7]žádat,\n[G]aby mi [Em]mezi dveřmi [G]pomohl [D7]hádat,\n[G]co mě čeká[Em] \\h{3em} [D7]a nemi[G]ne,\n[G]co mě čeká[Em] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [D7]a nemi[G]ne.\n"

        const rows = children.split("\n")
        const mappedRows = rows.map((row,key) => {
          let chords = 0;
          
          let newRow = row.replaceAll(/\[(.*?)\]/g, chord => {
            chords++;
            return `<chord>${chord.substring(1,chord.length-1)}</chord>`
          })
    
          replacers.forEach(rep => {
            newRow = newRow.replaceAll(rep.reg, x => rep.fun(x))
          })
    
          if(key===0) newRow = `<span class="before">${name}</span>`+newRow;
          return <p><Markdown>{newRow}</Markdown></p>
        })


        return <div className='page' id="test-page">
            <div className='chord' style={{width:"10em"}}>
                <Chord
                    chord={chord}
                    instrument={instrument}
                    lite={false}
                />
            </div>
            {mappedRows}
            
        </div>
    }
}

const replacers = [
    {
      reg: /\\h{(.*?)}/g,
      fun: str=>`<span class="hskip" style="width:${str.substring(3,str.length-1)}"> </span>`
    },
    {
      reg: /\\hskip{(.*?)}/g,
      fun: str=>`<span class="hskip" style="width:${str.substring(3,str.length-1)}"> </span>`
    },
    {
      reg: "|:",
      fun: x=>"𝄆"
    },
    {
      reg: ":|",
      fun: x=>"𝄇"
    },
  ]