"use client";

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'masar_recently_viewed';
const MAX_ITEMS = 10;

interface RecentCourse {
  _id: string;
  title: string;
  thumbnail?: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentCourses(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      }
    }
  }, []);

  const addRecentCourse = (course: Omit<RecentCourse, 'viewedAt'>) => {
    const newCourse: RecentCourse = {
      ...course,
      viewedAt: Date.now(),
    };

    setRecentCourses((prev) => {
      // Remove if already exists
      const filtered = prev.filter((c) => c._id !== course._id);
      
      // Add to beginning and limit to MAX_ITEMS
      const updated = [newCourse, ...filtered].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
  };

  const clearRecentCourses = () => {
    setRecentCourses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recentCourses,
    addRecentCourse,
    clearRecentCourses,
  };
}
