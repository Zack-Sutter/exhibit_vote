import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

interface VsDividerProps {
  splitRatio: number;
  isDragging: boolean;
  disabled: boolean;
  loading: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export function VsDivider({
  splitRatio,
  isDragging,
  disabled,
  loading,
  onPointerDown,
  onKeyDown,
}: VsDividerProps) {
  const style: CSSProperties = {
    top: `${splitRatio * 100}%`,
  };

  const ariaValue = Math.round((1 - splitRatio) * 100);

  return (
    <div
      className={`swipe-vote__divider${isDragging ? " swipe-vote__divider--dragging" : ""}${disabled ? " swipe-vote__divider--disabled" : ""}`}
      style={style}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drag up or down to vote"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      aria-disabled={disabled}
      onPointerDown={disabled ? undefined : onPointerDown}
      onKeyDown={disabled ? undefined : onKeyDown}
    >
      <div className="swipe-vote__divider-line" aria-hidden="true" />
      <div className="swipe-vote__vs-badge">
        {loading ? <span className="swipe-vote__vs-loading" aria-hidden="true" /> : "VS"}
      </div>
      <div className="swipe-vote__divider-line" aria-hidden="true" />
    </div>
  );
}
