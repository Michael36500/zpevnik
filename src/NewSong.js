import React from 'react';
import './NewSong.scss';
import { createSong } from './resources/api/song';

export default class NewSong extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            song: {
                title: "",
                author: "",
                capo: 0,
                sfw: true,
                verses: [
                    {
                        lyrics: "", 
                        name:"1."
                    }
                ],
            }
        }
    }

    clear(){
        this.setState({song: {
            title: "",
            author: "",
            capo: 0,
            sfw: true,
            verses: [
                {
                    lyrics: "", 
                    name:"1."
                }
            ],
        }})    
    }

    input(e){
        let song = {...this.state.song};
        if(e.target.type==="checkbox"){
            song[e.target.name] = !song[e.target.name]
        }
        else{
            song[e.target.name] = e.target.value
        }
        this.setState({song:song})
    }

    editVerse(key,name, value){
        let song = this.state.song
        if(name==="name"){
            song.verses[key].name=value;
        }else if(name==="lyrics"){
            if(value.substring(value.length-2)==="\n\n"){//create new verse
                song.verses.push({
                    name:(song.verses.map(verse=>parseInt(verse.name)).filter(i=>i).sort().reverse()?.[0]||0)+1+".",
                    lyrics:""
                })
                song.verses[key].lyrics=value.substring(0,value.length-2);
                this.setState({song:song}, () => {
                    document.getElementById("v"+(key+1)+"-lyrics").focus()
                })
                return
            }
            else{
                song.verses[key].lyrics=value;
            }
        }
        this.setState({song:song})
    }

    deleteVerse(key){
        let song = this.state.song
        if(song.verses.length<=1)return
        song.verses.splice(key,1)
        this.setState({song:song})
    }

    submit(){
        if(window.confirm("Opravdu chcete písničku odeslat?"))
        createSong(this.state.song).then(res => {
            alert("Písnička úspěšně přidána.")
            this.clear()
        }).catch(err => {
            console.log(err)
        })
    }

    render(){
        const song = this.state.song;
        return <div id="new-song">
            <h1>Nová písnička</h1>
            <div className="grid">
                <div className="label">Název:</div><input name="title" type="text" placeholder="Šnečí blues" value={song.title} onChange={e=>this.input(e)}/>
                <div className="label">Autor:</div><input name="author" type="text" placeholder="Jaromír Nohavica" value={song.author} onChange={e=>this.input(e)}/>
                <div className="label">Capo:</div><input name="capo" type="number" min="0" placeholder="Capo" value={song.capo} onChange={e=>this.input(e)}/>
                <label><input name="sfw" type="checkbox" checked={song.sfw} onChange={e=>this.input(e)}/>sfw</label>
            </div>

            <h2>Sloky</h2>
            <div className="verses">
                {song.verses?.map((verse,key) => {
                    return <>
                        <input size="1" type="text" value={verse.name} onChange={e=>this.editVerse(key,"name",e.target.value)}/>
                        <textarea placeholder={(key===0)&&"[G]Jednou [C7]jeden [G]šnek [D7]\n[G]šíle[C]ně se [G]lek’, [D7]\n[G]nikdo už dnes [G7]neví, z [C]čeho se tak [Cm]zjevil,\nže se [G]dal hned [D]na ú[G]těk.[D]"} id={"v"+key+"-lyrics"} rows="5" cols="100" value={verse.lyrics} onChange={e=>this.editVerse(key,"lyrics",e.target.value)}/>
                        <div className="remove" onClick={()=>this.deleteVerse(key)}>×</div>
                    </> 
                })}
            </div>

            <div className="button" onClick={()=>this.submit()}>
                Odeslat
            </div>
        </div>
    }
}