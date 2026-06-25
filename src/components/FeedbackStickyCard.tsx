import React from 'react';

export const FeedbackStickyCard: React.FC = () => {
  return (
    <button
      onClick={() => window.open('https://jrmsu.online/feedback/', '_blank')}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-primary text-white uppercase font-bold tracking-widest text-sm py-3 px-3 rounded-l-lg shadow-xl cursor-pointer hover:bg-navy-mid transition-all duration-300 flex items-center gap-2 writing-vertical"
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      aria-label="Feedback"
    >
      <span className="material-symbols-outlined text-base rotate-90">rate_review</span>
      FEEDBACK
    </button>
  );
};
