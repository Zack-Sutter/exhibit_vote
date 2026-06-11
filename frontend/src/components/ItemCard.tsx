import { assetUrl } from "../api/client";
import type { Item } from "../types";

interface ItemCardProps {
  item: Item;
  onSelect: () => void;
  disabled?: boolean;
}

export function ItemCard({ item, onSelect, disabled = false }: ItemCardProps) {
  const imageSrc = assetUrl(item.image_url);

  return (
    <button
      type="button"
      className="item-card"
      onClick={onSelect}
      disabled={disabled}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={item.name} className="item-card__image" />
      ) : (
        <div className="item-card__placeholder" aria-hidden="true">
          {item.name.charAt(0)}
        </div>
      )}
      <h2 className="item-card__title">{item.name}</h2>
      {item.description ? (
        <p className="item-card__description">{item.description}</p>
      ) : null}
    </button>
  );
}
