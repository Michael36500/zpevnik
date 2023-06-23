import React from "react";
import { Setting } from "../SettingsPage";

export default function BehaviorSettings() {
  return (
    <div className="section">
        <Setting
        name="sortAlphabetically"
        title="Alphabetical sort"
        text={"Sort songs alphabetically."}
      />
      <Setting
        name="swipeGesturesPrevNext"
        title="Swipe gestures"
        text={"Swipe left or right on a song to move to the next or previous one."}
      />
    </div>
  );
}
