import { useCallback, useEffect, useState } from "react";
import { getPair, submitVote } from "../api/client";
import { PairComparison } from "../components/PairComparison";
import type { Item } from "../types";

export function VotePage() {
  const [itemA, setItemA] = useState<Item | null>(null);
  const [itemB, setItemB] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPair = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
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
      await loadPair();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vote.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page">
      <header className="page__header">
        <h1>Which exhibit do you prefer?</h1>
        <p>Tap your favorite to cast a vote.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      {loading ? (
        <p className="loading">Loading exhibits...</p>
      ) : itemA && itemB ? (
        <PairComparison
          itemA={itemA}
          itemB={itemB}
          onVote={handleVote}
          disabled={submitting}
        />
      ) : null}
    </section>
  );
}
