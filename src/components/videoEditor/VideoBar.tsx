import React, { useState, useRef, useEffect, useCallback } from "react";
import "./VideoBar.css";
import { FaVideo } from "react-icons/fa";
import { useMemo } from "react";
import VideoSegment from "./VideoSegment";
import QuestionSegment from "./QuestionSegment";
import DefaultLengthControl from "./DefaultLengthControl";

import type { QuestionCardData } from "../../types/QuestionCard";

interface VideoSegmentData {
  source: [number, number];
  isQuestionCard?: boolean;
  questionCardData?: QuestionCardData;
}

interface VideoBarProps {
  setVideoTime: (time: number) => void;
  videoLength: React.RefObject<number>;
  baseWidth: number;
  videoSegments: VideoSegmentData[];
  setVideoSegments: (
    updater: (prev: VideoSegmentData[]) => VideoSegmentData[],
  ) => void;
  currentTimeRef: React.RefObject<number>;
  setInnerBarWidthPx: (px: number) => void;
  innerBarWidthPx: number;
  setBaseWidth: (width: number) => void;
  widthPercent: number;
  setWidthPercent: (width: number) => void;
}

const VideoBar: React.FC<VideoBarProps> = ({
  baseWidth,
  setVideoTime,
  videoSegments,
  setVideoSegments,
  currentTimeRef,
  videoLength,
  setInnerBarWidthPx,
  innerBarWidthPx,
  setBaseWidth,
  widthPercent,
  setWidthPercent,
}) => {
  // const [widthPercent, setWidthPercent] = useState(50);
  const [defaultLength, setDefaultLength] = useState(10);
  const needleRef = useRef<HTMLDivElement>(null);
  const innerBarRef = useRef<HTMLDivElement>(null);
  const PIXELS_PER_SECOND = 100;
  const PADDING = 10;
  const prevWidthPercentRef = useRef(widthPercent);

  useEffect(() => {
    const newWidth =
      (widthPercent / 100) * videoLength.current * PIXELS_PER_SECOND;
    setInnerBarWidthPx(newWidth);
  }, [widthPercent]);

    useEffect(() => {
      console.log("SFSFSFSFJSOPFIJSOidfjoisj")
  }, []);

  const markers = useMemo(() => {
    const pixelSpacing = 100;
    const approxTickCount = Math.floor(innerBarWidthPx / pixelSpacing);
    const tickInterval = Math.max(
      1,
      Math.round(videoLength.current / approxTickCount),
    );
    const result: number[] = [];

    for (let i = 0; i <= videoLength.current + PADDING; i += tickInterval) {
      result.push(i);
    }

    return result;
  }, [innerBarWidthPx]);

  // const roundTo = (num: number, decimals = 12) => Number(num.toFixed(decimals));

  const handleSplitAndAdd = (
    source: [number, number],
    time: number,
    questionCardData: QuestionCardData,
    index: number,
  ) => {
    const [start, end] = source;
    const questionEnd = time + defaultLength;
    const adjustedEnd = end + defaultLength;

    const preSegment: VideoSegmentData = {
      source: [start, time],
    };
    const questionSegment: VideoSegmentData = {
      source: [time, questionEnd],
      isQuestionCard: true,
      questionCardData,
    };
    const postSegment: VideoSegmentData = {
      source: [questionEnd, adjustedEnd],
    };

    videoLength.current += defaultLength;
    const calculatedWidth = videoLength.current * PIXELS_PER_SECOND;
    setBaseWidth(calculatedWidth);
    setInnerBarWidthPx((widthPercent / 100) * calculatedWidth);

    setVideoSegments((prev) =>
      prev.flatMap((seg, i) => {
        if (i === index) {
          return [preSegment, questionSegment, postSegment];
        } else if (i > index) {
          const [s, e] = seg.source;
          return [
            {
              ...seg,
              source: [s + defaultLength, e + defaultLength],
            },
          ];
        } else {
          return [seg];
        }
      }),
    );
  };

  const updateSegmentResize = useCallback(
    (index: number, newEnd: number) => {
      setVideoSegments((prevSegments) => {
        const seg = prevSegments[index];
        if (!seg) return prevSegments;

        const [start, end] = seg.source;
        const endDelta = newEnd - end;
        if (endDelta === 0) return prevSegments;

        // Build updated array based on prevSegments (no stale reads)
        const updated = prevSegments.map((s, i) => {
          if (i === index) {
            return { ...s, source: [start, newEnd] as [number, number] };
          }
          if (i > index) {
            const [s0, s1] = s.source;
            return {
              ...s,
              source: [s0 + endDelta, s1 + endDelta] as [number, number],
            };
          }
          return s;
        });

        // Recompute total duration from last segment end (don't accumulate deltas)
        const lastEnd = updated[updated.length - 1]?.source[1] ?? 0;
        const newDuration = Math.max(0, lastEnd);

        // Update refs and widths from the recomputed duration
        videoLength.current = newDuration;
        const calculatedWidth = newDuration * PIXELS_PER_SECOND;
        setBaseWidth(calculatedWidth);
        setInnerBarWidthPx((widthPercent / 100) * calculatedWidth);

        return updated;
      });
    },
    [
      setVideoSegments,
      setBaseWidth,
      setInnerBarWidthPx,
      widthPercent,
      videoLength,
    ],
  );

  // ⏱️ Needle tracking using currentTimeRef
  const innerBarWidthPxRef = useRef(innerBarWidthPx);

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
      const duration = videoLength.current;
      const width = innerBarWidthPxRef.current;
      const current = currentTimeRef.current ?? 0;

      if (!needle || !width || !duration) {
        animationFrame.current = requestAnimationFrame(animate);
        return;
      }

      const targetX = Math.min(current / duration, 1) * width;
      displayedX.current = lerp(displayedX.current, targetX, 0.3);

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

  const handleSetVideoTime = (time: number) => {
    setVideoTime(time);
    console.log("SETTING AT ", time);
    const x = (time / 100) * innerBarWidthPx;
    console.log("THE X BEING", x);
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
    const width = (newWidth / 100) * baseWidth;
    setInnerBarWidthPx(width);
  };

  const handleDelete = (index: number) => {
    const curr = videoSegments[index];
    if (!curr) return;

    const [start, end] = curr.source;
    const delta = end - start;

    const prev = videoSegments[index - 1];
    const next = videoSegments[index + 1];

    if (prev && next) {
      // Case 1: Merge prev and next
      const minStart = prev.source[0];
      const maxEnd = next.source[1] - delta;

      const mergedSegment = {
        source: [minStart, maxEnd] as [number, number],
      };

      setVideoSegments((prevSegments) => {
        const updated = [...prevSegments];
        updated.splice(index - 1, 3, mergedSegment); // replace 3 segments
        return updated;
      });

      // const mergedLength = maxEnd - minStart;
      // const totalRemoved =
      //   prev.source[1] -
      //   prev.source[0] +
      //   (end - start) +
      //   (next.source[1] - next.source[0]);

      // setVideoDuration((prev) => prev - totalRemoved + mergedLength);
      videoLength.current = videoLength.current - delta;
      const calculatedWidth = videoLength.current * PIXELS_PER_SECOND;
      setBaseWidth(calculatedWidth);
      setInnerBarWidthPx((widthPercent / 100) * calculatedWidth); // ✅ again here
      console.log(videoSegments);
    } else {
      // Case 2: Just remove current segment, shift later segments
      setVideoSegments((prevSegments) =>
        prevSegments
          .filter((_, i) => i !== index)
          .map((seg, i) => {
            if (i < index) return seg;
            const [s, e] = seg.source;
            return {
              ...seg,
              source: [s - delta, e - delta] as [number, number],
            };
          }),
      );

      // setVideoDuration((prev) => prev - delta);
      videoLength.current = videoLength.current - delta;
      const calculatedWidth = videoLength.current * PIXELS_PER_SECOND;
      setBaseWidth(calculatedWidth);
      setInnerBarWidthPx((widthPercent / 100) * calculatedWidth); // ✅ again here
      console.log(videoSegments);
    }
  };

  if (!innerBarWidthPx) return null;

  return (
    <div className="video-bar-container">
      <div className="video-slider-container">
        <DefaultLengthControl
          value={defaultLength}
          setValue={setDefaultLength}
        />
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

        <div
          className="video-inner-bar-wrapper"
          ref={innerBarRef}
          onMouseUp={() => console.log("hi")}
        >
          {markers.map((second) => (
            <div
              key={second}
              style={{
                position: "absolute",
                left: `${(second / videoLength.current) * innerBarWidthPx}px`,
                textAlign: "center",
                pointerEvents: "none",
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
                videoDurationRef={videoLength}
                updateSegment={updateSegmentResize}
                questionCardData={segment.questionCardData}
                setVideoPercent={handleSetVideoTime}
                onDelete={handleDelete}
              />
            ) : (
              <VideoSegment
                key={index}
                index={index}
                source={segment.source}
                multiplier={widthPercent / 100}
                videoDurationRef={videoLength}
                innerBarWidthPx={innerBarWidthPx}
                setVideoPercent={handleSetVideoTime}
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
