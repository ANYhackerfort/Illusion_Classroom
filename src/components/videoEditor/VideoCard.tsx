import React, { useState } from "react";
import "./VideoCard.css";
import { FaMicrophone } from "react-icons/fa";
import { useMouse } from "../../hooks/drag/MouseContext";

interface QuestionCardProps {
  question: string;
  answers: string[];
  difficulty: "easy" | "medium" | "hard";
  type: "slider" | "short" | "mc" | "match" | "rank" | "ai";
  displayType: "face" | "initial" | "anonymous" | undefined;
  showWinner: boolean | undefined;
  live: boolean | undefined;
}

const VideoQuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answers,
  difficulty,
  type,
  displayType,
  showWinner,
  live,
}) => {
  const { setDraggedItem } = useMouse();

  const [displayTypeState] = useState<"face" | "initial" | "anonymous">(
    displayType ?? "anonymous",
  );
  const [showWinnerState] = useState<boolean>(showWinner ?? false);
  const [liveState] = useState<boolean>(live ?? false);

  const handleMouseDown = () => {
    setDraggedItem({
      type: "question-card",
      data: { question, answers, difficulty, type },
    });
    console.log(displayTypeState);
  };

  return (
    <div
      className={`video-question-card ${difficulty}`}
      onMouseDown={handleMouseDown}
    >
      <div className="video-question-header">
        <div className="video-question-text">{question}</div>
        <div className={`video-question-type ${type}`}>
          {type.toUpperCase()}
        </div>
      </div>
      <div className="video-answers-container">
        {type === "slider" ? (
          <div className="video-slider-ui" />
        ) : type === "short" ? (
          <div className="video-short-ui" />
        ) : type === "match" ? (
          answers.map((answer, index) => (
            <div key={index} className="video-match-row">
              <div className="video-match-box">{answer}</div>
              <div className="video-match-box">?</div>
            </div>
          ))
        ) : type === "rank" ? (
          answers.map((answer, index) => (
            <div key={index} className="video-rank-row">
              <span className="video-rank-number">{index + 1}.</span>
              <span className="video-rank-text">{answer}</span>
            </div>
          ))
        ) : type === "ai" ? (
          <div className="video-ai-ui">
            <div className="video-ai-mic-ring">
              <FaMicrophone size={24} />
            </div>
            <div className="video-ai-prompt">
              This is an AI interview-style question. Speak your answer.
            </div>
          </div>
        ) : (
          answers.map((answer, index) => (
            <div key={index} className="video-answer-box">
              {answer}
            </div>
          ))
        )}
      </div>

      <div className="video-question-footer">
        <span className="footer-badge">{displayTypeState}</span>
        {showWinnerState && <span className="footer-badge">🏆 Winner</span>}
        {liveState && <span className="footer-badge">🔴 Live</span>}
      </div>
    </div>
  );
};

export default VideoQuestionCard;
