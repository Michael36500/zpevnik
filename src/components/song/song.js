import React from 'react';
import ChordHelper from '../../resources/model/chordHelper';
import { Lyrics } from '../lyrics';
import './song.scss';

function transpose(lyrics="", howMuch=0){
  if(typeof lyrics !== "string")return ""
  return lyrics.replaceAll(/\[(.*?)\]/g,chord => {
    return chord.replaceAll(/[CDEFGAB][#b]?/g, note => {
      return ChordHelper.getNoteNameById((ChordHelper.getNoteId(note)+howMuch)%12)
    })
  })
}

export function Song({song,columns=1, fontSize=20, trans=0,transposeCapo=false, instrument=""}){

    let capo = (12 + song.capo - (transposeCapo?trans:0))%12
    let displayCapo = !!capo || !!song.capo;


    return <div id="song" style={{fontSize:fontSize}}>
        <div id="song-head">
          <h1 className="title">{song.title}</h1>
          <h2 className="author">{song.author}</h2>
        </div>
        <div id="lyrics" className="lyrics" style={{columnCount:columns}}>
            {!!displayCapo&&<div className="capo">Capo {capo}</div>}
            {song.verses?.map((verse,k) => {
                return <div className="verse" key={k}>
                <Lyrics name={verse.name} instrument={instrument}>
                    {verse.lyrics}
                </Lyrics></div>
            })}
        </div>
    </div>
}

