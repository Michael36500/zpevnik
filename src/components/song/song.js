import React from 'react';
import './song.scss';
import { Lyrics } from '../lyrics';
import { Link } from 'react-router-dom';


const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]

function transpose(lyrics="", howMuch=0){
  if(typeof lyrics !== "string")return ""
  return lyrics.replaceAll(/\[(.*?)\]/g,chord => {
    return chord.replaceAll(/[CDEFGAB]#?/g, note => {
      return notes[(notes.indexOf(note)+howMuch)%notes.length]
    })
  })
}

export function Song({song,columns=1, fontsize=20, trans=0, swipes={}, prev, next}){
    return <div id="song" style={{fontSize:fontsize}} {...swipes}>
        <Link className="notA" to={"/"+prev}><div className="prev"><i className="fas fa-chevron-left"></i></div></Link>
        <Link className="notA" to={"/"+next}><div className="next"><i className="fas fa-chevron-right"></i></div></Link>
        <div id="song-head">
          <h1 className="title">{song.title}</h1>
          <h2 className="author">{song.author}</h2>
        </div>
        <div id="lyrics" className="lyrics" style={{columnCount:columns}}>
            {!!song.capo&&<div className="capo">Capo {song.capo}</div>}
            {song.verses?.map((verse,k) => {
                return <div className="verse" key={k}>
                <Lyrics name={verse.name}>
                    {transpose(verse.lyrics, trans)}
                </Lyrics></div>
            })}
        </div>
    </div>
}

