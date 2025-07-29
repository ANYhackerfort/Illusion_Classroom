import React, { useRef, useState, useEffect } from "react";
import LeftTaskBarFinder from "./TaskBarFinder";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import FolderTable from "./videoStorage/FolderTable";
import QuestionDropZone from "../components/quesitons/QuestionDrag";
import "./Finder.css";

interface FinderProps {
  hide: boolean;
  onClose: () => void;
}

const Finder: React.FC<FinderProps> = ({ hide, onClose }) => {
  const [history, setHistory] = useState<string[]>(["/"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(3);
  const [, forceUpdate] = useState(0); // used to trigger re-render

  const containerRef = useRef<HTMLDivElement>(null);

  const positionRef = useRef({
    x: (window.innerWidth - 640) / 2,
    y: (window.innerHeight - 440) / 2,
  });

  const sizeRef = useRef({ width: 600, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      sizeRef.current = {
        width: window.innerWidth * 0.5,
        height: window.innerHeight / 3,
      };
    };

    updateSize(); // Set initial size
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const currentPath = history[currentIndex];

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, currentIndex + 1).concat(path);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".top-menubar") ||
      target.closest(".finder-taskbar-container")
    ) {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (bounds) {
        setDragging(true);
        setOffset({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && containerRef.current) {
      positionRef.current = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      };
      containerRef.current.style.left = `${positionRef.current.x}px`;
      containerRef.current.style.top = `${positionRef.current.y}px`;
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      forceUpdate((prev) => prev + 1); // trigger re-render
    }
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (resizing && containerRef.current) {
      const newWidth = e.clientX - positionRef.current.x;
      const newHeight = e.clientY - positionRef.current.y;
      sizeRef.current = {
        width: Math.max(newWidth, 300),
        height: Math.max(newHeight, 200),
      };
      containerRef.current.style.width = `${sizeRef.current.width}px`;
      containerRef.current.style.height = `${sizeRef.current.height}px`;
    }
  };

  const handleResizeMouseUp = () => {
    if (resizing) {
      setResizing(false);
      forceUpdate((prev) => prev + 1); // trigger re-render
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, [dragging, offset, resizing]);

  return (
    <div
      ref={containerRef}
      className="finder-container"
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: positionRef.current.x,
        top: positionRef.current.y,
        width: sizeRef.current.width,
        height: sizeRef.current.height,
        cursor: dragging ? "grabbing" : "default",
        zIndex: 1000,
        display: hide ? "none" : "block",
      }}
    >
      <button className="mac-close-button" onClick={onClose}>
        &times;
      </button>

      <div className="finder-layout">
        <LeftTaskBarFinder onSelect={(index) => setSelectedIndex(index)} />

        <div className="finder-main">
          <div className="top-menubar">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className="arrow-button"
            >
              <FiArrowLeft size={20} />
            </button>

            <button
              onClick={goForward}
              disabled={currentIndex === history.length - 1}
              className="arrow-button"
            >
              <FiArrowRight size={20} />
            </button>

            <div className="current-path">{currentPath}</div>

            <input
              type="text"
              className="search-bar"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="content-area">
            {selectedIndex === 1 ? (
              <FolderTable />
            ) : selectedIndex === 3 ? (
              <QuestionDropZone />
            ) : (
              <>
                <p>
                  Showing contents of: <strong>{currentPath}</strong>
                </p>
                <p>
                  Search: <em>{searchQuery || "(none)"}</em>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resizer */}
      <div className="resizer" onMouseDown={() => setResizing(true)} />
    </div>
  );
};

export default Finder;
