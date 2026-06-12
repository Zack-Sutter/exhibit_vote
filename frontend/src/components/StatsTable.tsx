import type { StatEntry } from "../types";

interface StatsTableProps {
  stats: StatEntry[];
}

const MEDAL_CLASSES = [
  "stats-table__row--gold",
  "stats-table__row--silver",
  "stats-table__row--bronze",
] as const;

export function StatsTable({ stats }: StatsTableProps) {
  if (stats.length === 0) {
    return <p className="empty-state">No items yet. Seed the database to get started.</p>;
  }

  return (
    <div className="stats-table-wrap">
      <table className="stats-table">
        <thead>
          <tr>
            <th scope="col" className="stats-table__col-rank">
              <span className="stats-table__label-full">Rank</span>
              <span className="stats-table__label-short" aria-hidden="true">
                #
              </span>
            </th>
            <th scope="col" className="stats-table__col-exhibit">
              Exhibit
            </th>
            <th scope="col" className="stats-table__col-num">
              <span className="stats-table__label-full">Wins</span>
              <span className="stats-table__label-short" aria-hidden="true">
                W
              </span>
            </th>
            <th scope="col" className="stats-table__col-num">
              <span className="stats-table__label-full">Losses</span>
              <span className="stats-table__label-short" aria-hidden="true">
                L
              </span>
            </th>
            <th scope="col" className="stats-table__col-rate">
              <span className="stats-table__label-full">Win rate</span>
              <span className="stats-table__label-short" aria-hidden="true">
                %
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map((entry, index) => {
            const rowClasses = [
              index < 3 ? MEDAL_CLASSES[index] : "",
              index === 2 && stats.length > 3 ? "stats-table__row--podium-end" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <tr key={entry.id} className={rowClasses}>
                <td className="stats-table__rank">{index + 1}</td>
                <td className="stats-table__exhibit" title={entry.name}>
                  {entry.name}
                </td>
                <td>{entry.wins}</td>
                <td>{entry.losses}</td>
                <td>{(entry.win_rate * 100).toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
