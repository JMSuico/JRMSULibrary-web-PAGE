// [Layer: Features/AIAssistant] — RizalPreviewBubble.tsx
// Messenger-style floating text preview to the left/right of the RIZAL AI chat bubble.
// Fully self-contained — zero props, zero dependency on RizalAssistant.tsx.
// Opens the chat via the existing `open-rizal-chat` window custom event.
// Shows after 5s of standby on every visit. No consent gate — it's non-intrusive.
// Listens to `rizal-bubble-moved` event to reposition itself relative to RIZAL's edge.
// Do NOT put API calls, business logic, or global state here.

import React, { useState, useEffect, useRef, useCallback } from 'react';

// === Config ===
const STANDBY_DELAY_MS = 5000;

const PHRASES: string[] = [
  'Hi! I am RIZAL. How can I help you today?',
  'Hello! Student.',
  'Ask anything in here?',
  'Hey, JRMSUians!',
  "What's on your mind right now?",
];

export const RizalPreviewBubble: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  // 'right' = RIZAL is on the right → preview on its left
  // 'left'  = RIZAL is on the left  → preview on its right
  const [rizalSide, setRizalSide] = useState<'left' | 'right'>('right');
  const [bottomPx, setBottomPx] = useState(24); // Default to match RIZAL's defaultBottomPx

  // --- Dismiss for this session (X button) ---
  const dismiss = useCallback(() => {
    setIsDismissed(true);
    setIsVisible(false);
  }, []);

  // --- User clicked the preview → open chat ---
  const handleClickOpen = useCallback(() => {
    setIsVisible(false);
    window.dispatchEvent(new CustomEvent('open-rizal-chat'));
  }, []);

  // --- X button ---
  const handleClickClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dismiss();
  }, [dismiss]);

  // --- Detect chat open/close via DOM poll + event ---
  useEffect(() => {
    const checkChatOpen = () => {
      const chatPanel = document.querySelector('input[placeholder="Ask me anything..."]');
      setIsChatOpen(!!chatPanel);
    };
    const onChatOpen = () => setIsChatOpen(true);
    window.addEventListener('open-rizal-chat', onChatOpen);
    const interval = setInterval(checkChatOpen, 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('open-rizal-chat', onChatOpen);
    };
  }, []);

  // --- Listen for RIZAL bubble edge-snap events ---
  useEffect(() => {
    const onRizalMoved = (e: Event) => {
      const detail = (e as CustomEvent<{ side: 'left' | 'right', bottomPx: number }>).detail;
      if (detail?.side) setRizalSide(detail.side);
      if (typeof detail?.bottomPx === 'number') setBottomPx(detail.bottomPx);
    };
    window.addEventListener('rizal-bubble-moved', onRizalMoved);
    return () => window.removeEventListener('rizal-bubble-moved', onRizalMoved);
  }, []);

  // --- Video Sync Logic ---
  useEffect(() => {
    if (isChatOpen || isDismissed) {
      setIsVisible(false);
      return;
    }

    let animationFrameId: number;
    let wasVisible = false;

    const syncWithVideo = () => {
      const video = document.getElementById('rizal-video') as HTMLVideoElement;
      if (video) {
        const time = video.currentTime;
        // The video is 12 seconds long. Show from 3s to 7s.
        const shouldBeVisible = time >= 3 && time <= 7;
        
        if (shouldBeVisible !== wasVisible) {
          wasVisible = shouldBeVisible;
          
          if (shouldBeVisible) {
            // Pick a new random phrase when it appears
            setIsAnimating(false);
            setPhraseIndex(Math.floor(Math.random() * PHRASES.length));
            setTimeout(() => {
              setIsVisible(true);
              setIsAnimating(true);
            }, 50); // slight delay for React to flush the phrase index
          } else {
            setIsVisible(false);
          }
        }
      }
      animationFrameId = requestAnimationFrame(syncWithVideo);
    };

    animationFrameId = requestAnimationFrame(syncWithVideo);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isChatOpen, isDismissed]);

  if (!isVisible || isChatOpen) return null;

  // Positioning: preview sits to the left of RIZAL (when right) or right of RIZAL (when left)
  // We remove fixed bottom classes since we now bind dynamically to bottomPx.
  // right-24/right-32 = clear the 64-80px bubble + gap (when RIZAL is on right)
  // left-24/left-32   = clear the 64-80px bubble + gap (when RIZAL is on left)
  const containerClass =
    rizalSide === 'right'
      ? 'fixed right-24 sm:right-32 transition-all duration-300'
      : 'fixed left-24 sm:left-32 transition-all duration-300';

  // Tail: points right toward RIZAL (when RIZAL is on right)
  //       points left toward RIZAL  (when RIZAL is on left)
  // Note: RIZAL is 64-80px tall. The preview box is about 60px tall. We anchor 
  // the tail near the bottom of the preview box.
  const tailClass =
    rizalSide === 'right'
      ? 'absolute bottom-4 -right-2 w-0 h-0'
      : 'absolute bottom-4 -left-2 w-0 h-0';

  const tailStyle: React.CSSProperties =
    rizalSide === 'right'
      ? {
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: '10px solid white',
          filter: 'drop-shadow(2px 0 1px rgba(0,0,0,0.07))',
        }
      : {
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: '10px solid white',
          filter: 'drop-shadow(-2px 0 1px rgba(0,0,0,0.07))',
        };

  return (
    <div
      className={containerClass}
      style={{ 
        minWidth: '240px', 
        maxWidth: '300px',
        bottom: `${bottomPx}px`,
        zIndex: 2147483646 // Just underneath the main RIZAL bubble (2147483647)
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Open RIZAL AI chat assistant"
        onClick={handleClickOpen}
        onKeyDown={e => e.key === 'Enter' && handleClickOpen()}
        className="cursor-pointer"
      >
        {/* Speech bubble card */}
        <div
          className={`relative bg-white rounded-2xl shadow-xl border border-gray-200 px-5 py-4 pr-10 ${
            isAnimating
              ? 'animate-rizal-preview'
              : 'opacity-0 transition-opacity duration-200'
          }`}
        >
          {/* Rotating phrase */}
          <p className="text-base font-semibold text-navy-dark leading-snug select-none">
            {PHRASES[phraseIndex]}
          </p>

          {/* Phrase indicator dots */}
          <div className="flex gap-1 mt-2" aria-hidden="true">
            {PHRASES.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === phraseIndex ? 'bg-blue-600 w-4' : 'bg-gray-300 w-1.5'
                }`}
              />
            ))}
          </div>

          {/* X dismiss button */}
          <button
            onClick={handleClickClose}
            aria-label="Dismiss RIZAL preview message"
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              close
            </span>
          </button>

          {/* Bubble tail — points toward RIZAL avatar */}
          <span aria-hidden="true" className={tailClass} style={tailStyle} />
        </div>
      </div>
    </div>
  );
};
