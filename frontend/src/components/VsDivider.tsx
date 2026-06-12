import type { CSSProperties } from "react";

interface VsDividerProps {
  splitRatio: number;
  isDragging: boolean;
  loading: boolean;
}

export function VsDivider({ splitRatio, isDragging, loading }: VsDividerProps) {
  const style: CSSProperties = {
    top: `${splitRatio * 100}%`,
  };

  return (
    <div
      className={`swipe-vote__divider${isDragging ? " swipe-vote__divider--dragging" : ""}`}
      style={style}
      aria-hidden="true"
    >
      <div className="swipe-vote__divider-line" />
      <div className="swipe-vote__vs-badge">
        {loading ? <span className="swipe-vote__vs-loading" /> : "VS"}
      </div>
      <div className="swipe-vote__divider-line" />
    </div>
  );
}
