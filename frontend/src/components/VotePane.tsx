import { useEffect, useState, type SyntheticEvent } from "react";
import { assetUrl } from "../api/client";
import type { Item } from "../types";
import { extractEdgeColor } from "../utils/imageColor";

export type TitleAnchor = "bottom-left" | "top-right";

interface VotePaneProps {
  item: Item;
  position: "top" | "bottom";
  winProgress: number;
  loseProgress: number;
  animate: boolean;
}

const PLACEHOLDER_BG = "#eff6ff";
const IMAGE_BG_FALLBACK = "#1e293b";

export function VotePane({
  item,
  position,
  winProgress,
  loseProgress,
  animate,
}: VotePaneProps) {
  const imageSrc = assetUrl(item.image_url);
  const [bgColor, setBgColor] = useState(
    imageSrc ? IMAGE_BG_FALLBACK : PLACEHOLDER_BG,
  );

  useEffect(() => {
    setBgColor(imageSrc ? IMAGE_BG_FALLBACK : PLACEHOLDER_BG);
  }, [item.id, imageSrc]);

  const scale =
    winProgress > 0
      ? 1 + winProgress * 0.35
      : 1 - loseProgress * 0.15;
  const opacity = 1 - loseProgress * 0.4;
  const translateY =
    position === "top"
      ? winProgress * 12 - loseProgress * 4
      : -(winProgress * 12 - loseProgress * 4);

  const titleClass = [
    "swipe-vote__title",
    position === "top"
      ? "swipe-vote__title--bottom-left"
      : "swipe-vote__title--top-right",
    imageSrc ? "" : "swipe-vote__title--dark",
  ]
    .filter(Boolean)
    .join(" ");

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const color = extractEdgeColor(event.currentTarget);
    if (color) {
      setBgColor(color);
    }
  }

  return (
    <div
      className={`swipe-vote__pane swipe-vote__pane--${position}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`swipe-vote__pane-image-wrap${animate ? " swipe-vote__pane-image-wrap--animate" : ""}`}
        style={{
          transform: `translateY(${translateY}%) scale(${scale})`,
          opacity,
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="swipe-vote__pane-image"
            draggable={false}
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="swipe-vote__pane-placeholder" aria-hidden="true">
            {item.name.charAt(0)}
          </div>
        )}
      </div>
      <h2 className={titleClass}>{item.name}</h2>
    </div>
  );
}
