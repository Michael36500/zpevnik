import { Record, RecordSubscription } from "pocketbase";
import { getCacheSongs, getSongs } from "../api/song";
import { autoFit, getCurrentSongId, normalize } from "../helpers";
import { changeSessionSong, endSession, newSession, subscribeToSession, unsubscribeFromSession } from "../pocket/session";

type id = string

export interface song {
    id: id,
    title: string,
    author: string,
    capo: number,
    sfw: boolean,
    verses: any
}

class ZpevnikDataModel {
    updateCallbacks: (()=>any)[] = []
    state = {
        navigate: (to:string)=>{},
        songs: [],
        settings: {
            columns: 1,
            transpose: 0,
            fontSize: 20,
            lineBreak: true,

            darkMode: false,
            oledMode: false,
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
            maxColumns: 3,
            separateFavorites: false,

            autofitOnSessionUpdate: false,
            autofitShowTitle: false,

            yeet: false,
        },
        session: {
            online: false,
            code: "",
            leader: false
        },
    }

    //set update callback function
    addUpdateCallback(fn: ()=>void) {
        this.updateCallbacks.push(fn)
    }

    //call update callback function to notify listeners
    notifyListeners() {
        this.updateCallbacks.forEach(fn => fn())
    }

    //update model properties
    setState(data: object) {
        this.state = {...this.state, ...data}

        this.notifyListeners()
    }

    //update settings in state
    setSettings(settings: object) {
        this.setState({
            settings: {
                ...this.state.settings,
                ...settings
            }
        })
        localStorage.setItem("settings", JSON.stringify(this.settings))
    }

    //on route change
    onRouteChanged(){
        if(this.state.settings.resetTranspositions)this.setSettings({transpose:0})
    }

    //load songs from local storage, then attempt to load from server
    async loadSongs() {
        const cache = getCacheSongs()
        if (Array.isArray(cache)) this.setState({ songs: cache })

        getSongs().then(res => {
            this.setState({ songs: res })
        })
    }

    //load settings from local storage
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem("settings") || "")
        if (settings) this.setSettings(settings)
    }

    //load session data
    loadSession() {
        const session = JSON.parse(localStorage.getItem("session") || "")
        if (session) this.setState({session: session})
        if (this.state.session.online && !this.state.session.leader){
            subscribeToSession(this.state.session.code, (e: RecordSubscription<Record>)=>this.onSessionUpdate(e)).catch(err => {
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
    get settings(): {[key:string]: any} {
        return this.state.settings
    }

    setting(name: string){
        return this.settings[name]
    }

    //get songs sorted and filtered depending on settings
    get songs() {
        let set = this.state.settings;
        let favorites: string[] = set.favorites || [];
        let songs: song[] = this.state.songs || [];

        if (!set.displayNsfw)
            songs = songs.filter(s => s.sfw)
        if (set.sortAlphabetically)
            songs = songs.sort((a, b) => a.title.localeCompare(b.title))
        if (set.showFavorites && !set.separateFavorites)
            songs = songs.sort((a, b) => favorites.includes(b.id) ? (favorites.includes(a.id) ? 0 : 1) : (favorites.includes(a.id) ? -1 : 0));

        return songs
    }

    //get sorted song ids
    get songIDs(): id[] {
        return this.songs.map(song => song.id)
    }

    //get songs whose title+author contain query string
    //strings are normalized
    searchSongs(query: string) {
        return this.songs
            .filter(s => (normalize(s.title) + normalize(s.author)).includes(normalize(query)))
    }

    //get song by id from array of songs filtered acording to settings
    getSongById(id: id) {
        return this.songs.find(song => song.id === id)
    }

    //get song by id in window URI
    get currentSong(): song | undefined {
        let id = getCurrentSongId()
        return this.getSongById(id)
    }

    isFavorite(id: id){
        const favorites: id[] = model.settings.favorites
        return favorites.includes(id)
    }

    onSessionUpdate(event:RecordSubscription<Record>){
        if(event.action === "update")
            this.state.navigate(event.record.song)
        if(event.action === "delete")
            this.leaveSession()
        if(this.settings.autofitOnSessionUpdate)
            this.autoFit()
    }

    async startSession() {
        newSession().then(code => {
            localStorage.setItem("session", JSON.stringify(this.state.session))
            this.setState({
                session: {
                    code: code,
                    online: true,
                    leader: true
                }
            })
            localStorage.setItem("session", JSON.stringify(this.state.session))
        }).catch(err => {
            alert("Error starting new session.")
        })
    }

    async joinSession(){
        const code = prompt("Session code:")?.toUpperCase()
        if (!code) return
        subscribeToSession(code, (e:RecordSubscription<Record>)=>this.onSessionUpdate(e)).then(() => {
            this.setState({session:{
                online: true,
                leader: false,
                code: code
            }})
            localStorage.setItem("session", JSON.stringify(this.state.session))
        }).catch(err => {
            alert("Error joining session.")
        })
    }

    async broadcastSong(){
        changeSessionSong(this.state.session.code, getCurrentSongId()).catch(err => {
            alert("Session error.")
        })
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

    ////
    autoFit(){
        autoFit()
    }
}

declare global {
    interface Window { model: any; }
}

const model = new ZpevnikDataModel()
window.model = model;
export default model