import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { feedbackImages } from '../assets/data';
import { ImageGallery } from './ImageGallery';

export const FeedbackSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="feedback"
      className={`py-section-py-desktop max-w-max-width mx-auto px-4 md:px-gutter reveal ${isVisible ? 'visible' : ''}`}
      ref={ref as any}
    >
      <div className="bg-primary/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-gold-light/20">
        <div className="text-center mb-8">
          <h2 className="font-headline-lg font-bold text-4xl text-white mb-4">
            Feedback & Complaints Mechanism
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            We value your feedback. Browse through the step-by-step guide below.
          </p>
        </div>

        <button
          className="w-full flex items-center justify-between p-4 bg-gold-light/10 rounded-xl hover:bg-gold-light/20 transition-all"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span className="font-headline-md font-bold text-gold-light text-xl">
            View Feedback Guide
          </span>
          <span className={`material-symbols-outlined text-gold-light transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {expanded && (
          <div className="mt-6">
            <ImageGallery images={feedbackImages} folder="assets/Feedback and complains mechanism" />
          </div>
        )}
      </div>
    </section>
  );
};
