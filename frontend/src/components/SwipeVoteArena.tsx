import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { Item } from "../types";
import { VotePane } from "./VotePane";
import { VsDivider } from "./VsDivider";

const REST_RATIO = 0.5;
const COMMIT_THRESHOLD = 0.12;
const VELOCITY_THRESHOLD = 0.35;
const FLICK_RATIO_A_MIN = 0.45;
const FLICK_RATIO_B_MAX = 0.55;
const MIN_RATIO = 0.05;
const MAX_RATIO = 0.95;
const SNAP_MS = 250;

type Phase = "idle" | "dragging" | "committing" | "snapping";

interface SwipeVoteArenaProps {
  itemA: Item;
  itemB: Item;
  onVote: (winnerId: number, loserId: number) => Promise<void>;
  disabled?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rubberBand(ratio: number) {
  if (ratio < MIN_RATIO) {
    return MIN_RATIO - (MIN_RATIO - ratio) * 0.3;
  }
  if (ratio > MAX_RATIO) {
    return MAX_RATIO + (ratio - MAX_RATIO) * 0.3;
  }
  return ratio;
}

function focusProgress(splitRatio: number, direction: "a" | "b") {
  if (direction === "b") {
    return clamp((REST_RATIO - splitRatio) / REST_RATIO, 0, 1);
  }
  return clamp((splitRatio - REST_RATIO) / REST_RATIO, 0, 1);
}

export function SwipeVoteArena({
  itemA,
  itemB,
  onVote,
  disabled = false,
}: SwipeVoteArenaProps) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState(REST_RATIO);
  const [phase, setPhase] = useState<Phase>("idle");
  const [announcement, setAnnouncement] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);

  const splitRatioRef = useRef(splitRatio);
  const phaseRef = useRef(phase);
  const lastPointerRef = useRef<{ y: number; t: number } | null>(null);
  const dragStartRef = useRef<{ y: number; ratio: number } | null>(null);
  const velocityRef = useRef(0);

  splitRatioRef.current = splitRatio;
  phaseRef.current = phase;

  useEffect(() => {
    setSplitRatio(REST_RATIO);
    setPhase("idle");
    setAnnouncement("");
  }, [itemA.id, itemB.id]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const animateRatio = useCallback(
    (target: number, nextPhase: Phase) => {
      setPhase(nextPhase);
      if (reducedMotion) {
        setSplitRatio(target);
        return Promise.resolve();
      }
      setSplitRatio(target);
      return new Promise<void>((resolve) => {
        window.setTimeout(resolve, SNAP_MS);
      });
    },
    [reducedMotion],
  );

  const commitVote = useCallback(
    async (winner: Item, loser: Item, targetRatio: number) => {
      setPhase("committing");
      setAnnouncement(`Vote recorded for ${winner.name}`);
      await animateRatio(targetRatio, "committing");
      try {
        await onVote(winner.id, loser.id);
        setPhase("idle");
      } catch {
        setAnnouncement("");
        await animateRatio(REST_RATIO, "snapping");
        setPhase("idle");
      }
    },
    [animateRatio, onVote],
  );

  const resolveRelease = useCallback(
    async (ratio: number, velocity: number) => {
      const swipeUp = velocity < -VELOCITY_THRESHOLD;
      const swipeDown = velocity > VELOCITY_THRESHOLD;

      if (swipeUp && ratio < FLICK_RATIO_B_MAX) {
        await commitVote(itemB, itemA, 0);
        return;
      }
      if (swipeDown && ratio > FLICK_RATIO_A_MIN) {
        await commitVote(itemA, itemB, 1);
        return;
      }
      if (ratio <= COMMIT_THRESHOLD) {
        await commitVote(itemB, itemA, 0);
        return;
      }
      if (ratio >= 1 - COMMIT_THRESHOLD) {
        await commitVote(itemA, itemB, 1);
        return;
      }

      setPhase("snapping");
      await animateRatio(REST_RATIO, "snapping");
      setPhase("idle");
    },
    [commitVote, itemA, itemB, animateRatio],
  );

  const updateRatioFromDrag = useCallback((clientY: number) => {
    const start = dragStartRef.current;
    const arena = arenaRef.current;
    if (!start || !arena) return;
    const rect = arena.getBoundingClientRect();
    const deltaRatio = (clientY - start.y) / rect.height;
    setSplitRatio(rubberBand(clamp(start.ratio + deltaRatio, 0, 1)));
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || phaseRef.current !== "idle") return;
      arenaRef.current?.setPointerCapture(event.pointerId);
      setPhase("dragging");
      dragStartRef.current = { y: event.clientY, ratio: splitRatioRef.current };
      lastPointerRef.current = { y: event.clientY, t: event.timeStamp };
      velocityRef.current = 0;
    },
    [disabled],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (phaseRef.current !== "dragging") return;
      const last = lastPointerRef.current;
      if (last) {
        const dt = event.timeStamp - last.t;
        if (dt > 0) {
          velocityRef.current = (event.clientY - last.y) / dt;
        }
        lastPointerRef.current = { y: event.clientY, t: event.timeStamp };
      }
      updateRatioFromDrag(event.clientY);
    },
    [updateRatioFromDrag],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (phaseRef.current !== "dragging") return;
      if (arenaRef.current?.hasPointerCapture(event.pointerId)) {
        arenaRef.current.releasePointerCapture(event.pointerId);
      }
      lastPointerRef.current = null;
      dragStartRef.current = null;
      void resolveRelease(splitRatioRef.current, velocityRef.current);
    },
    [resolveRelease],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled || phaseRef.current !== "idle") return;

      const step = 0.04;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSplitRatio((r) => rubberBand(clamp(r - step, 0, 1)));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSplitRatio((r) => rubberBand(clamp(r + step, 0, 1)));
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void resolveRelease(splitRatioRef.current, 0);
      }
    },
    [disabled, resolveRelease],
  );

  const isDragging = phase === "dragging";
  const animate = phase !== "dragging";
  const topHeight = splitRatio * 100;
  const bottomHeight = (1 - splitRatio) * 100;
  const pA = focusProgress(splitRatio, "a");
  const pB = focusProgress(splitRatio, "b");
  const inputLocked = disabled || phase === "committing" || phase === "snapping";
  const ariaValue = Math.round((1 - splitRatio) * 100);

  return (
    <div
      ref={arenaRef}
      className={`swipe-vote${isDragging ? " swipe-vote--dragging" : ""}`}
      role="slider"
      tabIndex={inputLocked ? -1 : 0}
      aria-label="Swipe up or down to vote"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      aria-disabled={inputLocked}
      onPointerDown={inputLocked ? undefined : onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={inputLocked ? undefined : onKeyDown}
    >
      <div
        className={`swipe-vote__pane-slot swipe-vote__pane-slot--top${animate ? " swipe-vote__pane-slot--animate" : ""}`}
        style={{ height: `${topHeight}%` }}
      >
        <VotePane
          item={itemA}
          position="top"
          winProgress={pA}
          loseProgress={pB}
          animate={animate}
        />
      </div>

      <div
        className={`swipe-vote__pane-slot swipe-vote__pane-slot--bottom${animate ? " swipe-vote__pane-slot--animate" : ""}`}
        style={{ height: `${bottomHeight}%` }}
      >
        <VotePane
          item={itemB}
          position="bottom"
          winProgress={pB}
          loseProgress={pA}
          animate={animate}
        />
      </div>

      <VsDivider
        splitRatio={splitRatio}
        isDragging={isDragging}
        loading={disabled || phase === "committing"}
      />

      <div className="swipe-vote__sr-only" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
