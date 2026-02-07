"use client";

import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 p-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 group animate-fadeIn"
          aria-label="العودة للأعلى"
        >
          <FiArrowUp className="w-6 h-6 group-hover:animate-bounce-slow" />
        </button>
      )}
    </>
  );
}
