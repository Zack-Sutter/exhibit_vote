import type { StatEntry } from "../types";

interface StatsTableProps {
  stats: StatEntry[];
}

export function StatsTable({ stats }: StatsTableProps) {
  if (stats.length === 0) {
    return <p className="empty-state">No items yet. Seed the database to get started.</p>;
  }

  return (
    <table className="stats-table">
      <thead>
        <tr>
          <th scope="col">Rank</th>
          <th scope="col">Exhibit</th>
          <th scope="col">Wins</th>
          <th scope="col">Losses</th>
          <th scope="col">Win rate</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((entry, index) => (
          <tr key={entry.id}>
            <td>{index + 1}</td>
            <td>{entry.name}</td>
            <td>{entry.wins}</td>
            <td>{entry.losses}</td>
            <td>{(entry.win_rate * 100).toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
