import { useEffect, useState } from "react";
import { getStats } from "../api/client";
import { StatsTable } from "../components/StatsTable";
import type { StatEntry } from "../types";

export function StatsPage() {
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats.");
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  return (
    <section className="page">
      <header className="page__header">
        <h1>Exhibit rankings</h1>
        <p>Based on head-to-head votes.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {loading ? (
        <p className="loading">Loading statistics...</p>
      ) : (
        <StatsTable stats={stats} />
      )}
    </section>
  );
}
