import React from "react";
import Setting from "../../../components/setting/Setting";

export default function FiltersSettings() {
  return (
    <div className="section">
      <Setting
        name="filterLyrics"
        title="Search in lyrics"
        text="Search bar also finds songs by a part of their lyrics. Title matches are listed first, lyrics matches below."
      />
      <Setting
        name="filterChords"
        title="Filter by chords"
        text="Show a chord picker in the sidebar and list only songs that use just the selected chords."
      />
    </div>
  );
}
