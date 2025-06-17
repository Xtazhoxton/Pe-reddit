// src/components/VideoPlayer.jsx
import React from 'react';

export default function VideoPlayer({ media }) {
  const url = media.reddit_video.fallback_url;
  return (
    <video
      src={url}
      controls
      muted
      loop
      className="w-full h-auto rounded-md"
      poster={media.reddit_video.thumbnail_url}
    />
  );
}
