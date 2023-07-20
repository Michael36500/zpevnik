import React, { useState } from "react";
import model from "../../../resources/model/model";
import  Setting from "../../../components/setting/Setting"


export default function AdvancedSettings() {
    const [showNSFW, setNSFW] = useState(-5);
    const settings = model.settings;
  return (
    <div className="section">
      {settings.displayChords && settings.showTranspositionButton && (
        <Setting
          name="resetTranspositions"
          title="Auto-reset transposition"
          text="Transposition will be automatically reset each time you select a song."
        />
      )}
      {settings.displayChords && settings.showTranspositionButton && (
        <Setting
          name="transposeCapo"
          title="Transpose capo"
          text="Show capo needed to stay in original song key after transposition."
        />
      )}
      <Setting
        name="closeSidebarOnSongClickPC"
        title="Auto-close sidebar"
        text="Automatically close sidebar after clicking on a song."
      />
      <Setting
        name="lineBreak"
        title="Line Break"
        text="Allow lines to break when scaling lyrics."
      />
      <Setting name="yeet" title="Yeet" text="Yeeeeeeeet." />
      {(showNSFW > 0 || settings.displayNsfw) && (
        <>
          <h2>Hidden songs</h2>
          <Setting title="Display all songs" text="" name="displayNsfw" />
        </>
      )}
      <Setting
        name="secret"
        title="Secret"
        text=""
        input={<input
            value={model.setting("secret")}
            onChange={e => model.setSettings({secret: e.target.value})}
        />}
      />
    </div>
  );
}
