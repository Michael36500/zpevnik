import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { Song } from '../components/song';
import model from '../resources/model/model';
import './SongPage.scss';

let prevFunct = () => { };
let nextFunct = () => { };
window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") {
        nextFunct();
    }
    if (e.key === "ArrowLeft")
        prevFunct();
})

export default function SongPage() {
    const song = model.currentSong || {};
    const songIDs = model.songIDs;
    const next = songIDs[(songIDs.indexOf(song.id) + 1) % (songIDs.length)]
    const prev = songIDs[(songIDs.indexOf(song.id) + songIDs.length - 1) % (songIDs.length)]

    const navigate = useNavigate()

    const handlers = useSwipeable({
        onSwipedLeft: () => { navigate("/" + next) },
        onSwipedRight: () => { navigate("/" + prev) },
    })
    prevFunct = () => { navigate("/" + prev) }
    nextFunct = () => { navigate("/" + next) }

    function handleKeyDown(event) {
        if (event.key === "+") {
            console.log('plus');
            model.setSettings({ transpose: Math.min(model.setting('transpose') + 1, 12) })
        } else if (event.key === "-") {
            console.log('minus');
            model.setSettings({ transpose: Math.max(model.setting('transpose') - 1, 0) })
        }
    }

    return <>
        <Link className="notA" to={"/" + prev}><div className="prev"><i className="fas fa-chevron-left"></i></div></Link>
        <Link className="notA" to={"/" + next}><div className="next"><i className="fas fa-chevron-right"></i></div></Link>
        <div className="page" id="song-page" {...(model.settings.swipeGesturesPrevNext ? handlers : {})} onKeyDown={handleKeyDown} tabIndex={0}>
            <Song
                song={song}
                columns={model.settings.columns}
                fontSize={model.settings.fontSize}
                trans={model.settings.transpose}
                transposeCapo={model.settings.transposeCapo}
                instrument={model.settings.chords}
            />
        </div>
    </>
}