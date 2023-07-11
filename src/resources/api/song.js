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
        verses: lyricsToVerses(s.lyrics)
    }
}

export function getCacheSongs(){
    let res = JSON.parse(localStorage.getItem("songs"))
    return res;
}

export async function getSongs(){
    let res = JSON.parse(localStorage.getItem("songs"))
    
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
    let newData = {...data, lyrics: versesToLyrics(data.verses)}
    delete newData.verses
    const record = await pocket.collection('song').create(newData).catch(err => {
        console.log(err)
        throw(err)
    })
    model.loadSongs()
    return record
}

export async function modifySong(id,data){
    let newData = {...data, lyrics: versesToLyrics(data.verses)}
    delete newData.verses
    const record = await  pocket.collection('song').update(id, {...newData, secret:model.settings.secret}).catch(err => {
        console.log(err)
        throw(err)
    })
    model.loadSongs()
    return record
}