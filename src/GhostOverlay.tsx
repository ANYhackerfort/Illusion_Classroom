import React, { useEffect, useRef } from "react";
import GhostCard from "./components/quesitons/QuestionCardGhost";
import { useMouse } from "./hooks/drag/MouseContext";

const GhostOverlay = () => {
  const { draggedItem, draggedItemSizePercent } = useMouse();
  const ghostRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  // Track mouse position with useRef
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      const ghost = ghostRef.current;
      if (ghost && draggedItem) {
        const scale = draggedItemSizePercent / 100;
        ghost.style.transform = `translate(${e.clientX - 100 * scale}px, ${
          e.clientY - 50 * scale
        }px) scale(${scale})`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [draggedItem, draggedItemSizePercent]);

  if (!draggedItem) return null;

  return (
    <div className="ghost-overlay">
      <div
        ref={ghostRef}
        style={{
          position: "fixed",
          transformOrigin: "top left",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        <GhostCard item={draggedItem} />
      </div>
    </div>
  );
};

export default GhostOverlay;
