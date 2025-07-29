import React from "react";
import "./VideoCard.css";
import { FaMicrophone } from "react-icons/fa";
import { useMouse } from "../../hooks/drag/MouseContext";

interface QuestionCardProps {
  question: string;
  answers: string[];
  difficulty: "easy" | "medium" | "hard";
  type: "slider" | "short" | "mc" | "match" | "rank" | "ai";
}

const VideoQuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answers,
  difficulty,
  type,
}) => {
  const { setDraggedItem } = useMouse();

  const handleMouseDown = () => {
    setDraggedItem({
      type: "question-card",
      data: { question, answers, difficulty, type },
    });
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
    </div>
  );
};

export default VideoQuestionCard;
