import React, { useState, useRef, useEffect, useCallback } from "react";
import DisplayBar from "./DisplayBar";
import VideoQuestionCard from "../videoEditor/VideoCard";
import Display from "./VideoDisplay";

import type { QuestionCardData } from "../../types/QuestionCard";


interface VideoSegmentData {
  source: [number, number];
  isQuestionCard?: boolean;
  questionCardData?: QuestionCardData;
}

const VideoStatus: React.FC = () => {
  const [videoTime, setVideoTime] = useState(0);
  const [videoStopped, setVideoStopped] = useState(true); // true if paused
  const [videoDuration] = useState(0);
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

  // const videoDroppedInRef = useRef(false);

  const currentUniqueID = useRef<string>("");
  const videoFileRef = useRef<File | null>(null);
  const hasRestoredRef = useRef(false);


  // useEffect(() => {
  //   const restoreFromServerDB = async (lastID: string) => {
  //     // restoring from server
  //   };
  // }, []);

  useEffect(() => {
    if (hasRestoredRef.current) {
      console.log("loading saved")
      hasRestoredRef.current = false;
      return;
    }
    // } else if (videoDroppedInRef.current){
    //   console.log("resetting everything", videoDuration);
    //   setVideoSegments([{ source: [0, videoDuration] }]);
    //   videoLength.current = videoDuration;
    //   const calculatedWidth = videoLength.current * PIXELS_PER_SECOND;
    //   setBaseWidth(calculatedWidth);
    //   setInnerBarWidthPx((50 / 100) * calculatedWidth);
    //   currentUniqueID.current = uuidv4();
    // }
  }, [videoDuration]);

  // const videoSegmentsRef = useRef<VideoSegmentData[]>(videoSegments);

  // useEffect(() => {
  //   videoSegmentsRef.current = videoSegments;
  // }, [videoSegments]);

  // const extractAllSegments = (): VideoSegmentData[] => {
  //   return videoSegmentsRef.current;
  // };

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
        <Display
          editedLength={videoLength}
          videoTime={videoTime}
          setVideoStopped={setVideoStopped}
          videoStopped={videoStopped}
          metaData={videoSegments}
          currentQuestionCard={currentQuestionCard}
          setCurrentQuestionCard={setCurrentQuestionCard}
          currentTimeRef={currentTimeRef}
          currentUniqueID={currentUniqueID}
          videoFileRef={videoFileRef}
          videoSrc={videoSrc}
          setVideoSrc={setVideoSrc}
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

      <DisplayBar
        baseWidth={baseWidth}
        setVideoTime={setVideoTime}
        // setEditedLength={setEditedLength}
        videoLength={videoLength}
        videoSegments={videoSegments}
        currentTimeRef={currentTimeRef}
        innerBarWidthPx={innerBarWidthPx}
        setInnerBarWidthPx={setInnerBarWidthPx}
        widthPercent={widthPercent}
        setWidthPercent={setWidthPercent}
      />
    </>
  );
};

export default VideoStatus;
