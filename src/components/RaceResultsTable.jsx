import React from 'react';
import '../styles/race-results-table.css';

export default function RaceResultsTable({ results, raceName = 'Race Results', raceDate }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'status-running';
      case 'retired':
        return 'status-retired';
      case 'disqualified':
        return 'status-disqualified';
      case 'dnf':
        return 'status-retired';
      default:
        return 'status-finished';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Finished';
    const label = status.toUpperCase();
    return label;
  };

  return (
    <div className="race-results-wrapper">
      <div className="race-header">
        <h2 className="race-title">{raceName}</h2>
        {raceDate && <p className="race-date">{raceDate}</p>}
      </div>

      <div className="table-responsive">
        <table className="race-results-table">
          <thead>
            <tr>
              <th className="col-pos">Pos</th>
              <th className="col-driver">Driver</th>
              <th className="col-numeric">Start</th>
              <th className="col-interval">Interval</th>
              <th className="col-numeric">Laps Led</th>
              <th className="col-numeric">Fastest Lap</th>
              <th className="col-numeric">Laps Comp</th>
              <th className="col-numeric">Inc</th>
              <th className="col-numeric">Points</th>
              <th className="col-numeric">Bonus</th>
              <th className="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            {results && results.length > 0 ? (
              results.map((result, index) => {
                const isWinner = result.finishPosition === 1 || result.position === 1;
                const isDNF = result.status?.toLowerCase() === 'dnf' ||
                             result.status?.toLowerCase() === 'retired' ||
                             result.status?.toLowerCase() === 'disqualified';

                return (
                  <tr
                    key={result.id || index}
                    className={`
                      ${isWinner ? 'winner-row' : ''}
                      ${isDNF ? 'dnf-row' : ''}
                    `}
                  >
                    <td className="col-pos">
                      <span className={`finish-badge ${isWinner ? 'winner' : ''}`}>
                        {result.finishPosition || result.position || index + 1}
                      </span>
                    </td>
                    <td className="col-driver">
                      <span className="driver-name">
                        {result.driverName || result.driver}
                      </span>
                    </td>
                    <td className="col-numeric">
                      {result.startPosition || result.start || '-'}
                    </td>
                    <td className="col-interval">
                      {result.interval || (index === 0 ? 'Leader' : '-')}
                    </td>
                    <td className="col-numeric">
                      {result.lapsLed || 0}
                    </td>
                    <td className="col-numeric">
                      {result.fastestLap ? (
                        <span className={result.fastestLap ? 'fastest-lap' : ''}>
                          {result.fastestLap}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="col-numeric">
                      {result.lapsCompleted || result.lapsComp || '-'}
                    </td>
                    <td className="col-numeric">
                      <span className={`incidents ${result.incidents > 0 ? 'has-incidents' : ''}`}>
                        {result.incidents || 0}
                      </span>
                    </td>
                    <td className="col-numeric">
                      <strong className="value-bold">
                        {result.points || 0}
                      </strong>
                    </td>
                    <td className="col-numeric">
                      {result.bonusPoints || 0}
                    </td>
                    <td className="col-status">
                      <span className={`status-badge ${getStatusColor(result.status)}`}>
                        {getStatusLabel(result.status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="no-data">
                  No race results available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
