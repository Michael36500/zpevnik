import React from 'react';
import './Settings.scss';
import {Toggle} from '../components/toggle'
import {withRouter} from 'react-router'
import {RiArrowLeftLine} from 'react-icons/ri'
import {VscArrowLeft} from 'react-icons/vsc'

class SettingsPage extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            settings: props.settings || {},
            showNSFW: -5,
        }
    }

    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps)!==JSON.stringify(this.props)){
            this.setState({settings:this.props.settings})
        }
    }

    set(name,val){
        let settings = {...this.state.settings}
        settings[name]=val;
        this.setState({settings:settings})
        this.props.onChange(settings)
    }

    render(){
        const settings = this.state.settings
        return <div id="settings">
            <h1 onClick={()=>this.setState({showNSFW:this.state.showNSFW+1})}>Settings <VscArrowLeft onClick={()=>this.props.history.goBack()}/></h1>
            <h2>Visual settings</h2>
            <Setting
                title="Dark Mode"
                text="Lorem ipsum dolor sit amet lorem ipsum dolor sit amet"
                value={settings.darkMode}
                onChange={v => this.set("darkMode",v)}
            />
            <Setting
                title="Compact mode"
                text="Smaller margins and title font size so that more text can fit on the screen."
                value={settings.compactMode}
                onChange={v => this.set("compactMode",v)}
            />
            <h2>Advanced functions</h2>
            <Setting
                title="Auto-reset transposition"
                text="Transposition will be automatically reset each time you select a song."
                value={settings.resetTranspositions}
                onChange={v => this.set("resetTranspositions",v)}
            />
            <Setting
                title="YouTube search button"
                text="Display button with link to youtube search of the current song in toolbar."
                value={settings.displayYTButton}
                onChange={v => this.set("displayYTButton",v)}
            />
            <Setting
                title="Transpose capo"
                text="Show capo needed to stay in original song key after transposition."
                value={settings.transposeCapo}
                onChange={v => this.set("transposeCapo",v)}
            />
            <Setting
                title="Favorites"
                text={"Show \"Add to favorites\" button and sort songs by favorites."}
                value={settings.showFavorites}
                onChange={v => this.set("showFavorites",v)}
            />
            <div className="setting choose">
                <div className="title">Chords</div>
                <div className="description">Display chord diagrams for guitar or ukulele.</div>
                <div className="options">
                    <div className={(settings.chords === "guitar")?"active":""} onClick={()=>{this.set("chords","guitar")}}>Guitar</div>
                    <div className={(settings.chords === "ukulele")?"active":""} onClick={()=>{this.set("chords","ukulele")}}>Ukulele</div>
                    <div className={(settings.chords === "none")?"active":""} onClick={()=>{this.set("chords","none")}}>None</div>
                </div>
            </div>
            {(this.state.showNSFW>0 || settings.displayNsfw)&&<>
            <h2>Hidden songs</h2>
            <Setting
                title="Display all songs"
                text=""
                value={settings.displayNsfw}
                onChange={v => this.set("displayNsfw",v)}
            /></>}
            <hr/>
            <div className="info">
                There are currently {this.props.songs} songs.
            </div>
            
        </div>
    }
}

function Setting({title, text, value, onChange}){
    return <div className="setting">
        <div className="left">
            <div className="title">{title}</div>
            <div className="description">{text}</div>
        </div>
        <div className="right">
            <Toggle onChange={v => onChange(v)} value={value}/>
        </div>
    </div>
}

export default withRouter(SettingsPage)