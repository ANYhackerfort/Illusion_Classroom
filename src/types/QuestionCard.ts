// src/types/QuestionCardData.ts

export interface QuestionCardData {
  id: string;
  question: string;
  answers: string[];
  difficulty: "easy" | "medium" | "hard";
  type: "slider" | "short" | "mc" | "match" | "rank" | "ai";
  displayType?: "face" | "initial" | "anonymous";
  showWinner?: boolean;
  live?: boolean;
}

export interface VideoSegmentData {
  id: string;
  source: [number, number];
  isQuestionCard?: boolean;
  questionCardData?: QuestionCardData;
}
