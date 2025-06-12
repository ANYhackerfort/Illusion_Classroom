import React from "react";
import { Box } from "@mui/material";
import PhotoGalleryWrapper from "../components/PhotoGalleryWrapper";
import PhotoCard from "../cards/PhotoCard";
import "./MeetingRoom.css";
import DraggableAnswerCard from "../cards/DraggableAnswerCard";

const MeetingRoom: React.FC = () => {
  return (
    <Box className="meeting-room-root">
      {/* Centered Answer Card */}
      <Box className="answer-card-center">
        <DraggableAnswerCard
          question="What's the capital of France?"
          options={["Berlin", "Madrid", "Paris", "Rome"]}
          onSelect={(option) => alert(`You selected: ${option}`)}
        />
      </Box>

      {/* Photo Gallery */}
      <PhotoGalleryWrapper>
        <PhotoCard photo="/anonymous_icon.jpg" name="Luna" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Kai" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Nova" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Ezra" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Milo" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Meyer" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Matthew" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Nova" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Ezra" />
        <PhotoCard photo="/anonymous_icon.jpg" name="Milo" />
      </PhotoGalleryWrapper>
    </Box>
  );
};

export default MeetingRoom;
