import type { CSSProperties } from "react";

interface VsDividerProps {
  splitRatio: number;
  isDragging: boolean;
  loading: boolean;
}

const dividerLineStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 0,
};

const vsBadgeStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
};

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
      <div className="swipe-vote__divider-line" style={dividerLineStyle} />
      <div className="swipe-vote__vs-badge" style={vsBadgeStyle}>
        {loading ? <span className="swipe-vote__vs-loading" /> : "VS"}
      </div>
    </div>
  );
}
