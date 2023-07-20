import React from "react";
import  Setting from "../../../components/setting/Setting"

export default function BehaviorSettings() {
  return (
    <div className="section">
      <Setting
        name="sortAlphabetically"
        title="Alphabetical sort"
        text={"Sort songs alphabetically."}
      />
      <Setting
        name="closeSidebarOnSongClickPC"
        title="Auto-close sidebar"
        text="Automatically close sidebar after clicking on a song."
      />
      <Setting
        name="autofitShowTitle"
        title="Auto-fit show title"
        text="If turned on, auto-fit will show the song title, otherwise it will zoom in on the lyrics"
      />
      <Setting
        name="lineBreak"
        title="Line Break"
        text="Allow lines to break when scaling lyrics."
      />
      <Setting
        name="swipeGesturesPrevNext"
        title="Swipe gestures"
        text={
          "Swipe left or right on a song to move to the next or previous one."
        }
      />
    </div>
  );
}
