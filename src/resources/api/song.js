import { pocket } from "../pocket/pocket";

function lyricsToVerses(lyrics){
    let verseNames = []
    lyrics.replaceAll(/<.*>/g, x => verseNames.push(x.slice(1,-1)))
    let verses = lyrics.split(/<.*>\r\n/g).slice(1)
    return verses.map((verse, key) => ({name:verseNames[key], lyrics:verse}))
}

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
    data.lyrics = data.verses.reduce((acc, verse) => {
        return acc + "<"+verse.name+">\n" + verse.lyrics + "\n\n";
    },"")
    delete data.verses;
    return pocket.collection('song').create(data).catch(err => {
        alert("Song creation failed!");
        console.log(err);
        throw(err);
    });
}