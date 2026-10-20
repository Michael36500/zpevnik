import React from "react";
import Setting from "../../../components/setting/Setting"
import model from "../../../resources/model/model";
import ChordHelper from "../../../resources/model/chordHelper";
import { set } from "../../../resources/helpers";

export default function VisualSettings() {
  const settings = model.settings;
  return (
    <div className="section">
      <Setting
        name="darkMode"
        title="Dark Mode"
        text="Lorem ipsum dolor sit amet lorem ipsum dolor sit amet"
      />
      {model.settings.darkMode && <Setting
        indent
        name="oledMode"
        title="OLED Mode"
        text="Completely dark background"
      />}
      <Setting
        name="compactMode"
        title="Compact mode"
        text="Smaller margins and title font size so that more text can fit on the screen."
      />
      <Setting
        name="displayChords"
        title="Chords"
        text="Display chords in lyrics."
      />
      {settings.displayChords && (
        <div className="setting choose indent">
          <div className="title">Chord diagrams</div>
          <div className="description">
            Display chord diagrams for guitar or ukulele.
          </div>
          <div className="options">
            <div
              className={settings.chords === "guitar" ? "active" : ""}
              onClick={() => {
                set("chords", "guitar");
              }}
            >
              Guitar
            </div>
            <div
              className={settings.chords === "ukulele" ? "active" : ""}
              onClick={() => {
                set("chords", "ukulele");
              }}
            >
              Ukulele
            </div>
            <div
              className={settings.chords === "none" ? "active" : ""}
              onClick={() => {
                set("chords", "none");
              }}
            >
              None
            </div>
          </div>
        </div>
      )}
      {settings.displayChords && (
        <div className="setting choose scales indent">
          <div className="title">Scale</div>
          <div className="description">Select scale for displaying chords.</div>
          <div className="options">
            {ChordHelper.scales.map((scale, key) => (
              <div
                className={settings.preferedScale === key ? "active" : ""}
                onClick={() => set("preferedScale", key)}
              >
                {scale.reduce(
                  (prev, cur) => prev + ", " + cur.replace("b", "♭")
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
