import React, { useState } from 'react';
import { RESEARCH_SURVEY_CONFIG, isResearchSurveyActive } from '@/src/Config/researchSurveyConfig';

interface ResearchSurveyStickyCardProps {
  isHidden?: boolean;
}

export const ResearchSurveyStickyCard: React.FC<ResearchSurveyStickyCardProps> = ({ isHidden = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isResearchSurveyActive() || isHidden) {
    return null;
  }

  const handleOpenSurvey = () => {
    window.open(RESEARCH_SURVEY_CONFIG.formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] group flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sticky Tab Button */}
      <button
        type="button"
        onClick={handleOpenSurvey}
        className={`relative flex items-center gap-2 py-2.5 sm:py-3.5 px-2 sm:px-3
          bg-gradient-to-b from-[#D4AF37] via-[#C9A84C] to-[#A3822E]
          text-[#001851] font-extrabold uppercase tracking-widest text-xs sm:text-sm
          rounded-r-xl shadow-2xl shadow-black/40
          border-y border-r border-[#FFF0A6]/50
          cursor-pointer transition-all duration-300
          hover:shadow-[0_0_25px_rgba(201,168,76,0.65)]
          hover:brightness-110 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-[#F0D97A] focus:ring-offset-2
          ${isHovered ? 'translate-x-2' : 'animate-pull-bounce-left'}`}
        aria-label={`${RESEARCH_SURVEY_CONFIG.badgeLabel} - ${RESEARCH_SURVEY_CONFIG.tooltipTitle}`}
        title={RESEARCH_SURVEY_CONFIG.tooltipTitle}
      >
        {/* Pulsing Attention Status Ping */}
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 pointer-events-none" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white" />
        </span>

        {/* Vertical Typography & Icon (Rotated 180deg for inward, natural top-down reading) */}
        <div
          className="flex items-center gap-2"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          <span className="material-symbols-outlined text-sm sm:text-base rotate-90">
            {RESEARCH_SURVEY_CONFIG.iconName}
          </span>
          <span>{RESEARCH_SURVEY_CONFIG.badgeLabel}</span>
        </div>
      </button>

      {/* Interactive Hover Callout Card */}
      <div
        className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 sm:w-72 p-3.5
          bg-[#001851]/95 backdrop-blur-md text-white rounded-xl shadow-2xl
          border border-[#C9A84C]/40 pointer-events-none transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-3 invisible'}`}
        role="tooltip"
      >
        {/* Directional arrow pointing left toward the tab */}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#001851] border-l border-b border-[#C9A84C]/40 rotate-45" />

        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#C9A84C] text-[#001851]">
            LIVE STUDY
          </span>
          <span className="text-[11px] text-gray-300">~2 min response</span>
        </div>

        <h4 className="text-sm font-bold text-[#F0D97A] leading-snug">
          {RESEARCH_SURVEY_CONFIG.tooltipTitle}
        </h4>

        <p className="text-xs text-gray-200 mt-1 leading-relaxed">
          {RESEARCH_SURVEY_CONFIG.tooltipSubtitle}
        </p>

        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#F0D97A]">
          <span className="font-semibold flex items-center gap-1">
            Click tab to begin
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </span>
          <span className="text-gray-400 text-[10px]">Opens in new tab</span>
        </div>
      </div>
    </div>
  );
};
