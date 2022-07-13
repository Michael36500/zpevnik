import React from 'react';
import 'react-input-range/lib/css/index.css';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import './App.scss';
import NewSongPage from './pages/NewSong';
import SettingsPage from './pages/SettingsPage';
import SongPage from './pages/SongPage';
import TestPage from './pages/TestPage';
import TexToLyricsPage from './pages/TexToLyrics';
import model from './resources/model/model';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';

class App extends React.Component {
   constructor() {
      super()
      this.state = {
         sidebarOpen: false,
      }
   }

   componentDidMount() {
      model.addUpdateCallback(() => this.forceUpdate())
   }

   componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
         this.onRouteChanged();
      }
   }

   onRouteChanged() {
      console.log("route changed")
      if (model.settings.resetTranspositions) model.setSettings({ transpose: 0 })
   }

   toggleSidebar() {
      this.setState({ sidebarOpen: !this.state.sidebarOpen, popup: "" })
   }

   render() {
      const settings = model.settings

      return <div id="app" className={(settings.darkMode ? "dark-theme" : "light-theme") + " " + (settings.compactMode ? "compactMode" : "")}>
         <Sidebar
            toggle={() => this.toggleSidebar()}
            open={this.state.sidebarOpen}
         />

         <div id="main">
            <Switch>
               <Route path="/settings"><SettingsPage /></Route>
               <Route path="/new" exact><NewSongPage /></Route>
               <Route path="/ttl" exact><TexToLyricsPage /></Route>
               <Route path="/test"><TestPage /></Route>
               <Route path="/:id" ><SongPage /></Route>
               <Route path="/" exact><Redirect to="/1" /></Route>
            </Switch>
         </div>

         <Toolbar
            toggleSidebar={() => this.toggleSidebar()}
         />
      </div>;
   }
}

export default withRouter(App);