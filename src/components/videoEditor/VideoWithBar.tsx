import React, { useState, useRef, useEffect, useCallback } from "react";
import VideoBar from "./VideoBar";
import VideoDisplay from "./VideoDisplay";
import VideoQuestionCard from "./VideoCard";
import SaveButton from "./SaveForm";
import { v4 as uuidv4 } from "uuid";

import { saveVideoToIndexedDB, getVideoById } from "../../indexDB/videoStorage";
import type { VideoMetadata } from "../../indexDB/videoStorage";

import type { QuestionCardData } from "../../types/QuestionCard";

interface VideoSegmentData {
  source: [number, number];
  isQuestionCard?: boolean;
  questionCardData?: QuestionCardData;
}

const VideoPlayerWithBar: React.FC = () => {
  const [videoTime, setVideoTime] = useState(0);
  const [videoStopped, setVideoStopped] = useState(true); // true if paused
  const [videoDuration, setVideoDuration] = useState(0);
  // const [editedLength, setEditedLength] = useState(0);
  const videoLength = useRef(0);
  const [videoSegments, setVideoSegments] = useState<VideoSegmentData[]>([]);
  const [currentQuestionCard, setCurrentQuestionCard] =
    useState<QuestionCardData | null>(null);
  const currentTimeRef = useRef<number>(0);
  const [baseWidth, setBaseWidth] = useState(0);
  const [innerBarWidthPx, setInnerBarWidthPx] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [widthPercent, setWidthPercent] = useState(50);

  const videoDroppedInRef = useRef(false);

  const currentUniqueID = useRef<string>("");
  const videoFileRef = useRef<File | null>(null);

  const PIXELS_PER_SECOND = 100;

  const hasRestoredRef = useRef(false);

  useEffect(() => {
    console.log("Auto Save capabilities mounted.");

    return () => {
      const id = currentUniqueID.current;
      const length = videoLength.current;
      const videoFile = videoFileRef.current;
      const questionCards = extractAllSegments();

      console.log("EXTRACTED QUESTION CARDS", questionCards);

      if (!videoFile) {
        console.warn("No video file to persist");
        return;
      }

      getVideoById(id).then((existing) => {
        let metadata: VideoMetadata;

        if (existing) {
          // ✅ Update only the questionCards
          metadata = {
            ...existing.metadata,
            questionCards,
            savedAt: new Date().toISOString(), // optionally update timestamp
          };
          console.log("🔁 Updating existing video metadata only");
        } else {
          // ✅ New entry
          metadata = {
            id,
            videoName: "Unsaved",
            videoTags: [],
            videoLength: length,
            questionCards,
            savedAt: new Date().toISOString(),
          };
          console.log("🆕 Saving new video entry");
        }

        saveVideoToIndexedDB(metadata, videoFile).then(() => {
          localStorage.setItem("lastVideoID", id);
          console.log("✅ Auto-saved video & metadata on unmount");
        });
      });
    };
  }, []);


  useEffect(() => {
    const restoreFromIndexedDB = async (lastID: string) => {
      console.log("RESTORING BAD BAD BAD")
      try {
        const result = await getVideoById(lastID);
        if (!result) return;

        const { metadata, file } = result;

        hasRestoredRef.current = true;

        // 🎥 Restore file
        videoFileRef.current = file;
        const objectURL = URL.createObjectURL(file);

        // ✅ Restore segments directly (they now include all types)
        setVideoSegments(metadata.questionCards); // questionCards now = all segments
        videoLength.current = metadata.videoLength;
        currentUniqueID.current = metadata.id;
        setVideoSrc(objectURL);

        // 📐 Recalculate bar width
        const calculatedWidth = metadata.videoLength * PIXELS_PER_SECOND;
        setBaseWidth(calculatedWidth);
        setInnerBarWidthPx((50 / 100) * calculatedWidth);

        console.log("✅ Restored full timeline from IndexedDB");
      } catch (err) {
        console.error("❌ Failed to restore video:", err);
      }
    };

    const lastID = localStorage.getItem("lastVideoID");
    if (lastID) {
      restoreFromIndexedDB(lastID);
    }
  }, []);

  useEffect(() => {
    if (hasRestoredRef.current) {
      console.log("loading saved")
      hasRestoredRef.current = false;
      return;
    } else if (videoDroppedInRef.current){
      console.log("resetting everything", videoDuration);
      setVideoSegments([{ source: [0, videoDuration] }]);
      videoLength.current = videoDuration;
      const calculatedWidth = videoLength.current * PIXELS_PER_SECOND;
      setBaseWidth(calculatedWidth);
      setInnerBarWidthPx((50 / 100) * calculatedWidth);
      currentUniqueID.current = uuidv4();
    }
    console.log("ignored for handle dropped in already edited")
  }, [videoDuration]);

  const videoSegmentsRef = useRef<VideoSegmentData[]>(videoSegments);

  useEffect(() => {
    videoSegmentsRef.current = videoSegments;
  }, [videoSegments]);

  const extractAllSegments = (): VideoSegmentData[] => {
    return videoSegmentsRef.current;
  };

  const handleVideoSave = async (name: string, tag: string) => {
    const id = currentUniqueID.current;
    const length = videoLength.current;
    const questionCards = extractAllSegments();
    const videoFile = videoFileRef.current;

    if (!videoFile) {
      console.error("No video file to save");
      return;
    }

    const metadata: VideoMetadata = {
      id,
      videoName: name,
      videoTags: tag.split(",").map((t) => t.trim()),
      videoLength: length,
      questionCards,
      savedAt: new Date().toISOString(),
    };

    try {
      await saveVideoToIndexedDB(metadata, videoFile);
      console.log(`✅ Video saved to IndexedDB with ID: ${id}`);
    } catch (err) {
      console.error("❌ Error saving to IndexedDB:", err);
    }
  };

  const handleUpdateWidth = useCallback((base: number, inner: number) => {
    setBaseWidth(base);
    setInnerBarWidthPx(inner);
  }, [setBaseWidth, setInnerBarWidthPx]);

  return (
    <>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <VideoDisplay
          editedLength={videoLength}
          videoTime={videoTime}
          setVideoStopped={setVideoStopped}
          setVideoDuration={setVideoDuration}
          videoStopped={videoStopped}
          metaData={videoSegments}
          currentQuestionCard={currentQuestionCard}
          setCurrentQuestionCard={setCurrentQuestionCard}
          currentTimeRef={currentTimeRef}
          currentUniqueID={currentUniqueID}
          videoFileRef={videoFileRef}
          videoSrc={videoSrc}
          setVideoSrc={setVideoSrc}
          videoDroppedRef={videoDroppedInRef}
          setVideoSegments={setVideoSegments}
          updateWidths={handleUpdateWidth}
          setWidthPercent={setWidthPercent}
        />

        {currentQuestionCard && (
          <div
            style={{
              position: "absolute",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "auto",
              zIndex: 10,
            }}
          >
            <VideoQuestionCard
              question={currentQuestionCard.question}
              answers={currentQuestionCard.answers}
              difficulty={currentQuestionCard.difficulty}
              type={currentQuestionCard.type}
              displayType={currentQuestionCard.displayType}
              showWinner={currentQuestionCard.showWinner}
              live={currentQuestionCard.live}
            />
          </div>
        )}
      </div>

      <VideoBar
        baseWidth={baseWidth}
        setVideoTime={setVideoTime}
        // setEditedLength={setEditedLength}
        videoLength={videoLength}
        videoSegments={videoSegments}
        setVideoSegments={setVideoSegments}
        currentTimeRef={currentTimeRef}
        innerBarWidthPx={innerBarWidthPx}
        setInnerBarWidthPx={setInnerBarWidthPx}
        setBaseWidth={setBaseWidth}
        widthPercent={widthPercent}
        setWidthPercent={setWidthPercent}
      />

      {videoDuration !== 0 && <SaveButton onSave={handleVideoSave} />}
    </>
  );
};

export default VideoPlayerWithBar;
