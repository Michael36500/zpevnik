import React from 'react';
import { Lyrics } from '../lyrics';
import './song.scss';


const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]

function transpose(lyrics="", howMuch=0){
  if(typeof lyrics !== "string")return ""
  return lyrics.replaceAll(/\[(.*?)\]/g,chord => {
    return chord.replaceAll(/[CDEFGAB]#?/g, note => {
      return notes[(notes.indexOf(note)+howMuch)%notes.length]
    })
  })
}

export function Song({song,columns=1, fontSize=20, trans=0, swipes={}, transposeCapo=false, instrument=""}){
    let capo = (12 + song.capo - (transposeCapo?trans:0))%12
    let displayCapo = !!capo || !!song.capo;


    return <div id="song" style={{fontSize:fontSize}} {...swipes}>
        <div id="song-head">
          <h1 className="title">{song.title}</h1>
          <h2 className="author">{song.author}</h2>
        </div>
        <div id="lyrics" className="lyrics" style={{columnCount:columns}}>
            {!!displayCapo&&<div className="capo">Capo {capo}</div>}
            {song.verses?.map((verse,k) => {
                return <div className="verse" key={k}>
                <Lyrics name={verse.name} instrument={instrument}>
                    {transpose(verse.lyrics, trans)}
                </Lyrics></div>
            })}
        </div>
    </div>
}

