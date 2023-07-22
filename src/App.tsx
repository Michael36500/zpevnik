import React, { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import "./App.scss";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import NewSongPage from "./pages/NewSong";
import SongPage from "./pages/SongPage";
import TestPage from "./pages/TestPage";
import TexToLyricsPage from "./pages/TexToLyrics";
import EditorPage from "./pages/editor/EditorPage";
import SettingsPage from "./pages/settings/SettingsPage";
import model from "./resources/model/model";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  useEffect(() => {
    model.onRouteChanged();
  }, [location]);

  const navigate = useNavigate()

  const [, foo] = useState({});
  const forceUpdate = useCallback(()=>foo({}), [])
  useEffect(() => {
    model.addUpdateCallback(() => forceUpdate());
    model.setState({navigate: (to: string)=>navigate(to)});
  },[])

  const settings = model.settings;
  let className = settings.darkMode ? "dark-theme" : "light-theme"
  className = className + (settings.oledMode && settings.darkMode ? " oled-theme":"")
  className = className + (settings.compactMode ? " compactMode" : "")

  
  return (
    <div id="app" className={className}>
      <Sidebar toggle={() => setSidebarOpen(!sidebarOpen)} open={sidebarOpen} />

      <div id="main">
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/editor" element={<EditorPage/>}/>
          <Route path="/editor/:id" element={<EditorPage/>}/>
          <Route path="/new" element={<NewSongPage />} />
          <Route path="/ttl" element={<TexToLyricsPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/:id" element={<SongPage />} />
          <Route path="/" element={<Navigate to="/qoy8s97lyguc9nn" />}></Route>
        </Routes>
      </div>

      <Toolbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    </div>
  );
}

export default App;
