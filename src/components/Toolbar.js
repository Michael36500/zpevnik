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
        var song = document.getElementById("song")?.clientHeight - (this.state.settings.compactMode ? (document.getElementById("song-head")?.clientHeight - parseInt(this.state.settings.fontSize)) : 0)
        var main = document.getElementById("main")?.clientHeight
        if (!song || !main) return

        const t = this
        function correct(val) {
            const fs = parseInt((t.state.settings.fontSize + val) * 10) / 10
            t.setState({ settings: { ...t.state.settings, fontsize: fs } }, () => {
                song = document.getElementById("song")?.clientHeight - (t.state.settings.compactMode ? (document.getElementById("song-head")?.clientHeight + fs) : 0)
                main = document.getElementById("main")?.clientHeight
            })
        }

        if (song < main) {
            let i = setInterval(() => {
                correct(.1)
                if (song > main) {
                    clearInterval(i)
                    this.autoFit()
                }
            }, 0)
        }

        if (song > main) {
            let i = setInterval(() => {
                correct(-.1)
                if (song < main) {
                    clearInterval(i)
                }
            }, 0)
        }

        document.getElementById("lyrics")?.scrollIntoView()
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
        const song = {id:1, author:"y", title:"x"}
        return <div id="toolbar">
            <i className="button fas fa-bars" onClick={() => this.props.toggleSidebar()}></i>
            <div className="spacer"></div>
            <Link to="/settings" className="notA button"><i className="fas fa-cog"></i></Link>
            {!!settings.showYTButton && <a href={"https://www.youtube.com/results?search_query=" + song.title + " " + song.author} className="button notA"><i className="fab fa-youtube"></i></a>}
            {!!settings.showFavorites && <i className={"button " + (settings.favorites.includes(song.id) ? "fas fa-star" : "far fa-star")} alt="Auto fit" onClick={() => this.toggleFavorite(song.id)}></i>}
            {!!settings.showAutoFitButton &&<i className="button fas fa-expand-arrows-alt" alt="Auto fit" onClick={() => this.autoFit()}></i>}
            {!!settings.showFontSizeButton &&<i className="button fas fa-search-plus" alt="Font size" onClick={() => this.togglePopup("fontsize")}></i>}
            {!!settings.showTranspositionButton &&<i className="button fas fa-hashtag" alt="Transpoze" onClick={() => this.togglePopup("transpose")}>{settings.transpose && <>&thinsp;{settings.transpose}</>}</i>}
            {!!settings.showColumnsButton &&<i className="button fas fa-columns" alt="Columns" onClick={() => this.toggleColumns()}>&thinsp;{settings.columns}</i>}
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
                            maxValue={30} minValue={10}
                            value={settings.fontSize}
                            onChange={value => model.setSettings({ fontSize: value })}
                        />
                    </>
                }[this.state.popup]}
            </div>}
        </div>
    }
}