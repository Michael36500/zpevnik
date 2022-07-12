import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { Song } from '../components/song';
import model from '../resources/model/model';
import './SongPage.scss';

export default function SongPage() {
    const song = model.currentSong || {};
    const songIDs = model.songIDs;
    const next = songIDs[(songIDs.indexOf(song.id) + 1) % (songIDs.length)]
    const prev = songIDs[(songIDs.indexOf(song.id) + songIDs.length - 1) % (songIDs.length)]

    const history = useHistory()
    const handlers = useSwipeable({
        onSwipedLeft: () => { history.push("/" + next) },
        onSwipedRight: () => { history.push("/" + prev) },
    })

    return <div className="page" id="song-page" {...handlers}>
        <Link className="notA" to={"/" + prev}><div className="prev"><i className="fas fa-chevron-left"></i></div></Link>
        <Link className="notA" to={"/" + next}><div className="next"><i className="fas fa-chevron-right"></i></div></Link>
        <Song
            song={song}
            columns={model.settings.columns}
            fontSize={model.settings.fontSize}
            trans={model.settings.transpose}
            transposeCapo={model.settings.transposeCapo}
            instrument={model.settings.chords}
        />
    </div>
}