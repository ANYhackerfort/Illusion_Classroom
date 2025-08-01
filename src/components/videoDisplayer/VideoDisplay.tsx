import React, { useRef, useEffect } from "react";
import "./VideoDisplay.css";
import { useMouse } from '../../hooks/drag/MouseContext';
import { getVideoById } from '../../indexDB/videoStorage';

import type { QuestionCardData } from "../../types/QuestionCard";

interface VideoSegmentData {
  source: [number, number];
  isQuestionCard?: boolean;
  questionCardData?: QuestionCardData;
}

interface DisplayProps {
  videoTime: number;
  editedLength: React.RefObject<number>;
  setVideoStopped: (stopped: boolean) => void;
  metaData: VideoSegmentData[];
  videoStopped: boolean;
  currentQuestionCard: QuestionCardData | null;
  setCurrentQuestionCard: (card: QuestionCardData | null) => void;
  currentTimeRef: React.RefObject<number>;
  currentUniqueID: React.RefObject<string>;
  videoFileRef: React.RefObject<File | null>;
  videoSrc: string | null;
  setVideoSrc: (videoSrc: string | null) => void;
  setVideoSegments: (segments: VideoSegmentData[]) => void;
  updateWidths: (base: number, inner: number) => void;
  setWidthPercent: (width: number) => void;
}

const Display: React.FC<DisplayProps> = ({
  videoTime,
  editedLength,
  metaData,
  currentQuestionCard,
  setCurrentQuestionCard,
  currentTimeRef,
  currentUniqueID,
  videoFileRef,
  videoSrc,
  setVideoSrc,
  setVideoSegments,
  updateWidths,
  setWidthPercent,
}) => {
  // const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  // const currentTimeRef = useRef<number>(0);

  const metaDataRef = useRef<VideoSegmentData[]>(metaData);
  const isPlayingRef = useRef(false); // actaul video
  const videoStoppedRef = useRef(true); // The entirety of video with question cards
  const videoOverRef = useRef(false);

  const { draggedItem } = useMouse();

  const PIXELS_PER_SECOND = 100;

  useEffect(() => {
    metaDataRef.current = metaData;
  }, [metaData]);

  // useEffect(() => {
  //   isPlayingRef.current = isPlaying;
  // }, [isPlaying]);

  // useEffect(() => {
  //   videoStoppedRef.current = videoStopped;
  // }, [videoStopped]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTimeRef.current > editedLength.current) {
        currentTimeRef.current = 0;
      }
      if (videoOverRef.current === true) {
        //TODO: todo to give me form logic
        currentTimeRef.current = 0;
        videoOverRef.current = false;
      }

      if (!videoSrc) return;
      if (videoStoppedRef.current) {
        const now = currentTimeRef.current;

        // 🎯 Find active segment using latest metaData
        const activeSegment = metaDataRef.current.find((seg) => {
          const [start, end] = seg.source;
          return now >= start && now < end;
        });

        if (activeSegment?.isQuestionCard && activeSegment.questionCardData) {
          setCurrentQuestionCard(activeSegment.questionCardData);
        } else {
          setCurrentQuestionCard(null);
        }
      } else {
        // ⏱️ Advance custom time by 100ms
        currentTimeRef.current += 0.1;
        const now = currentTimeRef.current;

        // 🎯 Find active segment using latest metaData
        const activeSegment = metaDataRef.current.find((seg) => {
          const [start, end] = seg.source;
          return now >= start && now < end;
        });

        if (activeSegment?.isQuestionCard && activeSegment.questionCardData) {
          if (videoRef.current && isPlayingRef.current) {
            videoRef.current.pause();
            // setIsPlaying(false);
            isPlayingRef.current = false;
          }
          setCurrentQuestionCard(activeSegment.questionCardData);
        } else {
          setCurrentQuestionCard(null);

          if (videoRef.current && !isPlayingRef.current) {
            videoRef.current.play();
            // setIsPlaying(true);
            isPlayingRef.current = true;
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [videoSrc]);

  // Unmounts
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const togglePlay = () => {
    const now = currentTimeRef.current;
    const activeSegment = metaData.find((seg) => {
      const [start, end] = seg.source;
      return now >= start && now < end;
    });

    if (activeSegment?.isQuestionCard && activeSegment.questionCardData) {
      if (videoRef.current) {
        videoRef.current.pause();
        isPlayingRef.current = false;
        // setIsPlaying(false);
      }

      if (!currentQuestionCard) {
        setCurrentQuestionCard(activeSegment.questionCardData);
      }

      videoStoppedRef.current = !videoStoppedRef.current;
      return;
    } else {
      if (currentQuestionCard) {
        setCurrentQuestionCard(null);
      }

      if (videoRef.current) {
        if (isPlayingRef.current) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        isPlayingRef.current = !isPlayingRef.current;
        // setIsPlaying(!isPlaying);
      }
      videoStoppedRef.current = !videoStoppedRef.current;
    }
  };

  // ⏯️ Listen for spacebar key to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scroll
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [metaData]);

  const getRealVideoTimeFromEditedTime = (
    editedTime: number,
    segments: VideoSegmentData[],
  ): number => {
    let offset = 0;

    for (const seg of segments) {
      if (seg.isQuestionCard) {
        const [start, end] = seg.source;

        if (editedTime >= end) {
          offset += end - start; // full question block before this time
        } else if (editedTime > start) {
          offset += editedTime - start; // partial overlap (currently in question)
        }
      }
    }

    return editedTime - offset;
  };

  // useEffect(() => {
  //   if (videoRef.current && editedLength > 0) {
  //     const targetTime = videoTime;
  //     videoRef.current.currentTime = getRealVideoTimeFromEditedTime(
  //       targetTime,
  //       metaData,
  //     );
  //     currentTimeRef.current = targetTime;

  //     // 🧠 Determine active segment based on time
  //     const activeSegment = metaData.find((seg) => {
  //       const [start, end] = seg.source;
  //       return targetTime >= start && targetTime < end;
  //     });

  //     if (activeSegment?.isQuestionCard && activeSegment.questionCardData) {
  //       setCurrentQuestionCard(activeSegment.questionCardData);
  //     } else {
  //       setCurrentQuestionCard(null);
  //     }
  //   }
  // }, [videoTime, setCurrentQuestionCard]);

  useEffect(() => {
    if (videoRef.current && editedLength.current > 0) {
      const targetTime = videoTime;
      currentTimeRef.current = targetTime;
      videoRef.current.currentTime = getRealVideoTimeFromEditedTime(
        targetTime,
        metaData,
      );

      // 🧠 Determine active segment based on time
      const activeSegment = metaData.find((seg) => {
        const [start, end] = seg.source;
        return targetTime >= start && targetTime < end;
      });

      if (activeSegment?.isQuestionCard && activeSegment.questionCardData) {
        setCurrentQuestionCard(activeSegment.questionCardData);
      } else {
        setCurrentQuestionCard(null);
      }
    }
  }, [videoTime]);

  // const handleLoadedMetadata = () => {
  //   if (videoRef.current) {
  //     console.log("HI DOPPRED setting state");
  //     setVideoDuration(videoRef.current.duration);
  //   }
  // };

  const handleEnded = () => {
    isPlayingRef.current = false;
    // videoStoppedRef.current = true;
    videoOverRef.current = true;
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedItem?.type === "edited-video") {
      if (e) {
        e.preventDefault();
      }
      console.log("Found edited-video");

      const id = draggedItem.data.id;
      console.log("the id is", id);

      // ✅ Use IndexedDB instead of localStorage
      const result = await getVideoById(id);
      if (!result) {
        console.warn("No video found in IndexedDB with ID:", id);
        return;
      }

      const { metadata, file } = result;
      const { questionCards: storedSegments, videoLength: storedDuration } = metadata;

      // Merge with current state
      setVideoSegments(storedSegments);

      // 3) Set video length
      editedLength.current = storedDuration;

      // 4) Compute width
      const calculatedWidth = editedLength.current * PIXELS_PER_SECOND;

      // 5) Call passed-in function to update widths
      updateWidths(calculatedWidth, (calculatedWidth * 50) / 100);

      // 6) Set unique ID
      currentUniqueID.current = id;

      // 7) Set video source from stored file
      const url = URL.createObjectURL(file);
      setVideoSrc(url);

      // 8) Reset video timer
      currentTimeRef.current = 0;
      videoFileRef.current = file; 

      isPlayingRef.current = false; 

      setWidthPercent(50);
    }
  };

  useEffect(() => {
    console.log("Received videoSrc in VideoDisplay:", videoSrc);
  }, [videoSrc]);

  return (
    <div className="video-display-wrapper">
      <div
        className="video-display-container"
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
      >
        {!videoSrc ? (
          <div className="video-drop-zone">Drag an edited video here to start playing...</div>
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            className="video-element"
            onClick={togglePlay}
            onEnded={handleEnded} // ✅ End of video handler
          />
        )}
      </div>
    </div>
  );
};

export default Display;
