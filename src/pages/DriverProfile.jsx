import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useComputedStandings, useAllRaceResults } from '../hooks/useSupabase';

export default function DriverProfile() {
  const { id } = useParams();
  const { standings, loading: sLoading } = useComputedStandings();
  const { data: allResults, loading: rLoading } = useAllRaceResults();

  // Find driver in computed standings (has drop-adjusted stats)
  const driver = useMemo(() => {
    if (!standings) return null;
    return standings.find(d => d.id === id) || null;
  }, [standings, id]);

  // Build detailed race results for this driver from raw data
  const raceResults = useMemo(() => {
    if (!allResults || !driver) return [];

    const driverResults = allResults
      .filter(r => r.driver_id === id)
      .sort((a, b) => a.races.race_number - b.races.race_number);

    // Get the droppedRaceIds from the driver's raceByRace
    const droppedTracks = new Set(
      (driver.raceByRace || []).filter(r => r.isDropped).map(r => r.raceNum)
    );

    return driverResults.map(r => {
      // Compute bonus labels for this race
      const raceResults = allResults.filter(res => res.race_id === r.race_id);
      const bonuses = [];

      if (r.start_position === 1) {
        bonuses.push({ label: 'Pole', pts: 2 });
      }

      const fastest = raceResults.reduce((best, res) => {
        if (!res.fastest_lap_time) return best;
        if (!best || res.fastest_lap_time < best.fastest_lap_time) return res;
        return best;
      }, null);
      if (fastest && r.fastest_lap_time && r.fastest_lap_time === fastest.fastest_lap_time) {
        bonuses.push({ label: 'Fast Lap', pts: 2 });
      }

      const maxLapsLed = Math.max(...raceResults.map(res => res.laps_led || 0));
      if (maxLapsLed > 0 && (r.laps_led || 0) === maxLapsLed) {
        bonuses.push({ label: 'Most Led', pts: 2 });
      }

      const minIncidents = Math.min(...raceResults.map(res => res.incidents || 0));
      const tiedForLowest = raceResults.filter(res => (res.incidents || 0) === minIncidents);
      if ((r.incidents || 0) === minIncidents) {
        bonuses.push({
          label: tiedForLowest.length > 1 ? 'Low Inc (tie)' : 'Low Inc',
          pts: tiedForLowest.length > 1 ? 1 : 2,
        });
      }

      return {
        id: r.race_id,
        raceNumber: r.races.race_number,
        track: r.races.track_name,
        date: r.races.race_date,
        finishPosition: r.finish_position,
        startPosition: r.start_position,
        lapsLed: r.laps_led || 0,
        incidents: r.incidents || 0,
        posPoints: r.race_points || 0,
        bonusPoints: r.bonus_points || 0,
        penaltyPoints: r.penalty_points || 0,
        totalPoints: r.total_points || 0,
        bestLap: r.fastest_lap_time,
        bonuses,
        isDropped: droppedTracks.has(r.races.race_number),
      };
    });
  }, [allResults, driver, id]);

  const loading = sLoading || rLoading;

  if (loading) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/drivers" className="flex items-center gap-2 text-[#f5a623] hover:text-white transition mb-8">
            <ArrowLeft size={20} /> Back to Drivers
          </Link>
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a]">Loading driver profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/drivers" className="flex items-center gap-2 text-[#f5a623] hover:text-white transition mb-8">
            <ArrowLeft size={20} /> Back to Drivers
          </Link>
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a]">Driver not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Avg start from race results
  const avgStart = raceResults.length > 0
    ? raceResults.reduce((s, r) => s + (r.startPosition || 0), 0) / raceResults.length
    : 0;

  // Chart data (non-dropped entered races only)
  const chartData = raceResults
    .filter(r => r.finishPosition !== null)
    .map(r => ({
      race: r.track,
      finish: r.finishPosition,
      isDropped: r.isDropped,
    }));

  const maxFinish = Math.max(...chartData.map(d => d.finish), 30);

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link to="/drivers" className="flex items-center gap-2 text-[#f5a623] hover:text-white transition mb-8">
          <ArrowLeft size={20} /> Back to Drivers
        </Link>

        {/* Driver Header */}
        <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-8 mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-2">{driver.name}</h1>
              {driver.nickname && (
                <p className="text-[#f5a623] text-xl font-bold mb-1">"{driver.nickname}"</p>
              )}
              <p className="text-[#8a8a9a] text-lg">{driver.team}</p>
            </div>
            <div className="bg-[#f5a623] text-black rounded-lg px-6 py-4 text-center">
              <div className="text-4xl font-black">{driver.number}</div>
              <div className="text-xs font-bold uppercase mt-1">Car #</div>
            </div>
          </div>
        </div>

        {/* Stats Cards Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#f5a623] transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Points</div>
            <div className="text-[#f5a623] font-black text-3xl">{driver.points}</div>
            <div className="text-xs text-[#8a8a9a] mt-2">
              {driver.posPoints}p
              {driver.bonusPoints > 0 && <span className="text-[#2ec4b6]"> +{driver.bonusPoints}</span>}
              {driver.penaltyPoints < 0 && <span className="text-[#e63946]"> {driver.penaltyPoints}</span>}
            </div>
            {driver.droppedPoints > 0 && (
              <div className="text-xs text-[#e63946] mt-1">-{driver.droppedPoints} dropped</div>
            )}
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#2ec4b6] transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Wins</div>
            <div className="text-[#2ec4b6] font-black text-3xl">{driver.wins}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#e63946] transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Top 5s</div>
            <div className="text-[#e63946] font-black text-3xl">{driver.top5}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-white transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Top 10s</div>
            <div className="text-white font-black text-3xl">{driver.top10}</div>
          </div>
        </div>

        {/* Stats Cards Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Avg Finish</div>
            <div className="text-white font-bold text-2xl">{driver.avgFinish.toFixed(1)}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Avg Start</div>
            <div className="text-white font-bold text-2xl">{avgStart.toFixed(1)}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Laps Led</div>
            <div className="text-white font-bold text-2xl">{driver.lapsLed}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Incidents</div>
            <div className="text-[#e63946] font-bold text-2xl">{driver.totalIncidents}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Races</div>
            <div className="text-white font-bold text-2xl">
              {driver.racesEntered}
              {driver.dnrCount > 0 && (
                <span className="text-[#8a8a9a] text-sm font-normal ml-1">({driver.dnrCount} DNR)</span>
              )}
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Finish Position Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="race" stroke="#8a8a9a" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#8a8a9a"
                  reversed
                  domain={[1, maxFinish]}
                  label={{ value: 'Finish Position', angle: -90, position: 'insideLeft', fill: '#8a8a9a' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#14141f', border: '1px solid #2a2a3e', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#f5a623' }}
                  formatter={(value, name, props) => [
                    `P${value}${props.payload.isDropped ? ' (dropped)' : ''}`,
                    'Finish',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="finish"
                  stroke="#f5a623"
                  strokeWidth={3}
                  dot={({ cx, cy, payload }) => (
                    <circle
                      key={payload.race}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={payload.isDropped ? '#2a2a3e' : '#f5a623'}
                      stroke={payload.isDropped ? '#8a8a9a' : '#f5a623'}
                      strokeWidth={2}
                    />
                  )}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs text-[#8a8a9a]">
              <span className="inline-block w-3 h-3 rounded-full bg-[#2a2a3e] border border-[#8a8a9a] mr-1 align-middle"></span>
              = dropped race (not counted toward stage totals)
            </div>
          </div>
        )}

        {/* Race Results Table */}
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3e]">
            <h2 className="text-2xl font-bold text-white">Season Results</h2>
            <p className="text-[#8a8a9a] text-sm mt-1">
              Worst 3 races dropped per stage. Stats from kept races only.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3e] bg-[#0a0a0f]">
                  <th className="px-4 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">Race</th>
                  <th className="px-4 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">Track</th>
                  <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">Start</th>
                  <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">Finish</th>
                  <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">Laps Led</th>
                  <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">Inc</th>
                  <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">Points</th>
                  <th className="px-4 py-4 text-center text-[#8a8a9a] text-xs font-bold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {raceResults.map((result) => {
                  const bonusTotal = result.bonuses.reduce((s, b) => s + b.pts, 0);
                  return (
                    <tr
                      key={result.id}
                      className={`border-b border-[#2a2a3e] transition ${
                        result.isDropped
                          ? 'opacity-40 bg-[#0a0a0f]'
                          : 'hover:bg-[#1a1a2e]'
                      }`}
                    >
                      <td className="px-4 py-4 text-white font-semibold">R{result.raceNumber}</td>
                      <td className="px-4 py-4 text-white">{result.track}</td>
                      <td className="px-4 py-4 text-right text-white">{result.startPosition}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-bold ${result.finishPosition <= 5 ? 'text-[#f5a623]' : 'text-white'}`}>
                          P{result.finishPosition}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-[#2ec4b6]">{result.lapsLed}</td>
                      <td className="px-4 py-4 text-right text-[#e63946]">{result.incidents}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-[#f5a623] font-bold">{result.totalPoints}</div>
                        <div className="text-xs text-[#8a8a9a]">
                          {result.posPoints}p
                          {bonusTotal > 0 && <span className="text-[#2ec4b6]"> +{bonusTotal}</span>}
                          {result.penaltyPoints < 0 && <span className="text-[#e63946]"> {result.penaltyPoints}</span>}
                        </div>
                        {result.bonuses.length > 0 && (
                          <div className="text-xs mt-1">
                            {result.bonuses.map((b, i) => (
                              <span key={i} className="inline-block bg-[#2ec4b6]/20 text-[#2ec4b6] rounded px-1 mr-1 mb-0.5">
                                {b.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {result.penaltyPoints < 0 && (
                          <div className="text-xs mt-1">
                            <span className="inline-block bg-[#e63946]/20 text-[#e63946] rounded px-1">
                              {result.incidents >= 40 ? '40+ inc' : result.incidents >= 30 ? '30+ inc' : '20+ inc'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {result.isDropped ? (
                          <span className="inline-block bg-[#e63946]/20 text-[#e63946] text-xs font-bold rounded px-2 py-1">
                            DROPPED
                          </span>
                        ) : (
                          <span className="inline-block bg-[#2ec4b6]/20 text-[#2ec4b6] text-xs font-bold rounded px-2 py-1">
                            COUNTED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
