import React, { useState } from "react";
import ChordHelper from "../resources/model/chordHelper";
import { chordLabel } from "../resources/model/songFilters";
import "./ChordFilter.scss";

interface props {
  chords: string[];
  selected: string[];
  onChange: (selected: string[]) => any;
}

export default function ChordFilter({ chords, selected, onChange }: props) {
  const [open, setOpen] = useState(false);

  function toggle(chord: string) {
    onChange(selected.includes(chord) ? selected.filter((c) => c !== chord) : [...selected, chord]);
  }

  return (
    <div className="chord-filter">
      <div className="head" onClick={() => setOpen(!open)}>
        Chords I can play{!!selected.length && ` (${selected.length})`}
        <span>
          {!!selected.length && (
            <span
              className="reset"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
            >
              ×
            </span>
          )}
          <i className={"fas fa-chevron-" + (open ? "up" : "down")}></i>
        </span>
      </div>
      {open && (
        <div className="chips">
          {chords.map((c) => (
            <span key={c} className={"chip" + (selected.includes(c) ? " on" : "")} onClick={() => toggle(c)}>
              {chordLabel(c, (id) => ChordHelper.getNoteNameById(id))}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
