import React, { useState } from "react";
import { FaBroadcastTower, FaBrush, FaCog, FaCogs, FaSquare } from "react-icons/fa";
import { VscArrowLeft } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import packageJSON from "../../../package.json";
import model from "../../resources/model/model";
import "./SettingsPage.scss";
import AdvancedSettings from "./sections/Advanced";
import BehaviorSettings from "./sections/Behavior";
import ButtonsSection from "./sections/Buttons";
import SessionSettings from "./sections/Session";
import VisualSettings from "./sections/Visual";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);

  const sections = [
    { title: "Visual Settings", element: <VisualSettings />, icon: <FaBrush /> },
    { title: "Behavior", element: <BehaviorSettings />, icon: <FaCog /> },
    { title: "Buttons", element: <ButtonsSection />, icon: <FaSquare/> },
    { title: "Session", element: <SessionSettings />, icon: <FaBroadcastTower /> },
    { title: "Advanced", element: <AdvancedSettings />, icon: <FaCogs /> },
  ];

  return (
    <div id="settings">
      <h1>
        Settings
        <VscArrowLeft onClick={() => navigate(-1)} />
      </h1>
      <div className="grid">
        <div className="left">
          {sections.map((section, key) => (
            <div className="item" onClick={() => setSelected(key)}>
              {section.icon} {section.title}
            </div>
          ))}
        </div>
        <div className="right">
          <h2>{sections[selected].title}</h2>
          {sections[selected].element}
          </div>
      </div>

      <hr />

      <div className="info">
        <p>There are currently {model.songs.length} songs.</p>
        <p>Version {packageJSON.version}</p>
      </div>
    </div>
  );
}
