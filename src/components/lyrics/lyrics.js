import React from 'react';
import './lyrics.scss';

export function Lyrics({children}){
    if(!typeof children === "String")return <p></p>
    const rows = children.split("\n")
    const mappedRows = rows.map(row => {
      let chords = 0;
      const newRow = row.replaceAll(/\[(.*?)\]/g, chord => {
        chords++;
        return `<span class="chord">${chord.substring(1,chord.length-1)}</span>`
      })
      return <div className={"lyrics-line"+(chords?" with-chords":"")} dangerouslySetInnerHTML={{__html:newRow}}></div>
    })

    return <div className="chord-lyrics">
      {mappedRows}
    </div>
}

