import './Main.scss'
import {Song} from './components/song'
import {songs} from './resources/songs.js'
import {Switch, Route, Link} from 'react-router-dom'
import React from 'react';
import './App.scss';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css'


class App extends React.Component{
  constructor(){
    super()
    this.state = {
      sidebarOpen: false,
      columns:1,
      popup:"",
      transpoze:0,
      fontsize:20,
    }
  }

  toggleSidebar(){
    this.setState({sidebarOpen:!this.state.sidebarOpen})
  }

  toggleColumns(){
    var c = this.state.columns;
    c = c>=3?1:c+1
    this.setState({columns: c})
  }

  getSong(ctx){
    const id = ctx.match.params.id;
    return songs[id]||{}
  } 

  togglePopup(id){
    if(this.state.popup === id)this.setState({popup:""})
    else this.setState({popup:id})
  }

  render(){
    return (
      <div id="app">
          <div id="sidebar" className={this.state.sidebarOpen?"open":""}>
            <div className="top"><i class="button fas fa-arrow-left" onClick={()=>this.toggleSidebar()}></i></div>
            {songs.map((song,key) => <Link to={"/"+key} className="notA">
              <div className="song">{song.title} <span className="author">{song.author}</span></div>
            </Link>)}
          </div>

          <div id="main">
            <Switch>
                <Route path="/:id" render={ctx => <Song
                  song={this.getSong(ctx)}
                  columns={this.state.columns}
                  fontsize={this.state.fontsize}
                  trans={this.state.transpoze}
                />}/>
            </Switch>
          </div>

          <div id="toolbar">
            <i className="button fas fa-bars" onClick={()=>this.toggleSidebar()}></i>
            <div className="spacer"></div>
            <i class="button fas fa-expand-arrows-alt" alt="Auto fit"></i>
            <i class="button fas fa-search-plus" alt="Font size" onClick={()=>this.togglePopup("fontsize")}></i>
            <i class="button fas fa-hashtag" alt="Transpoze" onClick={()=>this.togglePopup("transpoze")}>{!!this.state.transpoze&&<>&thinsp;{this.state.transpoze}</>}</i>
            <i className="button fas fa-columns" alt="Columns" onClick={()=>this.toggleColumns()}>&thinsp;{this.state.columns}</i>
            {!!this.state.popup.length&&<div id="popup">
              {{
                "transpoze":<>
                  <InputRange
                    maxValue={12} minValue={0}
                    value={this.state.transpoze}
                    onChange={value => this.setState({transpoze:value})} 
                  />
                </>,
                "fontsize":<>
                  <InputRange
                    maxValue={30} minValue={10}
                    value={this.state.fontsize}
                    onChange={value => this.setState({fontsize:value})} 
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

