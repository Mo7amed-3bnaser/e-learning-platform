"use client";

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'masar_video_bookmarks';

interface VideoBookmark {
  courseId: string;
  videoId: string;
  timestamp: number;
  lastUpdated: number;
}

export function useVideoBookmark(courseId: string, videoId: string) {
  const [bookmark, setBookmark] = useState<number>(0);

  useEffect(() => {
    // Load bookmark from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const bookmarks: VideoBookmark[] = JSON.parse(stored);
        const found = bookmarks.find(
          (b) => b.courseId === courseId && b.videoId === videoId
        );
        if (found) {
          setBookmark(found.timestamp);
        }
      } catch (error) {
        console.error('Error loading bookmark:', error);
      }
    }
  }, [courseId, videoId]);

  const saveBookmark = (timestamp: number) => {
    const newBookmark: VideoBookmark = {
      courseId,
      videoId,
      timestamp,
      lastUpdated: Date.now(),
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    let bookmarks: VideoBookmark[] = [];
    
    if (stored) {
      try {
        bookmarks = JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
      }
    }

    // Remove old bookmark for this video if exists
    bookmarks = bookmarks.filter(
      (b) => !(b.courseId === courseId && b.videoId === videoId)
    );

    // Add new bookmark
    bookmarks.push(newBookmark);

    // Keep only last 50 bookmarks
    if (bookmarks.length > 50) {
      bookmarks = bookmarks.slice(-50);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    setBookmark(timestamp);
  };

  const clearBookmark = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        let bookmarks: VideoBookmark[] = JSON.parse(stored);
        bookmarks = bookmarks.filter(
          (b) => !(b.courseId === courseId && b.videoId === videoId)
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        setBookmark(0);
      } catch (error) {
        console.error('Error clearing bookmark:', error);
      }
    }
  };

  return {
    bookmark,
    saveBookmark,
    clearBookmark,
  };
}
