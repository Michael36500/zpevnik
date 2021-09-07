import React from 'react';
import './lyrics.scss';

export function Lyrics({children="",name=""}){
    if(typeof children !== "string")children=""
    if(typeof name !== "string")name=""
    const rows = children.split("\n")
    const mappedRows = rows.map((row,key) => {
      let chords = 0;
      
      let newRow = row.replaceAll(/\[(.*?)\]/g, chord => {
        chords++;
        return `<span class="chord">${chord.substring(1,chord.length-1)}</span>`
      })

      newRow = newRow.replaceAll(/\\h{(.*?)}/g, width => `<span class="hskip" style="width:${width.substring(3,width.length-1)}"> </span>`)

      if(key===0) newRow = `<span class="before">${name}</span>`+newRow;
      return <div className={"lyrics-line"+(chords?" with-chords":"")} dangerouslySetInnerHTML={{__html:newRow}}></div>
    })

    return <div className="chord-lyrics">
      {mappedRows}
    </div>
}

