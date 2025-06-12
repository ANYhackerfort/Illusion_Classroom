import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JoinMeeting from "./pages/JoinMeeting";
import MeetingRoom from "./pages/MeetingRoom";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<JoinMeeting />} />
      <Route path="/meeting-room" element={<MeetingRoom />} />
    </Routes>
  );
};

export default App;
