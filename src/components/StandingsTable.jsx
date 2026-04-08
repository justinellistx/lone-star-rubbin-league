import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import '../styles/standings-table.css';

export default function StandingsTable({ standings, showTeam = true, title = 'Standings' }) {
  const getMedalClass = (position) => {
    if (position === 1) return 'medal-gold';
    if (position === 2) return 'medal-silver';
    if (position === 3) return 'medal-bronze';
    return '';
  };

  const getChangeIndicator = (change) => {
    if (!change) return <span className="text-secondary">-</span>;
    if (change > 0) {
      return (
        <div className="change-indicator positive">
          <TrendingUp size={16} />
          <span>+{change}</span>
        </div>
      );
    }
    return (
      <div className="change-indicator negative">
        <TrendingDown size={16} />
        <span>{change}</span>
      </div>
    );
  };

  return (
    <div className="standings-table-wrapper">
      <h2 className="standings-title">{title}</h2>
      <div className="table-responsive">
        <table className="standings-table">
          <thead>
            <tr>
              <th className="col-position">Pos</th>
              <th className="col-change"></th>
              <th className="col-driver">Driver</th>
              {showTeam && <th className="col-team">Team</th>}
              <th className="col-numeric">Points</th>
              <th className="col-numeric">Wins</th>
              <th className="col-numeric">Top 5</th>
              <th className="col-numeric">Top 10</th>
              <th className="col-numeric">Avg Finish</th>
              <th className="col-numeric">Laps Led</th>
              <th className="col-numeric">Inc</th>
            </tr>
          </thead>
          <tbody>
            {standings && standings.length > 0 ? (
              standings.map((driver, index) => (
                <tr
                  key={driver.id || index}
                  className={`${getMedalClass(driver.position)}`}
                >
                  <td className="col-position">
                    <span className={`position-badge ${getMedalClass(driver.position)}`}>
                      {driver.position}
                    </span>
                  </td>
                  <td className="col-change">
                    {getChangeIndicator(driver.positionChange)}
                  </td>
                  <td className="col-driver">
                    <span className="driver-name">{driver.driverName}</span>
                  </td>
                  {showTeam && (
                    <td className="col-team">
                      <span className="team-name">{driver.team}</span>
                    </td>
                  )}
                  <td className="col-numeric">
                    <strong className="value-bold">{driver.points}</strong>
                  </td>
                  <td className="col-numeric">
                    <span className="stat-value">{driver.wins || 0}</span>
                  </td>
                  <td className="col-numeric">
                    <span className="stat-value">{driver.top5 || 0}</span>
                  </td>
                  <td className="col-numeric">
                    <span className="stat-value">{driver.top10 || 0}</span>
                  </td>
                  <td className="col-numeric">
                    <span className="stat-value">{driver.avgFinish || '-'}</span>
                  </td>
                  <td className="col-numeric">
                    <span className="stat-value">{driver.lapsLed || 0}</span>
                  </td>
                  <td className="col-numeric">
                    <span className={`incidents ${driver.incidents > 0 ? 'has-incidents' : ''}`}>
                      {driver.incidents || 0}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showTeam ? 11 : 10} className="no-data">
                  No standings data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
