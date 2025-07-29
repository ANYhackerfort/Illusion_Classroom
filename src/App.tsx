// App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { MouseProvider } from "./hooks/drag/MouseContext";

import JoinMeeting from "./pages/JoinMeeting";
import MeetingRoom from "./pages/MeetingRoom";
import MeetingSettings from "./pages/MeetingSettings";
import LoginPage from "./pages/Login";
import GhostOverlay from "./GhostOverlay";

import "./App.css";
const App: React.FC = () => {
  return (
    <MouseProvider>
      <GhostOverlay />
      <Routes>
        <Route path="/" element={<JoinMeeting />} />
        <Route path="/meeting-room" element={<MeetingRoom />} />
        <Route path="/meeting-settings" element={<MeetingSettings />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MouseProvider>
  );
};

export default App;
