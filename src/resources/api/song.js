import model from "../model/model";
import { lyricsToVerses, versesToLyrics } from "../model/songHelper";
import { pocket } from "../pocket/pocket";

function mapSong(s){
    return {
        id: s.id,
        title: s.title || "",
        author: s.author || "",
        capo: s.capo || 0,
        sfw: s.sfw || false,
        international: s.international || false,
        genre: Array.isArray(s.genre) ? s.genre : [],
        //new servers store verses, the old one stores lyrics as text
        verses: Array.isArray(s.verses) ? s.verses : lyricsToVerses(s.lyrics || "")
    }
}

//only the fields the editor works with (id and the server's own fields are not sent back)
function songData(song){
    const {title, author, capo, sfw, international, genre, verses} = mapSong(song)
    return {title, author, capo, sfw, international, genre, verses, lyrics: versesToLyrics(verses)}
}

export function getCacheSongs(){
    let res = JSON.parse(localStorage.getItem("songs"))
    //cache may come from an older version of the app, so bring it to the current shape
    if(Array.isArray(res)) res = res.map(s => mapSong(s))
    return res;
}

export async function getSongs(){
    let res = getCacheSongs()
    
    try {
        res = await pocket.collection("song").getFullList(1000)
        res = res.map(s => mapSong(s))
        localStorage.setItem("songs",JSON.stringify(res))
    } catch (error) {
        console.log(error)
    }

    return res
}

export async function createSong(data){
    const record = await pocket.collection('song').create(songData(data)).catch(err => {
        console.log(err)
        throw(err)
    })
    await model.loadSongs()
    return record
}

export async function modifySong(id,data){
    const record = await pocket.collection('song').update(id, {...songData(data), secret:model.settings.secret}).catch(err => {
        console.log(err)
        throw(err)
    })
    await model.loadSongs()
    return record
}