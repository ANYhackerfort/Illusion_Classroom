import React from "react";
import "./BotDisplay.css";

const BotDisplay: React.FC = () => {
  return (
    <div className="bot-display-container">
      <div className="bot-display-background">
        <span className="bot-display-text">Video</span>
      </div>
      <div className="bot-display-overlay">
        <div className="bot-grid-placeholder">
          {/* Grid content will go here */}
        </div>
      </div>
    </div>
  );
};

export default BotDisplay;
