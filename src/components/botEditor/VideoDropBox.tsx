import React, { useState, useCallback, useEffect } from "react";
import "./VideoDropBox.css";
import { v4 as uuidv4 } from "uuid";
import { saveBot, getAllBotsMeta } from "./interfaces/bot_storage";
import BotCard from "./cards/BotCard";
import type { Bot } from "./interfaces/bot";
import { generateVideoThumbnail } from "./interfaces/bot";

const VideoDropBox: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);

  // ⬇️ On mount: load all bots (without video file)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meta = await getAllBotsMeta(); // returns [{ id, data }]
        if (!cancelled) {
          setBots(meta.map((m) => m.data));
        }
      } catch (err) {
        console.error("Failed to load bots from DB:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("video/"),
    );
    if (files.length === 0) return;

    const newBots: Bot[] = await Promise.all(
      files.map(async (file) => {
        const id = uuidv4();
        const thumbDataUrl = await generateVideoThumbnail(file);
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        return {
          id,
          name: baseName,
          videoThumbnail: thumbDataUrl, // actual image data (data URL)
          memory: "",
          answer_select: [],
          randomize: -1,
        };
      }),
    );

    await Promise.all(newBots.map((bot, i) => saveBot(bot, files[i])));

    setBots((prev) => [...prev, ...newBots]);
  }, []);

  return (
    <div
      className={`video-drop-box ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {bots.length === 0 && (
        <div className="drop-message">Drop bot video files here</div>
      )}

      <div className="bot-grid">
        {bots.map((b) => (
          <BotCard
            key={b.id}
            name={b.name}
            videoThumbnail={b.videoThumbnail}
            memory={b.memory}
            answer_select={b.answer_select}
            randomize={b.randomize}
            onEdit={() => console.log("Edit bot", b.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoDropBox;
