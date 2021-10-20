import React from 'react';
import './Settings.scss';
import {Toggle} from '../components/toggle'
import {withRouter} from 'react-router'
import {RiArrowLeftLine} from 'react-icons/ri'
import {VscArrowLeft} from 'react-icons/vsc'

class Settings extends React.Component{
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
            <Setting
                title="Auto-reset transposition"
                text="Transposition will be automatically reset each time you select a song."
                value={settings.resetTranspositions}
                onChange={v => this.set("resetTranspositions",v)}
            />
            {(this.state.showNSFW>0 || settings.displayNsfw)&&<Setting
                title="Display all songs"
                text=""
                value={settings.displayNsfw}
                onChange={v => this.set("displayNsfw",v)}
            />}
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

export default withRouter(Settings)