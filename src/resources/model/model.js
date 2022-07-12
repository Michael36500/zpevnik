import { getCacheSongs, getSongs } from "../api/song";
import { getCurrentSongId, normalize } from "../helpers";

class ZpevnikDataModel {
    updateCallbacks = [];
    state = {
        songs: [],
        settings: {
            columns: 1,
            darkMode: false,
            fontSize: 20,
            transpose: 0,
            displayNsfw: false,
            resetTranspositions: true,
            compactMode: false,
            displayYTButton: true,
            favorites: [],
            transposeCapo: false,
            showFavorites: true,
            chords: "guitar",
            closeSidebarOnSongClickPC: true,
            sortAlfabetically:true,
        }
    }

    //set update callback function
    addUpdateCallback(fn) {
        this.updateCallbacks.push(fn)
    }

    //call update callback function to notify listeners
    notifyListeners() {
        this.updateCallbacks.forEach(fn=>fn())
    }

    //update model properties
    setState(data) {
        for (let key in data) {
            this.state[key] = data[key]
        }

        this.notifyListeners()
    }

    //update settings in state
    setSettings(settings){
        console.log(settings)
        this.setState({settings:{
            ...this.state.settings,
            ...settings
        }})
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

    constructor() {
        this.loadSettings()
        this.loadSongs()
    }

    //get settings
    get settings(){
        return this.state.settings
    }

    //get songs sorted and filtered depending on settings
    get songs() {
        let set = this.state.settings;
        let favorites = set.favorites || [];
        let songs = this.state.songs || [];

        if(!set.displayNsfw)
            songs = songs.filter(s => s.sfw)
        if (set.sortAlfabetically)
            songs = songs.sort((a, b) => a.title.localeCompare(b.title))
        if (set.showFavorites)
            songs = songs.sort(set.showFavorites ? (a, b) => favorites.includes(b.id) ? (favorites.includes(a.id) ? 0 : 1) : (favorites.includes(a.id) ? -1 : 0) : () => { });

        return songs
    }

    //get sorted song ids
    get songIDs(){
        return this.songs.map(song => song.id)
    }

    //get songs whose title+author contain query string
    //strings are normalized
    searchSongs(query){
        return this.songs
            .filter(s => (normalize(s.title) + normalize(s.author)).includes(normalize(query)))
    }


    //get song by id from array of songs filtered acording to settings
    getSongById(id){
        return this.songs.find(song => song.id===id)
    }

    //get song by id in window URI
    get currentSong(){
        return this.getSongById(getCurrentSongId())
    }


}

const model = new ZpevnikDataModel()
window.model = model;
export default model