// [Layer: Hooks] — useDraggableBubble.ts
// Provides press-hold-drag + magnetic edge-snap behaviour for floating bubble UIs.
// Works with both mouse (desktop) and touch (mobile) events.
// On drag release: snaps to the nearest horizontal edge (left / right) with a
// spring-like CSS transition — the "magnetic" effect.
// Position is persisted to localStorage so it survives page refreshes.
// Dispatches a window CustomEvent `rizal-bubble-moved` whenever RIZAL's bubble snaps,
// so RizalPreviewBubble can reposition itself accordingly.
//
// KEY DESIGN:
//   - `left` and `bottom` are NOT in the React style prop — they are managed entirely
//     via direct DOM manipulation. This prevents React re-renders (e.g. from cursor
//     changes) from overwriting position mid-drag.
//   - React state (side, bottomPx) stores the "resting" position only.
//   - A useEffect([side, bottomPx]) applies that resting position to the DOM after mount
//     and after every snap.
//   - snapToEdge uses the `void el.offsetWidth` reflow trick so the browser registers
//     the "from" position before the CSS transition fires → guaranteed spring animation.
//
// Usage:
//   const { ref, style, isDragging, side } = useDraggableBubble({ storageKey: 'fb_bubble_pos' });
//   <div ref={ref} style={style}>...</div>

import { useRef, useState, useEffect, useLayoutEffect, useCallback, RefObject, CSSProperties } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
/** Distance from each screen edge when bubble is snapped (px) */
const EDGE_MARGIN_PX = 24;
/** Minimum distance from viewport top and bottom (px) */
const BOTTOM_MARGIN_PX = 24;
/** Minimum distance from viewport top to protect header (px) */
const TOP_MARGIN_PX = 96;
/** Minimum drag movement before mouseup is treated as drag vs. click (px) */
const DRAG_THRESHOLD_PX = 6;
/** Spring easing for magnetic snap animation */
const SNAP_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Duration for snap animation (ms) — useEffect delay must exceed this */
const SNAP_DURATION_MS = 380;

// ─── Types ────────────────────────────────────────────────────────────────────
type Side = 'left' | 'right';

interface DraggableBubbleOptions {
  /** Unique localStorage key for position persistence */
  storageKey: string;
  /** Default edge when no saved position exists */
  defaultSide?: Side;
  /** Default bottom offset in px when no saved position exists */
  defaultBottomPx?: number;
  /**
   * If true, dispatches `rizal-bubble-moved` CustomEvent on snap.
   * Only enable this for the RIZAL bubble.
   */
  emitMoveEvent?: boolean;
}

interface DraggableBubbleResult {
  /** Attach this ref to the bubble's outer div */
  ref: RefObject<HTMLDivElement | null>;
  /** Apply this style object to the bubble's outer div */
  style: CSSProperties;
  /** Whether the user is currently dragging */
  isDragging: boolean;
  /** Which edge the bubble is currently snapped to */
  side: Side;
  /** The resting bottom pixel position */
  bottomPx: number;
}

interface SavedPos {
  side: Side;
  bottomPx: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Viewport width (excludes scrollbars on Windows) */
function getVW(): number {
  return document.documentElement.clientWidth;
}

/** Viewport height (excludes scrollbars / OS taskbar) */
function getVH(): number {
  return document.documentElement.clientHeight;
}

function loadPos(key: string, defaultSide: Side, defaultBottomPx: number): SavedPos {
  return { side: defaultSide, bottomPx: defaultBottomPx };
}

function savePos(key: string, pos: SavedPos) {
  // Local storage disabled as per user request to always reset on refresh
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDraggableBubble({
  storageKey,
  defaultSide = 'right',
  defaultBottomPx = BOTTOM_MARGIN_PX,
  emitMoveEvent = false,
}: DraggableBubbleOptions): DraggableBubbleResult {
  const ref = useRef<HTMLDivElement | null>(null);

  // Resting position state — updated only after a snap animation completes
  const savedPos = loadPos(storageKey, defaultSide, defaultBottomPx);
  const [side, setSide] = useState<Side>(savedPos.side);
  const [bottomPx, setBottomPx] = useState<number>(savedPos.bottomPx);

  // Set initial resting position to DOM on mount so collision logic sees it
  useLayoutEffect(() => {
    if (ref.current) {
      if (!ref.current.hasAttribute('data-target-bottom')) {
        ref.current.setAttribute('data-target-side', side);
        ref.current.setAttribute('data-target-bottom', bottomPx.toString());
      }
    }
  }, [side, bottomPx]);

  // isDragging is only used for cursor styling in the React style prop
  const [isDragging, setIsDragging] = useState(false);

  // Ref that mirrors isDragging without causing re-renders in event callbacks
  const isDraggingRef = useRef(false);

  // Drag session data — refs so callbacks never need to be re-created
  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startBottom: 0,
    moved: false,
    pointerId: -1,
    canDrag: false,
  });

  // ── Snap helper ─────────────────────────────────────────────────────────────
  /** Compute the snapped left px for a given side */
  const getSnapLeft = useCallback((snapSide: Side, bubbleW: number): number => {
    const vw = getVW();
    return snapSide === 'left' ? EDGE_MARGIN_PX : vw - bubbleW - EDGE_MARGIN_PX;
  }, []); // stable — no deps

  /**
   * Animate the bubble to the nearest edge from (currentLeft, currentBottom).
   * Uses the `void el.offsetWidth` reflow trick so the browser commits the
   * "from" state before the transition fires → guaranteed spring animation.
   */
  const snapToEdge = useCallback(
    (currentLeft: number, currentBottom: number) => {
      const el = ref.current;
      if (!el) return;

      const vw = getVW();
      const vh = getVH();
      const bubbleW = el.offsetWidth || 64;
      const bubbleH = el.offsetHeight || 64;

      // Determine target side based on bubble's horizontal center
      const mid = vw / 2;
      const snappedSide: Side = currentLeft + bubbleW / 2 < mid ? 'left' : 'right';
      const snapLeft = snappedSide === 'left' ? EDGE_MARGIN_PX : vw - bubbleW - EDGE_MARGIN_PX;

      // Clamp bottom so the bubble always stays fully visible and below the header
      let clampedBottom = Math.max(
        BOTTOM_MARGIN_PX,
        Math.min(currentBottom, vh - bubbleH - TOP_MARGIN_PX)
      );

      // Collision avoidance (Smart Snapping)
      const bubbles = Array.from(document.querySelectorAll('.float-bubble'));
      const otherBubbles = bubbles.filter(b => b !== el && !el.contains(b));
      
      for (const bubble of otherBubbles) {
        const targetSide = bubble.getAttribute('data-target-side');
        const otherSide = targetSide || (bubble.getBoundingClientRect().left + bubble.getBoundingClientRect().width / 2 < vw / 2 ? 'left' : 'right');
        
        if (otherSide === snappedSide) {
          const bottomAttr = bubble.getAttribute('data-target-bottom');
          let otherBottom = bottomAttr ? parseFloat(bottomAttr) : NaN;
          if (isNaN(otherBottom)) {
            otherBottom = vh - bubble.getBoundingClientRect().bottom;
          }
          if (isNaN(otherBottom)) continue;

          const otherHeight = (bubble as HTMLElement).offsetHeight || 64;
          const otherTop = otherBottom + otherHeight;
          const thisTop = clampedBottom + bubbleH;
          const gap = 16; // Enforce a 16px gap minimum
          
          // Check for overlap
          if (clampedBottom < otherTop + gap && thisTop > otherBottom - gap) {
            // Overlap detected! Determine whether it's easier to push up or down
            const pushUpDistance = (otherTop + gap) - clampedBottom;
            const pushDownDistance = thisTop - (otherBottom - gap);

            if (pushDownDistance < pushUpDistance && otherBottom - bubbleH - gap >= BOTTOM_MARGIN_PX) {
               clampedBottom = otherBottom - bubbleH - gap; // Push down
            } else if (otherTop + gap + bubbleH <= vh - TOP_MARGIN_PX) {
               clampedBottom = otherTop + gap; // Push up
            } else {
               // If both are blocked (unlikely), default to just above bottom margin
               clampedBottom = Math.max(BOTTOM_MARGIN_PX, otherBottom - bubbleH - gap);
            }
          }
        }
      }

      // ── Step 1: Lock element at drag-end position with NO transition ─────────
      el.setAttribute('data-target-side', snappedSide);
      el.setAttribute('data-target-bottom', clampedBottom.toString());
      el.style.transition = 'none';
      el.style.left = `${currentLeft}px`;
      el.style.bottom = `${currentBottom}px`;
      el.style.right = 'auto';

      // ── Step 2: Force reflow — browser commits the "from" position ───────────
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void el.offsetWidth;

      // ── Step 3: Set transition then new position — browser will animate ──────
      el.style.transition = `left ${SNAP_DURATION_MS}ms ${SNAP_EASING}, bottom ${Math.round(SNAP_DURATION_MS * 0.66)}ms ease`;
      el.style.left = `${snapLeft}px`;
      el.style.bottom = `${clampedBottom}px`;

      // ── Step 4: Sync React state after animation — resting position persisted ─
      const timer = setTimeout(() => {
        setSide(snappedSide);
        setBottomPx(clampedBottom);
        // Explicitly set the DOM styles here instead of clearing them.
        // This guarantees the bubble locks into position even if React bails out
        // of rendering (e.g., if the user drops the bubble in its exact original spot).
        const elRef = ref.current;
        if (elRef) {
          elRef.style.transition = '';
          elRef.style.bottom = `${clampedBottom}px`;
          if (snappedSide === 'left') {
            elRef.style.left = `${EDGE_MARGIN_PX}px`;
            elRef.style.right = 'auto';
          } else {
            elRef.style.left = 'auto';
            elRef.style.right = `${EDGE_MARGIN_PX}px`;
          }
        }
      }, SNAP_DURATION_MS + 20);

      savePos(storageKey, { side: snappedSide, bottomPx: clampedBottom });

      if (emitMoveEvent) {
        window.dispatchEvent(
          new CustomEvent('rizal-bubble-moved', { detail: { side: snappedSide, bottomPx: clampedBottom } })
        );
      }

      return () => clearTimeout(timer);
    },
    [storageKey, emitMoveEvent] // stable — setSide/setBottomPx are stable setters
  );

  // ── Apply resting position from React state ──────────────────────────────────
  // Runs on mount (initial position) and after every snap (resting position sync).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || isDraggingRef.current) return;
    
    // Apply responsive edge positioning
    el.style.bottom = `${bottomPx}px`;
    if (side === 'left') {
      el.style.left = `${EDGE_MARGIN_PX}px`;
      el.style.right = 'auto';
    } else {
      el.style.left = 'auto';
      el.style.right = `${EDGE_MARGIN_PX}px`;
    }
  }, [side, bottomPx]);

  // ── Pointer events ─────────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: PointerEvent) => {
    // Only primary button (left click) or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = ref.current;
    if (!el) return;
    
    const target = e.target as Element;
    // Do not initiate drag if clicking on an interactive modal inside the container
    if (target.closest('.no-drag')) return;
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId);
    }
    
    const rect = el.getBoundingClientRect();
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startBottom: getVH() - rect.bottom,
      moved: false,
      pointerId: e.pointerId,
      canDrag: false,
    };
    
    // For mouse, prevent default so it doesn't do normal text selection
    // But for touch, preventDefault here breaks scrolling and clicks, so avoid it.
    if (e.pointerType === 'mouse') {
       e.preventDefault();
    }
  }, []); // stable

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragState.current.active || e.pointerId !== dragState.current.pointerId) return;
    
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    
    // Check if we passed the drag threshold
    if (!dragState.current.canDrag) {
       if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
          dragState.current.canDrag = true;
          setIsDragging(true);
          isDraggingRef.current = true;
          if (ref.current) {
             ref.current.style.transition = 'none';
          }
       } else {
         return;
       }
    }
    
    // Once canDrag is true, any movement counts as a drag
    if (!dragState.current.moved) {
      dragState.current.moved = true;
    }

    const el = ref.current;
    if (!el) return;
    
    const vw = getVW();
    const vh = getVH();
    const bubbleW = el.offsetWidth || 64;
    const bubbleH = el.offsetHeight || 64;

    let newLeft = dragState.current.startLeft + dx;
    let newBottom = dragState.current.startBottom - dy;

    // Clamp coordinates during drag so it never goes off screen or over header
    newLeft = Math.max(EDGE_MARGIN_PX, Math.min(newLeft, vw - bubbleW - EDGE_MARGIN_PX));
    newBottom = Math.max(BOTTOM_MARGIN_PX, Math.min(newBottom, vh - bubbleH - TOP_MARGIN_PX));

    el.style.transition = 'none';
    el.style.left = `${newLeft}px`;
    el.style.right = 'auto';
    el.style.bottom = `${newBottom}px`;
    
    if (e.pointerType !== 'mouse') {
      e.preventDefault(); // prevent scroll on touch
    }
  }, []); // stable

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!dragState.current.active || e.pointerId !== dragState.current.pointerId) return;
    
    dragState.current.active = false;
    isDraggingRef.current = false;
    setIsDragging(false);

    const el = ref.current;
    
    const target = e.target as Element;
    if (target.releasePointerCapture) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore if pointer capture was already released
      }
    }

    if (!dragState.current.moved) return;

    if (!el) return;
    const rect = el.getBoundingClientRect();
    snapToEdge(rect.left, getVH() - rect.bottom);
  }, [snapToEdge]); // stable

  const onPointerCancel = useCallback((e: PointerEvent) => {
    onPointerUp(e);
  }, [onPointerUp]);

  // ── Attach event listeners once on mount ─────────────────────────────────────
  // Because all callbacks are stable ([] or [snapToEdge] deps), this effect
  // fires exactly once — no listener churn on every render.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [onPointerDown, onPointerMove, onPointerUp, onPointerCancel]);

  // ── Style object (NO left/bottom — those are managed via direct DOM) ─────────
  // Only cursor and explicit z-index changes are expressed via React style to avoid overwriting
  // DOM transitions and causing stuttering.
  const style: CSSProperties = {
    position: 'fixed',
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
    zIndex: 2147483647,
  };

  return { ref, style, isDragging, side, bottomPx };
}
