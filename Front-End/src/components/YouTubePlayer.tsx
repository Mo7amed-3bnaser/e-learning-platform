'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import VideoWatermark from './VideoWatermark';

interface WatermarkUser {
  name: string;
  email: string;
  id: string;
}

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  watermarkUser?: WatermarkUser;
}

export default function YouTubePlayer({
  videoId,
  title = 'Course Video',
  className = '',
  autoplay = false,
  watermarkUser,
}: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build YouTube embed URL with parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',           // Don't show related videos from other channels
    modestbranding: '1', // Minimal YouTube branding
    controls: '1',
    fs: '0',             // Disable YouTube's native fullscreen button
    enablejsapi: '1',   // Enable JS API for advanced control
  }).toString()}`;

  // Toggle fullscreen on the container (includes iframe + watermark)
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Track fullscreen state changes
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // Allow Escape to exit (browsers handle this natively, but just in case)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        // Only toggle when focus is on the container, not inside iframe
        if (
          containerRef.current &&
          (document.activeElement === containerRef.current ||
            containerRef.current.contains(document.activeElement))
        ) {
          // Don't toggle if user is typing inside an input
          const tag = (document.activeElement as HTMLElement)?.tagName;
          if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
            toggleFullscreen();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [toggleFullscreen]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* 16:9 Aspect Ratio Container — this is the element that goes fullscreen */}
      <div
        ref={containerRef}
        className={`
          relative overflow-hidden rounded-lg bg-gray-900
          ${isFullscreen ? 'w-screen h-screen' : 'pb-[56.25%] h-0'}
        `}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          // No allowFullScreen — we handle fullscreen ourselves
          onLoad={() => setIsLoading(false)}
          className="absolute top-0 left-0 w-full h-full"
        />

        {/* User watermark overlay — visible in both normal and fullscreen */}
        {watermarkUser && !isLoading && (
          <VideoWatermark user={watermarkUser} />
        )}

        {/* Custom fullscreen toggle button */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="
            absolute bottom-2 right-2 z-30
            bg-black/60 hover:bg-black/80
            text-white rounded-md p-1.5
            transition-colors duration-200
            cursor-pointer
          "
        >
          {isFullscreen ? (
            /* Exit-fullscreen icon (compress) */
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          ) : (
            /* Enter-fullscreen icon (expand) */
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
