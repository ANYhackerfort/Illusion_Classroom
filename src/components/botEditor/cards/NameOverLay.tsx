import React from "react";
import { Card, CardMedia, Box, Typography } from "@mui/material";

interface NameOverlayCardProps {
  image: string; // can be a file URL or data URL
  name: string;
}

const NameOverlayCard: React.FC<NameOverlayCardProps> = ({ image, name }) => {
  return (
    <Card
      sx={{
        position: "relative",
        maxWidth: 300,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Main image */}
      <CardMedia component="img" height="180" image={image} alt={name} />

      {/* Name overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "#fff",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "0.85rem",
        }}
      >
        <Typography variant="body2">{name}</Typography>
      </Box>
    </Card>
  );
};

export default NameOverlayCard;
