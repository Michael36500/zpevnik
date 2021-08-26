import './Main.scss'
import {Song} from './components/song'
import {songs} from './resources/songs.js'
import {Switch, Route, Link} from 'react-router-dom'
import React from 'react';
import './App.scss';

class App extends React.Component{
  constructor(){
    super()
    this.state = {
      sidebarOpen: false,
    }
  }

  toggleSidebar(){
    this.setState({sidebarOpen:!this.state.sidebarOpen})
  }

  getSong(ctx){
    const id = ctx.match.params.id;
    return songs[id]||{}
  } 

  render(){
    return (
      <div id="app">
          <div id="sidebar" className={this.state.sidebarOpen?"open":""}>
            {songs.map((song,key) => <Link to={"/"+key} className="notA">
              <div className="song">{song.title} <span className="author">{song.author}</span></div>
            </Link>)}
          </div>
          <div id="main">
            <Switch>
                <Route path="/:id" render={ctx => <Song song={this.getSong(ctx)}/>}/>
            </Switch>
          </div>
          <div id="toolbar">
            <i className="button fas fa-bars" onClick={()=>this.toggleSidebar()}></i>
          </div>
      </div>
    );
  }
}

export default App;


