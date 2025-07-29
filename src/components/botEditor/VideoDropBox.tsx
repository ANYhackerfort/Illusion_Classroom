import React, { useState } from "react";
import "./VideoDropBox.css";

interface VideoDropBoxProps {
  onVideoDrop: (files: File[]) => void;
}

const VideoDropBox: React.FC<VideoDropBoxProps> = ({ onVideoDrop }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("video/"),
    );
    onVideoDrop(files);
  };

  return (
    <div
      className={`video-drop-box ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p>Drop video files here</p>
    </div>
  );
};

export default VideoDropBox;
