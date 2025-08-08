import React, { useEffect, useState } from "react";
import "./BotDisplay.css";
import NameOverlayCard from "./cards/NameOverLay";
import { getAllBotsMeta } from "./interfaces/bot_storage";
import type { Bot } from "./interfaces/bot";

type BotPreview = Pick<Bot, "id" | "name" | "videoThumbnail">;

const BotDisplay: React.FC = () => {
  const [previews, setPreviews] = useState<BotPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meta = await getAllBotsMeta(); // [{ id, data }]
        if (cancelled) return;

        const items: BotPreview[] = meta.map(({ id, data }) => ({
          id,
          name: data.name ?? "Untitled",
          videoThumbnail: data.videoThumbnail ?? "",
        }));

        setPreviews(items);
      } catch (e) {
        console.error("Failed to load bots:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bot-display-container">
      <div className="bot-display-background">
        <span className="bot-display-text">Video</span>
      </div>

      <div className="bot-display-overlay">
        {loading && <div className="bot-display-loading">Loading…</div>}

        {!loading && previews.length === 0 && (
          <div className="bot-display-empty">No bots yet</div>
        )}

        {!loading && previews.length > 0 && (
          <div className="bot-grid">
            {previews.map(({ id, name, videoThumbnail }) => (
              <NameOverlayCard key={id} image={videoThumbnail} name={name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotDisplay;
