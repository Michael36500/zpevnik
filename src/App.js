import React from 'react';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import { Link } from 'react-router-dom';
import './App.scss';
import Main from './Main';
import './Main.scss';
import { getCacheSongs, getSongs } from './resources/api/song';
import Sidebar from './Sidebar';




class App extends React.Component {
   constructor() {
      super()
      this.state = {
         sidebarOpen: false,
         popup: "",
         search: "",
         songs: [],
         settings: {
            columns: 1,
            darkMode: false,
            fontsize: 20,
            transpoze: 0,
            displayNsfw: false,
         }
      }
   }

   componentDidMount() {
      const cache = getCacheSongs()
      if (Array.isArray(cache)) this.setState({ songs: cache })

      getSongs().then(res => {
         this.setState({ songs: res })
      }).catch(err => console.log(err))

      const settings = JSON.parse(localStorage.getItem("settings"))
      if (settings) this.updateSettings( settings)
   }

   toggleSidebar() {
      this.setState({ sidebarOpen: !this.state.sidebarOpen, popup: "" })
   }

   toggleColumns() {
      var c = this.state.settings.columns;
      c = c >= 3 ? 1 : c + 1
      this.updateSetting("columns",c)
   }

   getSong(ctx) {
      const id = ctx.match.params.id;
      return this.state.songs.filter(s => parseInt(s.id) === parseInt(id))[0] || {}
   }

   togglePopup(id) {
      if (this.state.popup === id) this.setState({ popup: "" })
      else this.setState({ popup: id })
   }

   async autoFit() {
      var song = document.getElementById("song")?.clientHeight
      var main = document.getElementById("main")?.clientHeight
      if (!song || !main) return

      const t = this
      function correct(val) {
         const fs =  parseInt((t.state.settings.fontsize + val) * 10) / 10 
         t.setState({settings: {...t.state.settings, fontsize:fs}}, () => {
            song = document.getElementById("song")?.clientHeight
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
   }

   updateSetting(name,val){
      //console.log("updateSetting")
      let settings = this.state.settings
      settings[name] = val
      this.updateSettings(settings)
   }

   updateSettings(set) {
      //console.log("updateSettings", set)
      let settings = {...this.state.settings, ...set}
      this.setState({ settings: settings })
      localStorage.setItem("settings", JSON.stringify(settings))
   }

   render() {
      const settings = this.state.settings
      //console.log(settings)

      return (
         <div id="app" className={this.state.settings.darkMode ? "dark-theme" : "light-theme"}>
            <Sidebar
               songs={this.state.songs}
               toggle={() => this.toggleSidebar()}
               inputVal={this.state.search}
               inputOnChange={e => this.setState({ search: e.target.value })}
               open={this.state.sidebarOpen}
               settings={settings}
            />
            
            <Main
               getSong={(ctx)=>this.getSong(ctx)}
               updateSettings={(set)=>this.updateSettings(set)}
               settings={settings}
               songIds={this.state.songs.sort((a, b) => a.title.localeCompare(b.title)).map(song => song.id)}
            />
            

            <div id="toolbar">
               <i className="button fas fa-bars" onClick={() => this.toggleSidebar()}></i>
               <div className="spacer"></div>
               <Link to="/settings" className="notA button"><i className="fas fa-cog"></i></Link>
               <i className="button fas fa-expand-arrows-alt" alt="Auto fit" onClick={() => this.autoFit()}></i>
               <i className="button fas fa-search-plus" alt="Font size" onClick={() => this.togglePopup("fontsize")}></i>
               <i className="button fas fa-hashtag" alt="Transpoze" onClick={() => this.togglePopup("transpoze")}>{settings.transpoze && <>&thinsp;{settings.transpoze}</>}</i>
               <i className="button fas fa-columns" alt="Columns" onClick={() => this.toggleColumns()}>&thinsp;{settings.columns}</i>
               {!!this.state.popup.length && <div id="popup">
                  {{
                     "transpoze": <>
                        <InputRange
                           maxValue={12} minValue={0}
                           value={settings.transpoze}
                           onChange={value => this.updateSetting("transpoze",value)}
                        />
                     </>,
                     "fontsize": <>
                        <InputRange
                           maxValue={30} minValue={10}
                           value={settings.fontsize}
                           onChange={value => this.updateSetting("fontsize",value)}
                        />
                     </>
                  }[this.state.popup]}
               </div>}
            </div>
         </div>
      );
   }
}



export default App;



