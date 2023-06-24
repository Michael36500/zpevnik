import React, { ReactNode, useState } from "react";
import { VscArrowLeft } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import packageJSON from "../../../package.json";
import { Toggle } from "../../components/toggle";
import model from "../../resources/model/model";
import "./SettingsPage.scss";
import VisualSettings from "./sections/Visual";
import ButtonsSection from "./sections/Buttons";
import SessionSettings from "./sections/Session";
import AdvancedSettings from "./sections/Advanced";
import BehaviorSettings from "./sections/Behavior";
import { FaBroadcastTower, FaBrush, FaCog, FaCogs, FaCubes, FaSquare, FaSquarespace } from "react-icons/fa";



function SettingsPage() {
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

interface setting {
  title: string,
  text: string,
  name: string,
  input?: ReactNode | null
}

export function Setting({ title, text, name, input = null } : setting) {
  return (
    <div className="setting">
      <div className="left">
        <div className="title">{title}</div>
        <div className="description">{text}</div>
      </div>
      <div className="right">
        {input?input:<Toggle
          onChange={(v: string) => model.setSettings({ [name]: v })}
          value={model.setting(name)}
        />}
      </div>
    </div>
  );
}

export function set(name: string, val: any) {
  model.setSettings({ [name]: val });
}

export default SettingsPage;
