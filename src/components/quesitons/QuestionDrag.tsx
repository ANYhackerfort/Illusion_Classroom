import React, { useState } from "react";
import "./QuestionDrag.css";
import QuestionCard from "./QuestionCard";

interface ParsedQuestion {
  question: string;
  difficulty: "easy" | "medium" | "hard";
  type: "slider" | "short" | "mc" | "match" | "rank" | "ai";
  answers: string[];
}

const QuestionDropZone: React.FC = () => {
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      const text = await file.text();

      const blocks = text.split(/\n\s*\n/);
      const questions: ParsedQuestion[] = [];

      for (const block of blocks) {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const questionLine = lines.find((line) => line.startsWith("Q:"));
        const difficultyLine = lines.find((line) => line.startsWith("D:"));
        const typeLine = lines.find((line) => line.startsWith("T:"));
        const answerLines = lines.filter((line) => line.startsWith("A:"));

        const difficulty = difficultyLine
          ?.replace(/^D:\s*/, "")
          .toLowerCase() as ParsedQuestion["difficulty"];
        const type = typeLine
          ?.replace(/^T:\s*/, "")
          .toLowerCase() as ParsedQuestion["type"];

        const isValidDifficulty = ["easy", "medium", "hard"].includes(
          difficulty,
        );
        const isValidType = [
          "slider",
          "short",
          "mc",
          "match",
          "rank",
          "ai",
        ].includes(type);

        const minAnswers =
          type === "short" || type === "slider" || type === "ai" ? 1 : 2;

        if (
          questionLine &&
          isValidDifficulty &&
          isValidType &&
          answerLines.length >= minAnswers
        ) {
          questions.push({
            question: questionLine.replace(/^Q:\s*/, ""),
            difficulty,
            type,
            answers: answerLines.map((a) => a.replace(/^A:\s*/, "")),
          });
        }
      }

      setParsedQuestions(questions);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="drop-zone" onDrop={handleDrop} onDragOver={handleDragOver}>
      {parsedQuestions.length === 0 ? (
        <div className="placeholder-text">
          Drag in a .txt file with questions, types, and difficulty
        </div>
      ) : (
        <div className="questions-wrap">
          {parsedQuestions.map((q, idx) => (
            <QuestionCard
              key={idx}
              question={q.question}
              answers={q.answers}
              difficulty={q.difficulty}
              type={q.type}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionDropZone;
