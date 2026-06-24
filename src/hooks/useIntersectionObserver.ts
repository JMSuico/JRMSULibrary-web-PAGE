import React, { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(options = { threshold: 0.1 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<Element | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Only trigger once
        if (ref.current) observer.unobserve(ref.current);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible] as const;
}
