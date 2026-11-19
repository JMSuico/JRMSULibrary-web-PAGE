import React from 'react';

export const FeedbackStickyCard: React.FC = () => {
  return (
    <button
      onClick={() => window.open('https://jrmsu.online/feedback/', '_blank')}
      className="fixed right-0 top-[42%] sm:top-1/2 -translate-y-1/2 z-[60] bg-primary text-white uppercase font-bold tracking-widest text-[11px] sm:text-xs py-2 sm:py-2.5 px-1.5 sm:px-2.5 rounded-l-lg shadow-xl cursor-pointer hover:bg-navy-mid transition-all duration-300 flex items-center gap-1.5 sm:gap-2 writing-vertical"
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      aria-label="Feedback"
    >
      <span className="material-symbols-outlined text-sm sm:text-base rotate-90">rate_review</span>
      FEEDBACK
    </button>
  );
};
