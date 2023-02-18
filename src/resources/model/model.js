import { useHistory } from "react-router";
import { getCacheSongs, getSongs } from "../api/song";
import { getCurrentSongId, normalize } from "../helpers";
import { pocket } from "../pocket/pocket";
import { changeSessionSong, endSession, listenSession, newSession, subscribeToSession, unsubscribeFromSession } from "../pocket/session";


class ZpevnikDataModel {
    updateCallbacks = [];
    state = {
        songs: [],
        settings: {
            columns: 1,
            transpose: 0,
            fontSize: 20,
            lineBreak: true,

            darkMode: false,
            compactMode: false,
            sortAlphabetically: true,
            swipeGesturesPrevNext: true,

            displayChords: true,
            chords: "guitar",
            transposeCapo: false,
            preferedScale: 0,

            favorites: [],
            showYTButton: false,
            showFavorites: false,
            showColumnsButton: true,
            showAutoFitButton: true,
            showFontSizeButton: false,
            showTranspositionButton: true,
            showRandomSongButton: true,
            showLineBreakButton: false,

            resetTranspositions: true,
            closeSidebarOnSongClickPC: false,
            displayNsfw: false,
            autofitIntervalDelay: 10,
        },
        session: {
            online: false,
            code: "",
            leader: false
        },
        history: {}
    }

    //set update callback function
    addUpdateCallback(fn) {
        this.updateCallbacks.push(fn)
    }

    //call update callback function to notify listeners
    notifyListeners() {
        this.updateCallbacks.forEach(fn => fn())
    }

    //update model properties
    setState(data) {
        for (let key in data) {
            this.state[key] = data[key]
        }

        this.notifyListeners()
    }

    //update settings in state
    setSettings(settings) {
        this.setState({
            settings: {
                ...this.state.settings,
                ...settings
            }
        })
        localStorage.setItem("settings", JSON.stringify(this.settings))
    }

    //load songs from local storage, then attempt to load from server
    async loadSongs() {
        const cache = getCacheSongs()
        if (Array.isArray(cache)) this.setState({ songs: cache })

        getSongs().then(res => {
            this.setState({ songs: res })
        }).catch(err => console.log(err))
    }

    //load settings from local storage
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem("settings"))
        if (settings) this.setSettings(settings)
    }

    //load session data
    loadSession() {
        const session = JSON.parse(localStorage.getItem("session"))
        if (session) this.setState({session: session})
        if (this.state.session.online && !this.state.session.leader){
            subscribeToSession(this.state.session.code,(e)=>{
                this.state.history.push(e.record.song)
            }).catch(err => {
                console.log(err)
                this.leaveSession()
            })
        }
    }

    constructor() {
        this.loadSettings()
        this.loadSongs()
        this.loadSession()
    }

    //get settings
    get settings() {
        return this.state.settings
    }

    //get songs sorted and filtered depending on settings
    get songs() {
        let set = this.state.settings;
        let favorites = set.favorites || [];
        let songs = this.state.songs || [];

        if (!set.displayNsfw)
            songs = songs.filter(s => s.sfw)
        if (set.sortAlphabetically)
            songs = songs.sort((a, b) => a.title.localeCompare(b.title))
        if (set.showFavorites)
            songs = songs.sort((a, b) => favorites.includes(b.id) ? (favorites.includes(a.id) ? 0 : 1) : (favorites.includes(a.id) ? -1 : 0));

        return songs
    }

    //get sorted song ids
    get songIDs() {
        return this.songs.map(song => song.id)
    }

    //get songs whose title+author contain query string
    //strings are normalized
    searchSongs(query) {
        return this.songs
            .filter(s => (normalize(s.title) + normalize(s.author)).includes(normalize(query)))
    }


    //get song by id from array of songs filtered acording to settings
    getSongById(id) {
        return this.songs.find(song => song.id === id)
    }

    //get song by id in window URI
    get currentSong() {
        let id = getCurrentSongId()
        return this.getSongById(id)
    }

    async startSession() {
        let code = await newSession()
        this.setState({
            session: {
                code: code,
                online: true,
                leader: true
            }
        })
        localStorage.setItem("session", JSON.stringify(this.state.session))
    }

    async joinSession(){
        const code = window.prompt("Session code:")
        subscribeToSession(code, (e)=>{
            if(e.action === "update")
                this.state.history.push(e.record.song)
            if(e.action === "delete")
                this.leaveSession()
        })
        this.setState({session:{
            online: true,
            leader: false,
            code: code
        }})
        localStorage.setItem("session", JSON.stringify(this.state.session))
    }

    async broadcastSong(){
        console.log("lolec")
        changeSessionSong(this.state.session.code, getCurrentSongId())
    }

    async leaveSession(){
        if (this.state.session.leader){
            endSession(this.state.session.code)
        }else{
            unsubscribeFromSession()
        }

        this.setState({session:{
            online: false,
            leader: false,
            code: ""
        }})
        localStorage.setItem("session", JSON.stringify(this.state.session))

    }
}

const model = new ZpevnikDataModel()
window.model = model;
export default model