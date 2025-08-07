import React from "react";
import "./QuestionCard.css";
import { FaMicrophone } from "react-icons/fa";
import { useMouse } from "../../hooks/drag/MouseContext";
import type { QuestionCardData } from "../../types/QuestionCard";

const QuestionCard: React.FC<QuestionCardData> = ({
  id,
  question,
  answers,
  difficulty,
  type,
  displayType,
  showWinner,
  live,
}) => {
  const { setDraggedItem } = useMouse();

  const handleMouseDown = () => {
    setDraggedItem({
      type: "question-card",
      data: {
        id,
        question,
        answers,
        difficulty,
        type,
        displayType: displayType ?? "anonymous",
        showWinner: showWinner ?? false,
        live: live ?? false,
      },
    });
  };

  return (
    <div
      className={`question-card ${difficulty}`}
      onMouseDown={handleMouseDown}
    >
      <div className="question-header">
        <div className="question-text">{question}</div>
        <div className={`question-type ${type}`}>{type}</div>
      </div>
      <div className="answers-container">
        {type === "slider" ? (
          <div className="slider-ui" />
        ) : type === "short" ? (
          <div className="short-ui" />
        ) : type === "match" ? (
          answers.map((answer, index) => (
            <div key={index} className="match-row">
              <div className="match-box">{answer}</div>
              <div className="match-box">?</div>
            </div>
          ))
        ) : type === "rank" ? (
          answers.map((answer, index) => (
            <div key={index} className="rank-row">
              <span className="rank-number">{index + 1}.</span>
              <span className="rank-text">{answer}</span>
            </div>
          ))
        ) : type === "ai" ? (
          <div className="ai-ui">
            <div className="ai-mic-ring">
              <FaMicrophone size={20} />
            </div>
            <div className="ai-prompt">
              This is an AI interview-style question. Speak your answer.
            </div>
          </div>
        ) : (
          answers.map((answer, index) => (
            <div key={index} className="answer-box">
              {answer}
            </div>
          ))
        )}
      </div>
      <div className="question-footer">
        <span className="footer-badge">{displayType ?? "anonymous"}</span>
        {showWinner && <span className="footer-badge">🏆 Winner</span>}
        {live && <span className="footer-badge">🔴 Live</span>}
      </div>
    </div>
  );
};

export default QuestionCard;
