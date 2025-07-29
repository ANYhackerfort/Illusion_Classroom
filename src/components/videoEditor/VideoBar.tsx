import React, { useState, useRef, useEffect } from "react";
import "./VideoBar.css";
import { FaVideo } from "react-icons/fa";
import { useMemo } from "react";
import VideoSegment from "./VideoSegment";
import QuestionSegment from "./QuestionSegment";

interface QuestionCardData {
  question: string;
  answers: string[];
  difficulty: "easy" | "medium" | "hard";
  type: "slider" | "short" | "mc" | "match" | "rank" | "ai";
}

interface VideoSegmentData {
  source: [number, number];
  isQuestionCard?: boolean;
  questionCardData?: QuestionCardData;
}

interface VideoBarProps {
  onNeedleClick?: (needlePercent: number) => void;
  setVideoTime: (time: number) => void;
  setEditedLength: (length: number) => void;
  setMetaData: (data: VideoSegmentData[]) => void;
  videoStopped: boolean;
  initialVideoDuration: number;
  videoSegments: VideoSegmentData[];
  setVideoSegments: (
    updater: (prev: VideoSegmentData[]) => VideoSegmentData[],
  ) => void;
  currentTimeRef: React.RefObject<number>;
}

const VideoBar: React.FC<VideoBarProps> = ({
  setEditedLength,
  initialVideoDuration,
  setVideoTime,
  videoSegments,
  setVideoSegments,
  currentTimeRef,
}) => {
  const [widthPercent, setWidthPercent] = useState(50);
  const [baseWidth, setBaseWidth] = useState(0);
  const [innerBarWidthPx, setInnerBarWidthPx] = useState(0);
  // const [markers, setMarkers] = useState<number[]>([]);
  const [videoDuration, setVideoDuration] = useState(initialVideoDuration);
  const needleRef = useRef<HTMLDivElement>(null);
  const innerBarRef = useRef<HTMLDivElement>(null);
  const PIXELS_PER_SECOND = 100;
  const PADDING = 10;
  const prevWidthPercentRef = useRef(widthPercent);

  useEffect(() => {
    setVideoSegments(() => [{ source: [0, initialVideoDuration] }]);
    setVideoDuration(initialVideoDuration);
  }, [initialVideoDuration]);

  useEffect(() => {
    setEditedLength(videoDuration);
    const calculatedWidth = videoDuration * PIXELS_PER_SECOND;
    setBaseWidth(calculatedWidth);
  }, [videoDuration]);

  useEffect(() => {
    const width = (widthPercent / 100) * baseWidth;
    setInnerBarWidthPx(width);
  }, [widthPercent, baseWidth]);

  const markers = useMemo(() => {
    const pixelSpacing = 100;
    const approxTickCount = Math.floor(innerBarWidthPx / pixelSpacing);
    const tickInterval = Math.max(
      1,
      Math.round(videoDuration / approxTickCount),
    );
    const result: number[] = [];

    for (let i = 0; i <= videoDuration + PADDING; i += tickInterval) {
      result.push(i);
    }

    return result;
  }, [innerBarWidthPx, videoDuration]);

  const roundTo = (num: number, decimals = 12) => Number(num.toFixed(decimals));

  const handleSplitAndAdd = (
    source: [number, number],
    time: number,
    questionCardData: QuestionCardData,
    defaultLength: number,
    index: number,
  ) => {
    const [start, end] = source;
    const roundedTime = roundTo(time);
    const questionEnd = roundTo(roundedTime + defaultLength);
    const adjustedEnd = roundTo(end + defaultLength);

    const preSegment: VideoSegmentData = {
      source: [roundTo(start), roundedTime],
    };
    const questionSegment: VideoSegmentData = {
      source: [roundedTime, questionEnd],
      isQuestionCard: true,
      questionCardData,
    };
    const postSegment: VideoSegmentData = {
      source: [questionEnd, adjustedEnd],
    };

    setVideoDuration((prev) => roundTo(prev + defaultLength));

    setVideoSegments((prev) =>
      prev.flatMap((seg, i) => {
        if (i === index) {
          return [preSegment, questionSegment, postSegment];
        } else if (i > index) {
          const [s, e] = seg.source;
          return [
            {
              ...seg,
              source: [roundTo(s + defaultLength), roundTo(e + defaultLength)],
            },
          ];
        } else {
          return [seg];
        }
      }),
    );
  };

  const updateSegmentResize = (index: number, endDelta: number) => {
    setVideoSegments((prevSegments) => {
      const updatedSegments = [...prevSegments];
      const segment = updatedSegments[index];
      if (!segment) return prevSegments;

      const [start, end] = segment.source;
      const newEnd = end + endDelta;

      updatedSegments[index] = {
        ...segment,
        source: [start, newEnd],
      };

      for (let i = index + 1; i < updatedSegments.length; i++) {
        const [s, e] = updatedSegments[i].source;
        updatedSegments[i] = {
          ...updatedSegments[i],
          source: [s + endDelta, e + endDelta],
        };
      }

      return updatedSegments;
    });

    setVideoDuration((prev) => prev + endDelta);
  };

  // ⏱️ Needle tracking using currentTimeRef
  const videoDurationRef = useRef(videoDuration);
  const innerBarWidthPxRef = useRef(innerBarWidthPx);

  // Update refs only when dependencies change
  useEffect(() => {
    videoDurationRef.current = videoDuration;
  }, [videoDuration]);

  useEffect(() => {
    innerBarWidthPxRef.current = innerBarWidthPx;
  }, [innerBarWidthPx]);

  // Main animation effect (never restarts due to videoDuration changes)
const displayedX = useRef(0); // add this at top level of component
const animationFrame = useRef<number | null>(null);

useEffect(() => {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const animate = () => {
    const needle = needleRef.current;
    const duration = videoDurationRef.current;
    const width = innerBarWidthPxRef.current;
    const current = currentTimeRef.current ?? 0;

    if (!needle || !width || !duration) {
      animationFrame.current = requestAnimationFrame(animate);
      return;
    }

    const targetX = Math.min(current / duration, 1) * width;
    displayedX.current = lerp(displayedX.current, targetX, 0.15);

    needle.style.left = `calc(${displayedX.current}px - 2px)`;

    animationFrame.current = requestAnimationFrame(animate);
  };

  animationFrame.current = requestAnimationFrame(animate);

  return () => {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }
  };
}, []);


  const handleSetVideoPercentage = (percent: number) => {
    setVideoTime((percent / 100) * videoDuration);
    const x = (percent / 100) * innerBarWidthPx;
    if (needleRef.current) {
      needleRef.current.style.left = `calc(${x}px - 2px)`;
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Number(e.target.value);
    if (prevWidthPercentRef.current !== newWidth) {
      prevWidthPercentRef.current = newWidth;
    }
    setWidthPercent(newWidth);
  };

  if (!innerBarWidthPx) return null;

  return (
    <div className="video-bar-container">
      <div className="video-slider-container">
        <label className="zoom-label">Zoom</label>
        <input
          type="range"
          min="1"
          max="100"
          value={widthPercent}
          onChange={handleZoomChange}
        />
      </div>

      <div className="video-outer-bar">
        <div className="video-icon-box">
          <FaVideo size={20} />
        </div>

        <div className="video-inner-bar-wrapper" ref={innerBarRef}>
          {markers.map((second) => (
            <div
              key={second}
              style={{
                position: "absolute",
                left: `${(second / videoDuration) * innerBarWidthPx}px`,
                textAlign: "center",
              }}
            >
              <div className="video-tick" />
              <div className="video-tick-label">{second}s</div>
            </div>
          ))}

          {videoSegments.map((segment, index) =>
            segment.isQuestionCard && segment.questionCardData ? (
              <QuestionSegment
                key={index}
                index={index}
                source={segment.source}
                multiplier={widthPercent / 100}
                videoDuration={videoDuration}
                updateSegment={updateSegmentResize}
                questionCardData={segment.questionCardData}
                setVideoPercent={handleSetVideoPercentage}
              />
            ) : (
              <VideoSegment
                key={index}
                index={index}
                source={segment.source}
                multiplier={widthPercent / 100}
                videoDuration={videoDuration}
                innerBarWidthPx={innerBarWidthPx}
                setVideoPercent={handleSetVideoPercentage}
                splitAndAdd={handleSplitAndAdd}
              />
            ),
          )}

          <div
            className="needle"
            ref={needleRef}
            style={{
              position: "absolute",
              left: 0,
              transition: "none",
              zIndex: 100,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoBar;
