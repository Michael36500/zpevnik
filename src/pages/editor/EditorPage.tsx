import React, { useState } from "react"
import { Song, emptySong, lyricsToVerses, versesToLyrics } from "../../resources/model/songHelper"
import model from "../../resources/model/model"
import { Song as SongComponent } from "../../components/song"
import "./EditorPage.scss"
import NumberInput from "../../components/numberInput/NumberInput"
import { createSong } from "../../resources/api/song"


export default function EditorPage(){
        
    const [song, setSong] = useState<Song>(emptySong)
    const mode = model.settings.editorMode
    const updateSong = (name:string, value: any) => setSong({...song, [name]:value})

    const updateVerse = (key: number, name: string, lyrics: string) => {
        let verses = [...song.verses]
        if(lyrics.substring(lyrics.length-2) === "\n\n"){
            console.log(verses)
            let newName = (verses.slice(0,key+1).map(verse=>parseInt(verse.name)).filter(i=>i).pop()||0)+1+"."
            verses.splice(key+1,0,{name:newName, lyrics:""})
            setTimeout(()=>document.getElementById("verse-"+(key+1))?.focus(), 50)
        }
        else{
            verses[key] = {name: name, lyrics: lyrics}
        }
        updateSong("verses", verses)
    }

    const removeVerse = (key: number) => {
        let verses = [...song.verses]
        verses.splice(key, 1)
        updateSong("verses", verses)
    }

    const updateLyrics = (lyrics: string) => {
        console.log(lyricsToVerses(lyrics))
        updateSong("verses", lyricsToVerses(lyrics))
    }

    const clear = () => setSong(emptySong)

    const submit = () => {
        if(window.confirm("Opravdu chceš písničku odeslat?"))
        navigator.clipboard.writeText(versesToLyrics(song.verses))
        createSong(song).then(res => {
            alert("Písnička úspěšně přidána.")
            clear()
        }).catch(err => {
            alert("Při přidávání písničky došlo k chybě.")
        })
    }

    return <div id="editor-page">
        <div className={"editor "+mode+"-mode"}>
                <div className="grid">
                    <div className="label">Název:</div><input name="title" type="text" placeholder="Šnečí blues" value={song.title} onChange={e=>updateSong("title",e.target.value)}/>
                    <div className="label">Autor:</div><input name="author" type="text" placeholder="Jaromír Nohavica" value={song.author} onChange={e=>updateSong("author",e.target.value)}/>
                    <div className="label">Capo:</div><div>
                        <NumberInput min={0} max={11} defaultValue={song.capo} onChange={val=>updateSong("capo",val)}/>
                    </div>
                </div>
                <div className="verses">
                    {song.verses.map((verse, key) => <Verse
                        key={key}
                        id={key}
                        name={verse.name}
                        lyrics={verse.lyrics}
                        onChange={(name, lyrics)=>updateVerse(key, name, lyrics)}
                        onDelete={key => removeVerse(key)}
                    />)}
                </div>
                <div className="lyrics">
                    <textarea 
                        value={versesToLyrics(song.verses)}
                        onChange={e => updateLyrics(e.target.value)}  
                    />
                </div>
                <div className="submit">
                <div className="button" onClick={()=>submit()}>Odeslat</div>
                </div>
        </div>
        <div className="preview">
            <SongComponent
                song={song}
                columns={model.settings.columns}
                fontSize={model.settings.fontSize}
                trans={model.settings.transpose}
                transposeCapo={model.settings.transposeCapo}
                instrument={model.settings.chords}
            />
        </div>
    </div>
}

interface VerseProps {
    id: number,
    name: string,
    lyrics: string,
    onChange: (name: string, lyrics: string) => void
    onDelete: (key: number) => void
}

function Verse({id, name, lyrics, onChange=()=>{}, onDelete=()=>{}}:VerseProps){
    return <div className="verse">
        <input size={1} type="text" value={name} onChange={e=>onChange(e.target.value, lyrics)}/>
        <textarea 
            placeholder={(id===0)?"[G]Jednou [C7]jeden [G]šnek [D7]\n[G]šíle[C]ně se [G]lek’, [D7]\n[G]nikdo už dnes [G7]neví, z [C]čeho se tak [Cm]zjevil,\nže se [G]dal hned [D]na ú[G]těk.[D]":""} 
            id={"verse-"+id} 
            rows={5}
            value={lyrics} 
            onChange={e=>onChange(name, e.target.value)}/>
        <div className="remove" onClick={()=>onDelete(id)}>×</div>
    </div> 
}