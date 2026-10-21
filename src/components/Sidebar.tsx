import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { isMobile } from "../resources/helpers";
import model, { song } from "../resources/model/model";

interface props {
  toggle: () => any;
  open: boolean;
}

export default function Sidebar({ toggle, open }: props) {
  const [query, setQuery] = useState("");
  const editor = useLocation().pathname.includes("editor")

  return (
    <div
      id="sidebar"
      className={open ? "open" : ""}
      {...useSwipeable({
        onSwipedLeft: () => toggle(),
      })}
    >
      <div className="top">
        <input
          size={1}
          placeholder="Hledej ..."
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <span className="clear" onClick={()=>setQuery("")}>×</span>
        <i className="button fas fa-arrow-left" onClick={() => toggle()}></i>
      </div>

      {!!model.settings.separateFavorites&& !!model.settings.favorites.length && <>
        <div className="divider">Favorites</div>
        {model.searchSongs(query).filter(song => model.isFavorite(song.id)).map((song) => <SongLink toggle={()=>toggle()} song={song} editor={editor}/>)}
        <div className="divider">All</div>
      </>
      }
      {model.searchSongs(query).map((song) => <SongLink toggle={()=>toggle()} song={song} editor={editor}/>)}
    </div>
  );
}

function SongLink({toggle, song, editor}:{toggle:()=>any, song:song, editor:boolean}){
        //handler is on the link, so opening a song with Enter (after Tab) closes the sidebar too
        return <Link
        to={"/" + (editor?"editor/":"") + song.id}
        className="notA"
        key={song.id}
        onClick={() => {
            if (isMobile() || model.settings.closeSidebarOnSongClickPC)
            toggle();
        }}
        >
        <div className="song">
        <div className="text">
            {song.title} <span className="author">{song.author}</span>
        </div>
        {!!model.settings.showFavorites && !model.settings.separateFavorites && !!model.settings.favorites.includes(song.id) && <div className="favorite">
                <i className="fas fa-star"></i>
    </div>}
        </div>
    </Link>
}