import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import model, { song } from "../resources/model/model";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface props {
  toggleSidebar: () => any;
}

export default function Toolbar({ toggleSidebar }: props) {
  const [popup, setPopup] = useState("");

  function togglePopup(id: string) {
    setPopup(popup === id ? "" : id);
  }

  const pathname = useLocation().pathname;
  const navigate = useNavigate();

  function toggleColumns() {
    let c = model.settings.columns;
    const max = model.settings.maxColumns;
    c = c >= max ? 1 : c + 1;
    model.setSettings({ columns: c });
  }

  function toggleFavorite(id: string) {
    let favorites: string[] = [...model.settings.favorites];
    if (favorites.includes(id)) {
      favorites.splice(favorites.indexOf(id), 1);
    } else {
      favorites.push(id);
    }
    model.setSettings({ favorites: favorites });
  }

  const settings = model.settings;
  let song = model.currentSong;
  const session = model.state?.session?.online
    ? model.state.session.leader
      ? "s-lead"
      : "s-online"
    : "";

  const inSong = pathname.split("/")[1]?.length === 15;
  const inEditor = pathname.includes("editor");
  const editorId  = pathname.split("/")[2]
  if(inEditor&&editorId) song = model.getSongById(editorId)

  return (
    <div id={"toolbar"} className={session}>
      <i className="button fas fa-bars" onClick={() => toggleSidebar()}></i>
      <div className="spacer"></div>

      {inEditor && editorId && (
        <Link to={"/" + editorId} className="notA button" title="Back to song">
          <i className="fas fa-arrow-left"></i>
        </Link>
      )}
      {inEditor && (
        <i
          className={
            "button fas " +
            (settings.editorMode === "verses"
              ? "fa-th-list"
              : "fa-align-justify")
          }
          title="Editor mode"
          onClick={() =>
            model.setSettings({
              editorMode:
                settings.editorMode === "verses" ? "lyrics" : "verses",
            })
          }
        ></i>
      )}
      {inSong && settings.showEditButton && (
        <Link to={"/editor" + pathname} className="notA button" title="Edit">
          <i className="fas fa-pencil-alt"></i>
        </Link>
      )}
      {pathname === "/settings" ? (
        <i className="fas fa-arrow-left button" onClick={() => navigate(-1)}></i>
      ) : (
        <Link to="settings" className="notA button" title="Settings">
          <i className="fas fa-cog"></i>
        </Link>
      )}
      {!!settings.showRandomSongButton && (
        <Link
          to={
            "/" +
            (inEditor ? "editor/" : "") +
            model.songIDs[parseInt("" + Math.random() * model.songIDs.length)]
          }
          className="notA button"
          title="Random song"
        >
          <i className="fas fa-random"></i>
        </Link>
      )}
      {!!settings.showYTButton && !!song?.title && (
        <a
          href={
            "https://www.youtube.com/results?search_query=" +
            song?.title +
            " " +
            song?.author
          }
          className="button notA"
          target="blank_"
        >
          <i className="fab fa-youtube"></i>
        </a>
      )}
      {!!settings.showFavorites && (
        <i
          className={
            "button " +
            (model.isFavorite(song?.id || "") ? "fas fa-star" : "far fa-star")
          }
          title="Auto fit"
          onClick={() => toggleFavorite(song?.id || "")}
        ></i>
      )}
      {!!settings.showAutoFitButton && (
        <i
          className="button fas fa-expand-arrows-alt"
          title="Auto fit"
          onClick={() => model.autoFit()}
        ></i>
      )}
      {!!settings.showFontSizeButton && (
        <i
          className="button fas fa-search-plus"
          title="Font size"
          onClick={() => togglePopup("fontsize")}
        ></i>
      )}
      {!!settings.displayChords && settings.showTranspositionButton && (
        <i
          className="button fas fa-hashtag"
          title="Transpoze"
          onClick={() => togglePopup("transpose")}
        >
          {settings.transpose && <>&thinsp;{settings.transpose}</>}
        </i>
      )}
      {!!settings.showColumnsButton && (
        <i
          className="button fas fa-columns"
          title="Columns"
          onClick={() => toggleColumns()}
        >
          &thinsp;{settings.columns}
        </i>
      )}
      {!!settings.showLineBreakButton && (
        <i
          className={
            "button fas " +
            (settings.lineBreak ? "fa-heart-broken" : "fa-heart")
          }
          onClick={() => model.setSettings({ lineBreak: !settings.lineBreak })}
          title="Line Break"
        ></i>
      )}
      {!!model.state.session.leader && (
        <i
          className="button fas fa-broadcast-tower"
          onClick={() => model.broadcastSong()}
          title="Broadcast"
        ></i>
      )}
      {!!popup.length && (
        <div id="popup">
          {
            {
              transpose: (
                <>
                  <Slider
                    max={12}
                    min={0}
                    defaultValue={settings.transpose}
                    onChange={(value) =>
                      model.setSettings({ transpose: value })
                    }
                    marks={{ 0: "0", 12: "12" }}
                  />
                </>
              ),
              fontsize: (
                <>
                  <Slider
                    min={5}
                    max={30}
                    defaultValue={settings.fontSize}
                    onChange={(value) => model.setSettings({ fontSize: value })}
                    marks={{ 5: "5", 30: "30" }}
                  />
                </>
              ),
            }[popup]
          }
        </div>
      )}
    </div>
  );
}
