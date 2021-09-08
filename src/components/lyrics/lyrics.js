import React from 'react';
import './lyrics.scss';

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
    reg: /\*\*(.*?)\*\*/g,
    fun: str=>`<span class="bold">${str.substring(2,str.length-2)}</span>`
  },
  {
    reg: /\*(.*?)\*/g,
    fun: str=>`<span class="italic">${str.substring(1,str.length-1)}</span>`
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

      replacers.forEach(rep => {
        newRow = newRow.replaceAll(rep.reg, x => rep.fun(x))
      })

      if(key===0) newRow = `<span class="before">${name}</span>`+newRow;
      return <div className={"lyrics-line"+(chords?" with-chords":"")} key={key} dangerouslySetInnerHTML={{__html:newRow}}></div>
    })

    return <div className="chord-lyrics">
      {mappedRows}
    </div>
}

