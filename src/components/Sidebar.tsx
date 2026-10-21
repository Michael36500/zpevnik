import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { isMobile } from "../resources/helpers";
import model, { song } from "../resources/model/model";
import { collectChords } from "../resources/model/songFilters";
import ChordFilter from "./ChordFilter";

interface props {
  toggle: () => any;
  open: boolean;
}

export default function Sidebar({ toggle, open }: props) {
  const [query, setQuery] = useState("");
  const [chords, setChords] = useState<string[]>([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const editor = useLocation().pathname.includes("editor")

  //let the user type right after opening the sidebar, and start fresh the next time
  useEffect(() => {
    if (open) searchInput.current?.focus({ preventScroll: true });
    else setQuery("");
  }, [open]);

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
          ref={searchInput}
          size={1}
          placeholder="Hledej ..."
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <span className="clear" onClick={()=>setQuery("")}>×</span>
        <i className="button fas fa-arrow-left" onClick={() => toggle()}></i>
      </div>

      {!!model.settings.filterChords && (
        <ChordFilter chords={collectChords(model.songs)} selected={chords} onChange={setChords} />
      )}

      {!!model.settings.separateFavorites&& !!model.settings.favorites.length && <>
        <div className="divider">Favorites</div>
        {model.searchSongs(query, chords).filter(song => model.isFavorite(song.id)).map((song) => <SongLink toggle={()=>toggle()} song={song} editor={editor}/>)}
        <div className="divider">All</div>
      </>
      }
      {model.searchSongs(query, chords).map((song) => <SongLink toggle={()=>toggle()} song={song} editor={editor}/>)}
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