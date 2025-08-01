import React, { useRef, useState, useEffect } from "react";
import SegmentMenu from "./SegmentMenus";
import "./VideoBar.css";
import "./QuestionSegment.css";
import type { QuestionCardData } from "../../types/QuestionCard";


interface QuestionSegmentProps {
  source: [number, number];
  multiplier: number;
  videoDurationRef: React.RefObject<number>;
  questionCardData: QuestionCardData;
  setVideoPercent: (p: number) => void;
  updateSegment: (index: number, newEnd: number) => void;
  onDelete: (index: number) => void;
  index: number;
}

const QuestionSegment: React.FC<QuestionSegmentProps> = ({
  index,
  source,
  multiplier,
  videoDurationRef,
  questionCardData,
  setVideoPercent,
  updateSegment,
  onDelete,
}) => {
  const [start, setStart] = useState(source[0]);
  const [end, setEnd] = useState(source[1]);
  const [wPx, setWPx] = useState(0);
  const [lPx, setLPx] = useState(0);
  const [isDraggingSide, setIsDraggingSide] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuX, setMenuX] = useState(0);
  const [menuY, setMenuY] = useState(0);

  const segmentRef = useRef<HTMLDivElement>(null);
  const mouseDownLocation = useRef(0);
  const originalEndRef = useRef(end);

  useEffect(() => {
    setStart(source[0]);
    setEnd(source[1]);
  }, [source]);

  useEffect(() => {
    setWPx((end - start) * 100 * multiplier);
    setLPx(start * 100 * multiplier);
  }, [start, end, multiplier]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.button === 0) {
      const rect = segmentRef.current?.getBoundingClientRect();
      if (!rect) return;

      const offsetX = e.clientX - rect.left;
      const ratio = offsetX / rect.width;
      const seconds = start + (end - start) * ratio;

      const time = Math.min(
        Math.max(seconds, 0),
        videoDurationRef.current ?? 0,
      );
      setVideoPercent(time - Math.random() * 1e-6);
      setShowMenu(false);
    } else if (e.button === 2) {
      e.preventDefault();
      setMenuX(e.clientX);
      setMenuY(e.clientY);
      setShowMenu(true);
    }
  };

  const handleMouseDownResize = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingSide(true);
      mouseDownLocation.current = e.clientX;
      originalEndRef.current = end;
    }
  };

  useEffect(() => {
    if (!isDraggingSide) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseDownLocation.current;
      const deltaSeconds = dx / (100 * multiplier);
      const newEnd = Math.max(
        originalEndRef.current + deltaSeconds,
        start + 0.1,
      );
      updateSegment(index, newEnd);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDraggingSide(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSide, start, multiplier, index, updateSegment]);

  const handleDelete = () => {
    setShowMenu(false);
    onDelete(index);
  };

  return (
    <>
      <div
        ref={segmentRef}
        onMouseDown={handleMouseDown}
        className={`segment question-segment ${questionCardData.difficulty}`}
        onContextMenu={(e) => e.preventDefault()}
      
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
        }}
      >
        <div
          className="resize-edge right"
          onMouseDown={handleMouseDownResize}
        />

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
        ].map((item, idx) => (
          <div
            key={idx}
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
              boxSizing: "border-box",
            }}
          >
            {item.content}
          </div>
        ))}
      </div>

      {showMenu && (
        <SegmentMenu
          x={menuX}
          y={menuY}
          onDelete={handleDelete}
          onClose={() => setShowMenu(false)} // ✅ closes menu on exit
        />
      )}
    </>
  );
};

export default QuestionSegment;
