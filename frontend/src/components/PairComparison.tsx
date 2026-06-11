import type { Item } from "../types";
import { ItemCard } from "./ItemCard";

interface PairComparisonProps {
  itemA: Item;
  itemB: Item;
  onVote: (winnerId: number, loserId: number) => void;
  disabled?: boolean;
}

export function PairComparison({
  itemA,
  itemB,
  onVote,
  disabled = false,
}: PairComparisonProps) {
  return (
    <div className="pair-comparison">
      <ItemCard
        item={itemA}
        disabled={disabled}
        onSelect={() => onVote(itemA.id, itemB.id)}
      />
      <div className="pair-comparison__divider" aria-hidden="true">
        or
      </div>
      <ItemCard
        item={itemB}
        disabled={disabled}
        onSelect={() => onVote(itemB.id, itemA.id)}
      />
    </div>
  );
}
