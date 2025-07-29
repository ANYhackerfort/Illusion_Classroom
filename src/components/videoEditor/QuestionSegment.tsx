import React, { useRef, useState, useEffect } from "react";
import "./VideoBar.css";
import "./QuestionSegment.css";

interface QuestionCardData {
  question: string;
  answers: string[];
  difficulty: "easy" | "medium" | "hard";
  type: "slider" | "short" | "mc" | "match" | "rank" | "ai";
}

interface QuestionSegmentProps {
  source: [number, number];
  multiplier: number;
  videoDuration: number;
  questionCardData: QuestionCardData;
  setVideoPercent: (p: number) => void;
  updateSegment: (index: number, endDelta: number) => void;
  index: number;
}

const QuestionSegment: React.FC<QuestionSegmentProps> = ({
  index,
  source,
  multiplier,
  videoDuration,
  questionCardData,
  setVideoPercent,
  updateSegment,
}) => {
  const [start, setStart] = useState(source[0]);
  const [end, setEnd] = useState(source[1]);
  const [wPx, setWPx] = useState(0);
  const [lPx, setLPx] = useState(0);
  const [draggingSide, setDraggingSide] = useState<"right" | null>(null);

  const segmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStart(source[0]);
    setEnd(source[1]);
  }, [source]);

  useEffect(() => {
    setWPx((end - start) * 100 * multiplier);
    setLPx(start * 100 * multiplier);
  }, [start, end, multiplier]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // 0 = left click, 1 = middle, 2 = right

    const rect = segmentRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left;
    const ratio = offsetX / rect.width;
    const seconds = start + (end - start) * ratio;
    const percent = (seconds / videoDuration) * 100;

    setVideoPercent(percent);
  };

  // Global drag tracking
  useEffect(() => {
    let lastCall = performance.now();
    const THROTTLE_INTERVAL = 0; // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingSide !== "right" || !segmentRef.current) return;

      const now = performance.now();
      if (now - lastCall < THROTTLE_INTERVAL) return;
      lastCall = now;

      const deltaX = e.movementX;
      const secondsPerPx = videoDuration / (100 * multiplier * 38.5);
      const deltaSeconds = deltaX * secondsPerPx;

      updateSegment(index, deltaSeconds); // only end time changes
    };

    const handleMouseUp = () => setDraggingSide(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingSide, multiplier, videoDuration, updateSegment, index]);

  return (
    <div
      ref={segmentRef}
      onMouseDown={handleClick}
      className={`segment question-segment ${questionCardData.difficulty}`}
      style={{
        position: "absolute",
        width: `${wPx}px`,
        left: `${lPx}px`,
        padding: "4px",
        boxSizing: "border-box",
        borderRadius: "8px",
        height: "140px",
        transform: "translateY(20px)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: "4px",
        // ✅ no fixed backgroundColor here — class handles it (e.g. `.easy`, `.medium`, `.hard`)
      }}
    >
      {/* Right Resize Bar */}
      <div
        className="resize-edge right"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDraggingSide("right");
        }}
      />

      {/* Lightened content boxes */}
      {[
        {
          content: questionCardData.question,
          fontSize: "12px",
          fontWeight: "bold",
        },
        {
          content: `${questionCardData.type.toUpperCase()} (${questionCardData.difficulty})`,
          fontSize: "10px",
          fontWeight: "normal",
        },
        {
          content: questionCardData.answers.join(", "),
          fontSize: "8px",
          fontWeight: "normal",
        },
      ].map((item) => (
        <div
          style={{
            width: "100%",
            padding: "4px 8px",
            fontSize: item.fontSize,
            fontWeight: item.fontWeight,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderRadius: "6px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            color: "#333",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            boxSizing: "border-box", // ✅ important!
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default QuestionSegment;
