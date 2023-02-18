import React from 'react';
import InputRange from 'react-input-range';
import { Link } from 'react-router-dom';
import model from '../resources/model/model';

export default class Toolbar extends React.Component {
    constructor() {
        super()
        this.state = {
            popup: "",
        }
    }

    togglePopup(id) {
        if (this.state.popup === id) this.setState({ popup: "" })
        else this.setState({ popup: id })
    }

    toggleColumns() {
        let c = model.settings.columns;
        c = c >= 3 ? 1 : c + 1
        model.setSettings({ columns: c })
    }

    async autoFit() {

        const alb = !model.settings.lineBreak //avoid line break
        
        const delay = model.settings.autofitIntervalDelay;
        let songH = ()=>document.getElementById("lyrics")?.clientHeight + model.settings.fontSize   
        let songW = ()=>document.getElementById("lyrics")?.clientWidth  + model.settings.fontSize   

        let mainH = ()=>document.getElementById("main")?.clientHeight
        let mainW = ()=>document.getElementById("main")?.clientWidth
        if (!songH() || !mainH()) return
        
        function correct(val){
            const curFS = model.settings.fontSize
            let fs = (curFS*10 + val*10)/10
            model.setSettings({fontSize:fs})
        }

        if(songH()<mainH()){ //make font-size bigger
            let i = setInterval(()=>{
                correct(.1)
                if(songH()>mainH() || songW()>mainW()){
                    clearInterval(i)
                    correct(-.1)
                    document.getElementById("lyrics")?.scrollIntoView()
                }
            },delay)   
        }

        if(songH()>mainH() || songW()>mainW()){
            let i = setInterval(()=>{
                correct(-.1)
                if(songH()<mainH() && (!alb || songW()<mainW())){
                    document.getElementById("lyrics")?.scrollIntoView()
                    clearInterval(i)
                }
            },delay)   
        }

    }

    toggleFavorite(id) {
        let favorites = [...model.settings.favorites]
        if (favorites.includes(id)) {
            favorites.splice(favorites.indexOf(id), 1)
        }
        else {
            favorites.push(id)
        }
        model.setSettings({favorites:favorites})
    }

    render() {
        const settings = model.settings
        const song = model.currentSong||{}
        const session = model.state?.session?.online?(model.state.session.leader?"s-lead":"s-online"):""
        return <div id={"toolbar"} className={session}>
            <i className="button fas fa-bars" onClick={() => this.props.toggleSidebar()}></i>
            <div className="spacer"></div>
            <Link to="/settings" className="notA button" title="Settings"><i className="fas fa-cog"></i></Link>
            {!!settings.showRandomSongButton && <Link to={"/"+model.songIDs[parseInt(Math.random()*model.songIDs.length)]} className="notA button" title="Random song"><i className="fas fa-random"></i></Link>}
            {!!settings.showYTButton && <a href={"https://www.youtube.com/results?search_query=" + song.title + " " + song.author} className="button notA"><i className="fab fa-youtube"></i></a>}
            {!!settings.showFavorites && <i className={"button " + (settings.favorites.includes(song.id) ? "fas fa-star" : "far fa-star")} title="Auto fit" onClick={() => this.toggleFavorite(song.id)}></i>}
            {!!settings.showAutoFitButton &&<i className="button fas fa-expand-arrows-alt" title="Auto fit" onClick={() => this.autoFit()}></i>}
            {!!settings.showFontSizeButton &&<i className="button fas fa-search-plus" title="Font size" onClick={() => this.togglePopup("fontsize")}></i>}
            {!!settings.displayChords && settings.showTranspositionButton &&<i className="button fas fa-hashtag" title="Transpoze" onClick={() => this.togglePopup("transpose")}>{settings.transpose && <>&thinsp;{settings.transpose}</>}</i>}
            {!!settings.showColumnsButton &&<i className="button fas fa-columns" title="Columns" onClick={() => this.toggleColumns()}>&thinsp;{settings.columns}</i>}
            {!!settings.showLineBreakButton &&<i className={"button fas "+(settings.lineBreak?"fa-heart-broken":"fa-heart")} alt="Columns" onClick={() => model.setSettings({lineBreak:!settings.lineBreak})} title="Line Break"></i>}
            {!!model.state.session.leader &&<i className="button fas fa-broadcast-tower" alt="Broadcast" onClick={() => model.broadcastSong()} title="Broadcast"></i>}
            {!!this.state.popup.length && <div id="popup">
                {{
                    "transpose": <>
                        <InputRange
                            maxValue={12} minValue={0}
                            value={settings.transpose}
                            onChange={value => model.setSettings({ transpose: value })}
                        />
                    </>,
                    "fontsize": <>
                        <InputRange
                            maxValue={30} minValue={5}
                            value={settings.fontSize}
                            onChange={value => model.setSettings({ fontSize: value })}
                        />
                    </>
                }[this.state.popup]}
            </div>}
        </div>
    }
}
