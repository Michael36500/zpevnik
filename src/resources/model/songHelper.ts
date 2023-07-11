
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
    console.log(JSON.stringify(lyrics))

    lyrics=lyrics.replace(/<.*>\r\n/,"")
    let verses = lyrics.split(/\r\n<.*>\r\n/g)
    console.log(verseNames,verses)
    return verses.map((verse, key) => ({name:verseNames[key], lyrics:verse}))
}

export function versesToLyrics(verses: Verse[]): string{
    const lyrics =  verses.reduce((acc, verse, key, arr) => {
        return acc + "<"+verse.name+">\r\n" + verse.lyrics + (key===arr.length-1?"":"\r\n");
    },"")
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