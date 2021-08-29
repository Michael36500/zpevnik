import React from 'react';
import './song.scss';
import { Lyrics } from '../lyrics';


const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]

function transpoze(lyrics="", howMuch=0){
  if(typeof lyrics !== "string")return ""
  return lyrics.replaceAll(/\[(.*?)\]/g,chord => {
    return chord.replaceAll(/[CDEFGAB]#?/g, note => {
      return notes[(notes.indexOf(note)+howMuch)%notes.length]
    })
  })
}

export function Song({song,columns=1, fontsize=20, trans=0}){
    return <div id="song" style={{fontSize:fontsize}}>
        <h1 className="title">{song.title}</h1>
        <h2 className="author">{song.author}</h2>
        <div className="lyrics" style={{columnCount:columns}}>
            {!!song.capo&&<div className="capo">Capo {song.capo}</div>}
            {song.verses?.map(verse => {
                return <div className="verse">
                <Lyrics name={verse.name}>
                    {transpoze(verse.lyrics, trans)}
                </Lyrics></div>
            })}
        </div>
    </div>
}

