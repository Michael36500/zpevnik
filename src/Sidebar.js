import { Link } from "react-router-dom"
import { useSwipeable } from "react-swipeable"
import { isMobile, normalize } from "./helpers"

export default function Sidebar({ songs, toggle, inputOnChange, inputVal, open, settings }) {
    const sidebarSwipeHandlers = useSwipeable({
       onSwipedLeft: () => toggle()
    })
 
    return <div id="sidebar"
       className={open ? "open" : ""}
       {...sidebarSwipeHandlers}
    >
       <div className="top">
          <input size="1" placeholder="Hledej ..." onChange={e => inputOnChange(e)} value={inputVal} />
          <i className="button fas fa-arrow-left" onClick={() => toggle()}></i>
       </div>
 
       {songs
          .sort((a, b) => a.title.localeCompare(b.title))
          .filter(s => (normalize(s.title) + normalize(s.author)).includes(normalize(inputVal)))
          .filter(s => s.sfw || settings.displayNsfw)
          .map(song => <Link to={"/" + song.id} className="notA" key={song.id}>
             <div className="song" onClick={() => { if (isMobile()) toggle() }}>{song.title} <span className="author">{song.author}</span></div>
          </Link>)
       }
    </div>
 }