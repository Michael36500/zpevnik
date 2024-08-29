import React from "react";
import Setting from "../../../components/setting/Setting";
import model from "../../../resources/model/model";


export default function AdvancedSettings({showNSFW}:{showNSFW: boolean}) {
    const settings = model.settings;
  return (
    <div className="section">
      <Setting name="yeet" title="Yeet" text="Yeeeeeeeet." />
      {(showNSFW || settings.displayNsfw) && <Setting
        title="Display all songs" 
        text="" 
        name="displayNsfw" 
      />}
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
