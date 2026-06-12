import { useCallback, useEffect, useState } from "react";
import { getPair, submitVote } from "../api/client";
import { PairComparison } from "../components/PairComparison";
import { SwipeVoteArena } from "../components/SwipeVoteArena";
import { useMediaQuery } from "../hooks/useMediaQuery";
import type { Item } from "../types";

export function VotePage() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [itemA, setItemA] = useState<Item | null>(null);
  const [itemB, setItemB] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPair = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const pair = await getPair();
      setItemA(pair.item_a);
      setItemB(pair.item_b);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pair.");
      setItemA(null);
      setItemB(null);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadPair();
  }, [loadPair]);

  async function handleVote(winnerId: number, loserId: number) {
    setSubmitting(true);
    setError(null);
    try {
      await submitVote({ winner_id: winnerId, loser_id: loserId });
      await loadPair(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vote.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`page${isMobile ? " page--vote" : ""}`}>
      {!isMobile ? (
        <header className="page__header">
          <h1>Which exhibit do you prefer?</h1>
          <p>Tap your favorite to cast a vote.</p>
        </header>
      ) : null}

      {error ? <p className="error page--vote__error">{error}</p> : null}

      {loading ? (
        <p className={`loading${isMobile ? " page--vote__loading" : ""}`}>
          Loading exhibits...
        </p>
      ) : itemA && itemB ? (
        isMobile ? (
          <SwipeVoteArena
            itemA={itemA}
            itemB={itemB}
            onVote={handleVote}
            disabled={submitting}
          />
        ) : (
          <PairComparison
            itemA={itemA}
            itemB={itemB}
            onVote={handleVote}
            disabled={submitting}
          />
        )
      ) : null}

      {isMobile && !loading && itemA && itemB ? (
        <p className="page--vote__hint">Swipe the bar to choose.</p>
      ) : null}
    </section>
  );
}
