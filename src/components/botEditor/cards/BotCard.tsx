import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";
import type { Bot } from "../interfaces/bot";

interface BotCardProps extends Omit<Bot, "id"> {
  onEdit?: () => void;
}

const matteColors = [
  "#E0E0E0", // light grey
  "#B2DFDB", // teal matte
  "#C8E6C9", // green matte
  "#FFF9C4", // yellow matte
  "#F8BBD0", // pink matte
  "#D1C4E9", // purple matte
  "#FFECB3", // amber matte
];

const BotCard: React.FC<BotCardProps> = ({
  videoThumbnail,
  memory,
  answer_select,
  randomize,
  onEdit,
  name,
}) => {
  // Pick a random matte color once per mount
  const cardColor = useMemo(
    () => matteColors[Math.floor(Math.random() * matteColors.length)],
    [],
  );

  return (
    <Card
      sx={{
        maxWidth: 300,
        backgroundColor: cardColor,
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Video thumbnail */}
      <CardMedia
        component="img"
        height="180"
        image={videoThumbnail}
        alt="Bot Thumbnail"
      />

      <CardContent>
        {/* Bot Name */}
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            padding: "8px 12px",
            fontWeight: "bold",
            wordBreak: "break-word",
          }}
        >
          {name}
        </Typography>

        {/* Memory */}
        <Typography variant="subtitle1" gutterBottom>
          <strong>Memory:</strong> {memory}
        </Typography>

        {/* Answer Select */}
        <Typography variant="subtitle1" gutterBottom>
          <strong>Answers:</strong> {answer_select.join(", ")}
        </Typography>

        {/* Randomize */}
        <Typography variant="subtitle1" gutterBottom>
          <strong>Randomize:</strong>{" "}
          {randomize === -1 ? "Not Random" : randomize}
        </Typography>

        {/* Edit Button */}
        <Button
          fullWidth
          onClick={onEdit}
          sx={{
            mt: 2,
            backgroundColor: "#333", // dark gray
            color: "#fff",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#444", // slightly lighter on hover
            },
          }}
        >
          Edit
        </Button>
      </CardContent>
    </Card>
  );
};

export default BotCard;
