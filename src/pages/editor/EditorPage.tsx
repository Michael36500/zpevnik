import React, { useEffect, useState } from "react"
import { Song, emptySong, lyricsToVerses, versesToLyrics } from "../../resources/model/songHelper"
import model from "../../resources/model/model"
import { Song as SongComponent } from "../../components/song"
import "./EditorPage.scss"
import NumberInput from "../../components/numberInput/NumberInput"
import { createSong, modifySong } from "../../resources/api/song"
import { useNavigate, useParams } from "react-router"


//status and message returned by PocketBase, so a failed save says why
function describeError(err: any){
    return [err?.status, err?.data?.message || err?.message, JSON.stringify(err?.data?.data || {})].join(" ")
}

export default function EditorPage(){
        
    const [song, setSong] = useState<Song>(emptySong)
    const mode = model.settings.editorMode
    const updateSong = (name:string, value: any) => setSong({...song, [name]:value})


    const { id } = useParams<string>();
    useEffect(()=>{
        const song = model.getSongById(id || "")
        if (song) setSong(song)
    }, [setSong, id])

    const updateVerse = (key: number, name: string, lyrics: string) => {
        let verses = [...song.verses]
        if(lyrics.substring(lyrics.length-4) === "\r\n\r\n"){
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
        if(song.verses.length<2)return
        let verses = [...song.verses]
        verses.splice(key, 1)
        updateSong("verses", verses)
    }

    const updateLyrics = (lyrics: string) => {
        updateSong("verses", lyricsToVerses(lyrics))
    }

    const clear = () => setSong(emptySong)

    const navigate = useNavigate()

    const submit = () => {
        if(window.confirm("Do you really want to submit?"))
        if(!id){
            createSong(song).then(res => {
                alert("Song created successfully.")
                navigate("/editor/"+res.id)
                clear()
            }).catch(err => {
                alert("Error creating song.\n"+describeError(err))
            })
        }
        else{
            modifySong(id,song).then(res => {
                alert("Song updated successfully.")
            }).catch(err => {
                alert("Error updating song.\n"+describeError(err))
            })
        }
        
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
                        onChange={e => updateLyrics(e.target.value.replaceAll("\n", "\r\n"))}  
                    />
                </div>
                <div className="submit">
                <div className="button" onClick={()=>submit()}>{id?"Edit":"Submit"}</div>
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
        <input size={1} type="text" value={name} onChange={e=>onChange(e.target.value.replaceAll("\n", "\r\n"), lyrics)}/>
        <textarea 
            placeholder={(id===0)?"[G]Jednou [C7]jeden [G]šnek [D7]\n[G]šíle[C]ně se [G]lek’, [D7]\n[G]nikdo už dnes [G7]neví, z [C]čeho se tak [Cm]zjevil,\nže se [G]dal hned [D]na ú[G]těk.[D]":""} 
            id={"verse-"+id} 
            rows={5}
            value={lyrics} 
            onChange={e=>onChange(name, e.target.value.replaceAll("\n", "\r\n"))}/>
        <div className="remove" onClick={()=>onDelete(id)}>×</div>
    </div> 
}