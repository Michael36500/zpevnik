import React from 'react';
import { VscArrowLeft } from 'react-icons/vsc';
import { withRouter } from 'react-router';
import { Toggle } from '../components/toggle';
import model from '../resources/model/model';
import './Settings.scss';
import ChordHelper from '../resources/model/chordHelper';
import {version} from '../../package.json';
class SettingsPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showNSFW: -5,
        }
    }

    set(name, val) {
        model.setSettings({ [name]: val })
    }

    render() {
        const settings = model.settings
        return <div id="settings">
            <h1 onClick={() => this.setState({ showNSFW: this.state.showNSFW + 1 })}>Settings <VscArrowLeft onClick={() => this.props.history.goBack()} /></h1>
            <h2>Visual settings</h2>
            <Setting
                name="darkMode"
                title="Dark Mode"
                text="Lorem ipsum dolor sit amet lorem ipsum dolor sit amet"
            />
            <Setting
                name="compactMode"
                title="Compact mode"
                text="Smaller margins and title font size so that more text can fit on the screen."
            />
            <Setting
                name="displayChords"
                title="Chords"
                text="Display chords in lyrics."
            />
            {settings.displayChords && <div className="setting choose">
                <div className="title">Chord diagrams</div>
                <div className="description">Display chord diagrams for guitar or ukulele.</div>
                <div className="options">
                    <div className={(settings.chords === "guitar") ? "active" : ""} onClick={() => { this.set("chords", "guitar") }}>Guitar</div>
                    <div className={(settings.chords === "ukulele") ? "active" : ""} onClick={() => { this.set("chords", "ukulele") }}>Ukulele</div>
                    <div className={(settings.chords === "none") ? "active" : ""} onClick={() => { this.set("chords", "none") }}>None</div>
                </div>
            </div>}
            {settings.displayChords && <div className="setting choose scales">
                <div className="title">Scale</div>
                <div className="description">Select scale for displaying chords.</div>
                <div className="options">
                    {ChordHelper.scales.map((scale,key) => <div 
                    className={(settings.preferedScale === key) ? "active" : ""}
                    onClick={()=>this.set("preferedScale",key)}
                    >{
                        scale.reduce((prev,cur)=>prev+", "+cur.replace("b","♭"))
                    }</div> )}
                </div>
            </div>}

            <Setting
                name="sortAlphabetically"
                title="Alphabetical sort"
                text={"Sort songs alphabetically."}
            />
            <Setting
                name="swipeGesturesPrevNext"
                title="Swipe gestures"
                text={"Swipe left or right on a song to move to the next or previous one."}
            />
            <h2>Buttons</h2>
            <Setting
                name="showRandomSongButton"
                title="Random song"
                text="Show random song button."
            />
            <Setting
                name="showYTButton"
                title="YouTube"
                text="Show button with link to youtube search of the current song."
            />
            <Setting
                name="showFavorites"
                title="Favorites"
                text={"Show \"Add to favorites\" button and sort songs by favorites."}
            />
            <Setting
                name="showAutoFitButton"
                title="Auto-fit"
                text={"Show autofit button to automatically adjust font-size to fill the entire screen."}
            />
            <Setting
                name="showFontSizeButton"
                title="Font size"
                text={"Show manual font size adjustment button."}
            />
            {settings.displayChords && <Setting
                name="showTranspositionButton"
                title="Transposition"
                text={"Show transposition button."}
            />}
            <Setting
                name="showColumnsButton"
                title="Columns"
                text={"Show column setting button."}
            />
            <Setting
                name="showLineBreakButton"
                title="Line Break"
                text={"Show line break button."}
            />

            <h2>Advanced functions</h2>
            {settings.displayChords && settings.showTranspositionButton && <Setting
                name="resetTranspositions"
                title="Auto-reset transposition"
                text="Transposition will be automatically reset each time you select a song."
            />}
            {settings.displayChords && settings.showTranspositionButton && <Setting
                name="transposeCapo"
                title="Transpose capo"
                text="Show capo needed to stay in original song key after transposition."
            />}
            <Setting
                name="closeSidebarOnSongClickPC"
                title="Auto-close sidebar"
                text="Automatically close sidebar after clicking on a song."
            />
            <Setting
                name="lineBreak"
                title="Line Break"
                text="Allow lines to break when scaling lyrics."
            />
            <h2>Session</h2>
            <div className="session">
                {model.state.session.online?<>
                    You are in a session.
                    Code: {model.state.session.code}
                    <div className="buttons">
                        <div className="button" onClick={()=>{model.leaveSession()}}>
                            {model.state.session.leader?"End Session":"Leave Session"}
                        </div>
                    </div>
                </>:<>
                    You are currently not in a session.
                    <div className="buttons">
                        <div className="button" onClick={()=>{model.startSession()}}>Start Session</div>
                        <div className="button" onClick={()=>{model.joinSession()}}>Join Session</div>
                    </div>
                </>

                }
                
            </div>

            {(this.state.showNSFW > 0 || settings.displayNsfw) && <>
                <h2>Hidden songs</h2>
                <Setting
                    title="Display all songs"
                    text=""
                    name="displayNsfw"
                /></>}
            <hr />
            
            <div className="info">
                <p>There are currently {model.songs.length} songs.</p>
                <p>Version {version}</p>
            </div>
        </div>
    }
}

function Setting({ title, text, name }) {
    return <div className="setting">
        <div className="left">
            <div className="title">{title}</div>
            <div className="description">{text}</div>
        </div>
        <div className="right">
            <Toggle onChange={v => model.setSettings({ [name]: v })} value={model.settings[name]} />
        </div>
    </div>
}

export default withRouter(SettingsPage)