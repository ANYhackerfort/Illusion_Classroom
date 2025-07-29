import React, { useState } from "react";
import VideoCarousel from "../../components/video/VideoCarousel";
import VideoDrop from "../../components/video/VideoDrop";
import "./VideoSettingsPage.css";

const VideoSettingsPage: React.FC = () => {
  const [videos, setVideos] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<(string | undefined)[]>([]);

  const handleSelect = async (file: File, index: number) => {
    const newVideos = [...videos];
    newVideos[index] = file;
    setVideos(newVideos);

    const thumb = await getThumbnail(file);
    const newThumbs = [...thumbnails];
    newThumbs[index] = thumb;
    setThumbnails(newThumbs);
  };

  const getThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };

      video.onerror = () => {
        reject("Failed to load video");
      };
    });
  };

  return (
    <div className="video-settings-page">
      <h1 className="main-title">Video Control Page</h1>

      <div className="settings-row">
        <h2 className="settings-title">Video Carousel</h2>
        <p className="settings-description">
          Drag videos into the boxes in the order you want them to be played.
        </p>
        <VideoCarousel>
          {[...videos, undefined].map((file, index) => (
            <VideoDrop
              key={index}
              onFileSelect={(file) => handleSelect(file, index)}
              thumbnail={thumbnails[index]}
            />
          ))}
        </VideoCarousel>
      </div>

      <div className="settings-row">
        <h2 className="settings-title">Advanced Video Control</h2>
        <p className="settings-description">
          Adjust volume, speed, enable subtitles or filters, and try out AI
          Assistance.
        </p>

        <div className="control-panel-container">
          <div className="control-panel">
            <div className="control-item">
              <label className="slider-label">Speed</label>
              <div className="slider-wrapper">
                <input
                  id="speed"
                  type="range"
                  min="0.25"
                  max="2"
                  step="0.05"
                  className="slider vertical"
                />
              </div>
            </div>

            <div className="control-item">
              <label className="slider-label">Volume</label>
              <div className="slider-wrapper">
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  className="slider vertical"
                />
              </div>
            </div>

            {/* Subtitles Toggle */}
            <div className="control-item horizontal-toggle">
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider-toggle"></span>
              </label>
              <span className="toggle-label">Enable Subtitles</span>
            </div>

            {/* Filter Toggle */}
            <div className="control-item horizontal-toggle">
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider-toggle"></span>
              </label>
              <span className="toggle-label">Filter</span>
            </div>

            {/* AI Assistance */}
            <div className="control-item horizontal-toggle">
              <label className="rainbow-toggle">
                <input type="checkbox" />
                <span className="rainbow-slider"></span>
              </label>
              <span className="toggle-label">ALLOW AI Assistance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSettingsPage;
