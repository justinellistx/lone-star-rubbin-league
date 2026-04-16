import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useComputedStandings, useRaces } from '../hooks/useSupabase';

export default function HeadToHead() {
  const [driverAId, setDriverAId] = useState('');
  const [driverBId, setDriverBId] = useState('');

  const { standings, loading: standingsLoading } = useComputedStandings();
  const { data: races } = useRaces();

  // Build race lookup map by race number
  const raceMap = useMemo(() => {
    const map = {};
    if (races) {
      races.forEach(race => {
        map[race.race_number] = race;
      });
    }
    return map;
  }, [races]);

  const driverList = useMemo(() => {
    if (!standings) return [];
    return standings.map(driver => ({
      id: driver.id,
      name: driver.name,
      number: driver.number,
    }));
  }, [standings]);

  const driverA = driverAId && standings ? standings.find(d => d.id === driverAId) : null;
  const driverB = driverBId && standings ? standings.find(d => d.id === driverBId) : null;

  const chartData = useMemo(() => {
    if (!driverA || !driverB) return [];

    const data = [];
    const maxRaces = Math.max(driverA.raceByRace.length, driverB.raceByRace.length);

    for (let i = 0; i < maxRaces; i++) {
      const raceA = driverA.raceByRace[i];
      const raceB = driverB.raceByRace[i];

      data.push({
        race: `Race ${i + 1}`,
        [driverA.name]: raceA?.finishPosition ?? null,
        [driverB.name]: raceB?.finishPosition ?? null,
      });
    }
    return data;
  }, [driverA, driverB]);

  const raceByRaceMatchup = useMemo(() => {
    if (!driverA || !driverB) return [];

    const matchups = [];
    let aWins = 0;
    let bWins = 0;

    const maxRaces = Math.max(driverA.raceByRace.length, driverB.raceByRace.length);

    for (let i = 0; i < maxRaces; i++) {
      const raceA = driverA.raceByRace[i];
      const raceB = driverB.raceByRace[i];

      let winner = null;
      let raced = false;

      // Only count as a race if both drivers participated
      if (raceA && raceB) {
        raced = true;
        if (raceA.finishPosition < raceB.finishPosition) {
          winner = 'A';
          aWins++;
        } else if (raceB.finishPosition < raceA.finishPosition) {
          winner = 'B';
          bWins++;
        }
      }

      if (raceA || raceB) {
        matchups.push({
          race: i + 1,
          track: raceA?.track || raceB?.track || 'Unknown',
          posA: raceA?.finishPosition,
          posB: raceB?.finishPosition,
          raced,
          winner,
          aWins,
          bWins,
        });
      }
    }

    return matchups;
  }, [driverA, driverB]);

  const stats = useMemo(() => {
    if (!driverA || !driverB) return null;

    return [
      {
        label: 'Points',
        aValue: driverA.points,
        bValue: driverB.points,
        lowerIsBetter: false,
      },
      {
        label: 'Wins',
        aValue: driverA.wins,
        bValue: driverB.wins,
        lowerIsBetter: false,
      },
      {
        label: 'Top 5s',
        aValue: driverA.top5,
        bValue: driverB.top5,
        lowerIsBetter: false,
      },
      {
        label: 'Top 10s',
        aValue: driverA.top10,
        bValue: driverB.top10,
        lowerIsBetter: false,
      },
      {
        label: 'Avg Finish',
        aValue: driverA.avgFinish,
        bValue: driverB.avgFinish,
        lowerIsBetter: true,
      },
      {
        label: 'Laps Led',
        aValue: driverA.lapsLed,
        bValue: driverB.lapsLed,
        lowerIsBetter: false,
      },
      {
        label: 'Total Incidents',
        aValue: driverA.totalIncidents,
        bValue: driverB.totalIncidents,
        lowerIsBetter: true,
      },
    ];
  }, [driverA, driverB]);

  const getBarWidth = (aVal, bVal, lowerIsBetter) => {
    const maxVal = Math.max(aVal, bVal);
    if (maxVal === 0) return { aWidth: 0, bWidth: 0 };

    if (lowerIsBetter) {
      return {
        aWidth: (100 * (maxVal - aVal)) / (maxVal === aVal && maxVal === bVal ? 100 : maxVal),
        bWidth: (100 * (maxVal - bVal)) / (maxVal === aVal && maxVal === bVal ? 100 : maxVal),
      };
    } else {
      return {
        aWidth: (100 * aVal) / maxVal,
        bWidth: (100 * bVal) / maxVal,
      };
    }
  };

  const headToHeadWins = useMemo(() => {
    if (!driverA || !driverB) return { aWins: 0, bWins: 0, totalRaces: 0 };

    let aWins = 0;
    let bWins = 0;
    let totalRaces = 0;

    const maxRaces = Math.max(driverA.raceByRace.length, driverB.raceByRace.length);

    for (let i = 0; i < maxRaces; i++) {
      const raceA = driverA.raceByRace[i];
      const raceB = driverB.raceByRace[i];

      if (raceA && raceB && raceA.finishPosition !== null && raceB.finishPosition !== null) {
        totalRaces++;
        if (raceA.finishPosition < raceB.finishPosition) {
          aWins++;
        } else if (raceB.finishPosition < raceA.finishPosition) {
          bWins++;
        }
      }
    }

    return { aWins, bWins, totalRaces };
  }, [driverA, driverB]);

  if (standingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="h-12 w-12 border-4 border-[#2a2a3e] border-t-[#f5a623] rounded-full"></div>
          </div>
          <p className="text-[#8a8a9a] text-lg">Loading driver standings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Head-to-Head</h1>
          <p className="text-[#8a8a9a]">Compare two drivers across the season</p>
        </div>

        {/* Driver Selection */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {/* Driver A Selection */}
          <div>
            <label className="block text-[#f5a623] font-semibold mb-3">Driver A</label>
            <select
              value={driverAId}
              onChange={(e) => setDriverAId(e.target.value)}
              className="w-full bg-[#14141f] border border-[#2a2a3e] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#f5a623] transition"
            >
              <option value="">Select Driver A</option>
              {driverList.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  #{driver.number} - {driver.name}
                </option>
              ))}
            </select>
          </div>

          {/* Driver B Selection */}
          <div>
            <label className="block text-[#2ec4b6] font-semibold mb-3">Driver B</label>
            <select
              value={driverBId}
              onChange={(e) => setDriverBId(e.target.value)}
              className="w-full bg-[#14141f] border border-[#2a2a3e] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#2ec4b6] transition"
            >
              <option value="">Select Driver B</option>
              {driverList.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  #{driver.number} - {driver.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {driverA && driverB && (
          <>
            {/* VS Card */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-8 shadow-2xl">
                <div className="grid grid-cols-3 gap-8 items-center">
                  {/* Driver A */}
                  <div className="text-center border-r border-[#2a2a3e]">
                    <div className="text-6xl font-bold text-[#f5a623] mb-2">{driverA.number}</div>
                    <h2 className="text-2xl font-bold text-white mb-1">{driverA.name}</h2>
                    <p className="text-[#8a8a9a] italic">{driverA.nickname}</p>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-5xl font-black text-[#e63946] mb-4">VS</div>
                    <div className="h-1 bg-gradient-to-r from-[#f5a623] via-[#e63946] to-[#2ec4b6] rounded-full"></div>
                  </div>

                  {/* Driver B */}
                  <div className="text-center border-l border-[#2a2a3e]">
                    <div className="text-6xl font-bold text-[#2ec4b6] mb-2">{driverB.number}</div>
                    <h2 className="text-2xl font-bold text-white mb-1">{driverB.name}</h2>
                    <p className="text-[#8a8a9a] italic">{driverB.nickname}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Comparison */}
            <div className="mb-12">
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-8">Season Statistics</h3>
                <div className="space-y-6">
                  {stats.map((stat, idx) => {
                    const { aWidth, bWidth } = getBarWidth(stat.aValue, stat.bValue, stat.lowerIsBetter);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <div className="flex-1 text-right pr-4">
                            <span className="text-[#f5a623] font-semibold">{stat.aValue}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[#8a8a9a] font-semibold text-sm">{stat.label}</span>
                          </div>
                          <div className="flex-1 text-left pl-4">
                            <span className="text-[#2ec4b6] font-semibold">{stat.bValue}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 h-8">
                          {/* Driver A Bar */}
                          <div className="flex-1 bg-[#0a0a0f] border border-[#2a2a3e] rounded overflow-hidden">
                            <div
                              style={{ width: `${aWidth}%` }}
                              className="h-full bg-gradient-to-r from-[#f5a623] to-[#e8a000] transition-all duration-300"
                            ></div>
                          </div>

                          {/* Driver B Bar */}
                          <div className="flex-1 bg-[#0a0a0f] border border-[#2a2a3e] rounded overflow-hidden">
                            <div
                              style={{ width: `${bWidth}%`, marginLeft: 'auto' }}
                              className="h-full bg-gradient-to-l from-[#2ec4b6] to-[#1fa39f] transition-all duration-300"
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Finish Position Chart */}
            <div className="mb-12">
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-8">Finish Position Across Season</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis
                      dataKey="race"
                      stroke="#8a8a9a"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#8a8a9a"
                      tick={{ fontSize: 12 }}
                      reversed={true}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#14141f',
                        border: '1px solid #2a2a3e',
                        borderRadius: '8px',
                        color: '#ffffff',
                      }}
                      formatter={(value) => (value !== null ? `P${value}` : 'DNR')}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={driverA.name}
                      stroke="#f5a623"
                      strokeWidth={3}
                      dot={{ fill: '#f5a623', r: 5 }}
                      activeDot={{ r: 7 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey={driverB.name}
                      stroke="#2ec4b6"
                      strokeWidth={3}
                      dot={{ fill: '#2ec4b6', r: 5 }}
                      activeDot={{ r: 7 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Race-by-Race Matchup Table */}
            <div className="mb-12">
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8">
                <h3 className="text-2xl font-bold text-white mb-8">Race-by-Race Matchup</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2a3e]">
                        <th className="text-left py-3 px-4 text-[#8a8a9a] font-semibold">Race</th>
                        <th className="text-left py-3 px-4 text-[#8a8a9a] font-semibold">Track</th>
                        <th className="text-center py-3 px-4 text-[#f5a623] font-semibold">{driverA.name}</th>
                        <th className="text-center py-3 px-4 text-[#8a8a9a] font-semibold">Winner</th>
                        <th className="text-center py-3 px-4 text-[#2ec4b6] font-semibold">{driverB.name}</th>
                        <th className="text-right py-3 px-4 text-[#8a8a9a] font-semibold">Tally</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raceByRaceMatchup.map((race) => {
                        const aPos = race.posA !== null && race.posA !== undefined ? `P${race.posA}` : 'DNR';
                        const bPos = race.posB !== null && race.posB !== undefined ? `P${race.posB}` : 'DNR';
                        const winnerText =
                          race.raced && race.winner === 'A' ? 'A' : race.raced && race.winner === 'B' ? 'B' : '-';
                        const winnerColor =
                          race.raced && race.winner === 'A'
                            ? 'text-[#f5a623]'
                            : race.raced && race.winner === 'B'
                            ? 'text-[#2ec4b6]'
                            : 'text-[#8a8a9a]';

                        return (
                          <tr key={race.race} className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition">
                            <td className="py-3 px-4 text-white font-semibold">Race {race.race}</td>
                            <td className="py-3 px-4 text-[#8a8a9a]">{race.track}</td>
                            <td className="py-3 px-4 text-center text-[#f5a623]">{aPos}</td>
                            <td className={`py-3 px-4 text-center font-bold text-lg ${winnerColor}`}>
                              {winnerText}
                            </td>
                            <td className="py-3 px-4 text-center text-[#2ec4b6]">{bPos}</td>
                            <td className="py-3 px-4 text-right text-[#8a8a9a]">
                              {race.aWins} - {race.bWins}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Who Wins Summary */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Who Wins?</h3>
                <p className="text-xl text-[#8a8a9a]">
                  <span className="text-[#f5a623] font-bold">{driverA.name}</span> beats{' '}
                  <span className="text-[#2ec4b6] font-bold">{driverB.name}</span> in{' '}
                  <span className="text-white font-bold text-2xl">{headToHeadWins.aWins}</span> of{' '}
                  <span className="text-white font-bold text-2xl">{headToHeadWins.totalRaces}</span> races
                </p>
              </div>
            </div>
          </>
        )}

        {(!driverA || !driverB) && (driverAId || driverBId) && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a] text-lg">Select both drivers to view the comparison</p>
          </div>
        )}
      </div>
    </div>
  );
}
