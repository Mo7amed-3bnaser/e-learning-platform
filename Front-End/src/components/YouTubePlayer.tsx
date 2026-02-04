'use client';

import React, { useState } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

export default function YouTubePlayer({
  videoId,
  title = 'Course Video',
  className = '',
  autoplay = false
}: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Build YouTube embed URL with parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0', // Don't show related videos from other channels
    modestbranding: '1', // Minimal YouTube branding
    controls: '1',
    fs: '1', // Allow fullscreen
    enablejsapi: '1' // Enable JS API for advanced control
  }).toString()}`;

  return (
    <div className={`relative w-full ${className}`}>
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
}
