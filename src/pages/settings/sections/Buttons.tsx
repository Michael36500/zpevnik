import React from "react";
import model from "../../../resources/model/model";
import { Setting } from "../SettingsPage";

export default function ButtonsSection() {
  const settings = model.settings;
  return (
    <div className="section">
        <Setting
        name="showRandomSongButton"
        title="Random song"
        text="Show random song button."
      />
      <Setting
        name="showYTButton"
        title="YouTube"
        text="Show button with link to youtube search of the current song."
      />
      <Setting
        name="showFavorites"
        title="Favorites"
        text={'Show "Add to favorites" button and sort songs by favorites.'}
      />
      <Setting
        name="showAutoFitButton"
        title="Auto-fit"
        text={
          "Show autofit button to automatically adjust font-size to fill the entire screen."
        }
      />
      <Setting
        name="showFontSizeButton"
        title="Font size"
        text={"Show manual font size adjustment button."}
      />
      {settings.displayChords && (
        <Setting
          name="showTranspositionButton"
          title="Transposition"
          text={"Show transposition button."}
        />
      )}
      <Setting
        name="showColumnsButton"
        title="Columns"
        text={"Show column setting button."}
      />
      <Setting
        name="showLineBreakButton"
        title="Line Break"
        text={"Show line break button."}
      />
    </div>
  );
}
