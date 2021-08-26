import React from 'react';
import './song.scss';
import { Lyrics } from '../lyrics';

export function Song({song,columns=1}){
    return <div className="song">
        <h1 className="title">{song.title}</h1>
        <h2 className="author">{song.author}</h2>
        <div className="lyrics" style={{columnCount:columns}}>
            {song.verses?.map(verse => {
                return <div className="verse"><Lyrics>
                    {verse.lyrics}
                </Lyrics></div>
            })}
        </div>
    </div>
}