import React, { useState } from "react";
import LeftTaskBar from "../components/TaskBar";
import VideoSettingsPage from "./control/VideoSettingsPage";
import QuestionsPage from "./control/Questions";
import BotsPage from "./control/Bot";
import "./MeetingSettings.css";
import Finder from "../finder/Finder";

const MeetingSettings: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState(0);
  const [showFinder, setShowFinder] = useState(false);

  const handleSelect = (index: number) => {
    setSelectedPage(index);
  };

  const renderPage = () => {
    switch (selectedPage) {
      case 0:
        return <VideoSettingsPage />;
      case 1:
        return <QuestionsPage />;
      case 2:
        return <BotsPage />;
      case 3:
        return <div className="page">General Settings Page</div>;
      default:
        return <div className="page">Page Not Found</div>;
    }
  };

  return (
    <>
      {/* Finder should be absolutely positioned relative to window */}
      <Finder hide={!showFinder} onClose={() => setShowFinder(false)} />

      <div className="meeting-settings-container">
        <LeftTaskBar onSelect={handleSelect} />
        <div className="meeting-content">{renderPage()}</div>

        <button
          className="circle-folder-button"
          onClick={() => setShowFinder((prev) => !prev)}
          title="Open Finder"
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default MeetingSettings;
