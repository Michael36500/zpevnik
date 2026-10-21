import React from "react";
import Setting from "../../../components/setting/Setting"
import model from "../../../resources/model/model";
import ChordHelper from "../../../resources/model/chordHelper";
import { set } from "../../../resources/helpers";
import { downloadChordSheet } from "../../../resources/pdf/generate";

function allChords(instrument: "guitar" | "ukulele") {
  downloadChordSheet(instrument).catch((err) => {
    console.log(err);
    alert("Error creating PDF.");
  });
}

function ChordsLink({ instrument, column }: { instrument: "guitar" | "ukulele"; column: number }) {
  return (
    <span
      className="pdf-link"
      role="link"
      tabIndex={0}
      style={{ gridColumn: column }}
      onClick={() => allChords(instrument)}
      onKeyDown={(e) => e.key === "Enter" && allChords(instrument)}
    >
      All chords
    </span>
  );
}

export default function VisualSettings() {
  const settings = model.settings;
  return (
    <div className="section">
      <Setting
        name="darkMode"
        title="Dark Mode"
        text="Enables Dark Mode. Background will be black and text white."
      />
      {model.settings.darkMode && <Setting
        indent
        name="oledMode"
        title="OLED Mode"
        text="Completely dark background"
      />}
      <Setting
        name="nightMode"
        title="Night mode"
        text="Page doesn't emit blue light."
      />
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
            <ChordsLink instrument="guitar" column={1} />
            <ChordsLink instrument="ukulele" column={2} />
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
