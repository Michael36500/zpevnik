
export interface Verse {name: string, lyrics: string}

export interface Song {
    id: string,
    title: string,
    author: string,
    capo: number, 
    sfw: boolean,
    verses: Verse[]
}

export function lyricsToVerses(lyrics: string): Verse[]{
    let verseNames: string[] = []
    lyrics.replaceAll(/<.*>/g, (x: string) => {verseNames.push(x.slice(1,-1)); return x})
    let verses = lyrics.split(/<.*>\n/g).slice(1)
    console.log(verseNames, verses)
    return verses.map((verse, key) => ({name:verseNames[key], lyrics:verse}))
}

export function versesToLyrics(verses: Verse[]): string{
    console.log(verses)
    const lyrics =  verses.reduce((acc, verse) => {
        return acc + "<"+verse.name+">\n" + verse.lyrics;
    },"")
    console.log(lyrics)
    return(lyrics)
}

export const emptySong:Song = {
    id: "",
    title: "",
    author: "",
    capo: 0,
    sfw: true,
    verses: [
        {name: "1.", lyrics: ""}
    ]
}