import React from "react"
import { Link } from "react-router-dom"
import { useSwipeable } from "react-swipeable"
import { isMobile, normalize } from "./resources/helpers"
import model from "./resources/model/model"

export default class Sidebar extends React.Component {
   constructor() {
      super()
      this.state = {
         query: "",
      }
   }

   render() {
      return <RenderSidebar
         setQuery={(query) => this.setState({ query: query })}
         query={this.state.query}
         open={this.props.open}
         toggle={() => this.props.toggle()}
      />
   }
}

//useSwipeable must be used in a function component, bruuuh
function RenderSidebar({ setQuery = () => { }, toggle = () => { }, query = false, open = false }) {
   return <div id="sidebar"
      className={open ? "open" : ""}
      {...useSwipeable({
         onSwipedLeft: () => this.props.toggle()
      })}
   >
      <div className="top">
         <input size="1" placeholder="Hledej ..." onChange={e => setQuery(e.target.value)} value={query} />
         <i className="button fas fa-arrow-left" onClick={() => toggle()}></i>
      </div>

      {model.searchSongs(query)
         .map(song => <Link to={"/" + song.id} className="notA" key={song.id}>
            <div className="song" onClick={() => {
               if (isMobile() || model.settings.closeSidebarOnSongClickPC)
                  toggle()
            }}>
               <div className="text">
                  {song.title} <span className="author">{song.author}</span>
               </div>
               {!!model.settings.showFavorites && !!model.settings.favorites.includes(song.id) && <div className="favorite">
                  <i class="fas fa-star"></i>
               </div>}
            </div>
         </Link>)
      }
   </div>
}