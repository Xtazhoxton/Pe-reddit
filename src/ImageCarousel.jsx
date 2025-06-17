// src/components/ImageCarousel.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageCarousel({ galleryData, mediaMetadata }) {
  const ids = galleryData.items.map(item => item.media_id);
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + ids.length) % ids.length);
  const next = () => setIdx(i => (i + 1) % ids.length);
  const image = mediaMetadata[ids[idx]].s.u.replace(/&amp;/g, '&');

  return (
    <div className="relative w-full">
      <img src={image} alt="" className="w-full h-auto rounded-md" />
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-white bg-opacity-75 rounded-full"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-white bg-opacity-75 rounded-full"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
