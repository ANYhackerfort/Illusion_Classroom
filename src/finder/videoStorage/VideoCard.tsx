import React from "react";
import "./VideoCard.css";

interface VideoCardProps {
  location: string;
  thumbnail: string;
  title: string;
  createdTime: string;
  lastAccessed: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  location,
  thumbnail,
  title,
  createdTime,
  lastAccessed,
}) => {
  return (
    <div className="video-card-wrapper">
      <div className="video-card">
        <img src={thumbnail} alt={title} className="video-thumbnail" />
      </div>
      <div className="video-title">{title}</div>
    </div>
  );
};

export default VideoCard;
