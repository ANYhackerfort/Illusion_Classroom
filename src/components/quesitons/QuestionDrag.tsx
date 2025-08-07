import React, { useState, useEffect } from "react";
import "./QuestionDrag.css";
import QuestionCard from "./QuestionCard";
import type { QuestionCardData } from "../../types/QuestionCard";
import { saveQuestion, getAllQuestions } from "../../indexDB/questionStorage";
import { v4 as uuidv4 } from "uuid";

const QuestionDropZone: React.FC = () => {
  const [parsedQuestions, setParsedQuestions] = useState<QuestionCardData[]>(
    [],
  );

  useEffect(() => {
    const loadFromDB = async () => {
      const stored = await getAllQuestions();
      setParsedQuestions(stored.map((q) => q.data));
    };
    loadFromDB();
  }, []);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      const text = await file.text();

      const blocks = text.split(/\n\s*\n/);
      const questions: QuestionCardData[] = [];

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
          .toLowerCase() as QuestionCardData["difficulty"];
        const type = typeLine
          ?.replace(/^T:\s*/, "")
          .toLowerCase() as QuestionCardData["type"];
        const minAnswers = ["short", "slider", "ai"].includes(type) ? 1 : 2;

        if (
          questionLine &&
          ["easy", "medium", "hard"].includes(difficulty) &&
          ["slider", "short", "mc", "match", "rank", "ai"].includes(type) &&
          answerLines.length >= minAnswers
        ) {
          const newQuestion: QuestionCardData = {
            id: uuidv4(), // ✅ attach unique ID
            question: questionLine.replace(/^Q:\s*/, ""),
            difficulty,
            type,
            answers: answerLines.map((a) => a.replace(/^A:\s*/, "")),
          };
          questions.push(newQuestion);
          await saveQuestion(newQuestion); // ✅ Save to DB
        }
      }

      setParsedQuestions((prev) => [...prev, ...questions]);
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
          {parsedQuestions.map((q) => (
            <QuestionCard
              key={q.id} // ✅ reliable React key
              id={q.id}
              question={q.question}
              answers={q.answers}
              difficulty={q.difficulty}
              type={q.type}
              displayType={q.displayType}
              showWinner={q.showWinner}
              live={q.live}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionDropZone;
