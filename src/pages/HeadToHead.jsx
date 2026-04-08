import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DRIVERS = {
  justin: { name: 'Justin Ellis4', number: 5, nickname: 'J-Easy', points: 193, wins: 0, top5: 4, top10: 4, avgFinish: 10.57, lapsLed: 118, totalIncidents: 83,
    races: [{ num: 1, track: 'Daytona', pos: 19 }, { num: 2, track: 'Atlanta', pos: 20 }, { num: 3, track: 'COTA', pos: 22 }, { num: 4, track: 'Phoenix', pos: 4 }, { num: 5, track: 'Las Vegas', pos: 3 }, { num: 6, track: 'Darlington', pos: 2 }, { num: 7, track: 'Martinsville', pos: 4 }] },
  nate: { name: 'Nathan Becker', number: 21, nickname: 'Becker Wrecker', points: 203, wins: 3, top5: 3, top10: 3, avgFinish: 11.14, lapsLed: 168, totalIncidents: 140,
    races: [{ num: 1, track: 'Daytona', pos: 30 }, { num: 2, track: 'Atlanta', pos: 13 }, { num: 3, track: 'COTA', pos: 1 }, { num: 4, track: 'Phoenix', pos: 1 }, { num: 5, track: 'Las Vegas', pos: 19 }, { num: 6, track: 'Darlington', pos: 13 }, { num: 7, track: 'Martinsville', pos: 1 }] },
  blaine: { name: 'Blaine Karnes', number: 25, nickname: 'Tard', points: 187, wins: 0, top5: 4, top10: 4, avgFinish: 10.29, lapsLed: 0, totalIncidents: 127,
    races: [{ num: 1, track: 'Daytona', pos: 15 }, { num: 2, track: 'Atlanta', pos: 17 }, { num: 3, track: 'COTA', pos: 25 }, { num: 4, track: 'Phoenix', pos: 5 }, { num: 5, track: 'Las Vegas', pos: 2 }, { num: 6, track: 'Darlington', pos: 3 }, { num: 7, track: 'Martinsville', pos: 5 }] },
  nik: { name: 'Nik Green2', number: 88, nickname: 'Adventure Man', points: 205, wins: 2, top5: 4, top10: 4, avgFinish: 10.43, lapsLed: 301, totalIncidents: 99,
    races: [{ num: 1, track: 'Daytona', pos: 24 }, { num: 2, track: 'Atlanta', pos: 18 }, { num: 3, track: 'COTA', pos: 24 }, { num: 4, track: 'Phoenix', pos: 2 }, { num: 5, track: 'Las Vegas', pos: 1 }, { num: 6, track: 'Darlington', pos: 1 }, { num: 7, track: 'Martinsville', pos: 3 }] },
  jordan: { name: 'Jordan Stancil', number: 15, nickname: 'J-Dawg', points: 142, wins: 1, top5: 3, top10: 3, avgFinish: 12.83, lapsLed: 1, totalIncidents: 138,
    races: [{ num: 1, track: 'Daytona', pos: 27 }, { num: 2, track: 'Atlanta', pos: 1 }, { num: 3, track: 'COTA', pos: 26 }, { num: 4, track: 'Phoenix', pos: 3 }, { num: 5, track: 'Las Vegas', pos: 4 }, { num: 6, track: 'Darlington', pos: 16 }, { num: 7, track: 'Martinsville', pos: null }] },
  ryan: { name: 'Ryan Ramsey', number: 10, nickname: 'Thunder Boy', points: 128, wins: 0, top5: 1, top10: 1, avgFinish: 19.86, lapsLed: 54, totalIncidents: 72,
    races: [{ num: 1, track: 'Daytona', pos: 18 }, { num: 2, track: 'Atlanta', pos: 30 }, { num: 3, track: 'COTA', pos: 23 }, { num: 4, track: 'Phoenix', pos: 23 }, { num: 5, track: 'Las Vegas', pos: 25 }, { num: 6, track: 'Darlington', pos: 18 }, { num: 7, track: 'Martinsville', pos: 2 }] },
  terry: { name: 'Terry Domino', number: 11, nickname: 'Domino Slices', points: 101, wins: 0, top5: 1, top10: 1, avgFinish: 19.33, lapsLed: 0, totalIncidents: 132,
    races: [{ num: 1, track: 'Daytona', pos: 26 }, { num: 2, track: 'Atlanta', pos: 2 }, { num: 3, track: 'COTA', pos: 27 }, { num: 4, track: 'Phoenix', pos: 25 }, { num: 5, track: 'Las Vegas', pos: 24 }, { num: 6, track: 'Darlington', pos: null }, { num: 7, track: 'Martinsville', pos: 12 }] },
  sam: { name: 'Sam Kunnemann', number: 64, nickname: 'Samon', points: 47, wins: 0, top5: 0, top10: 0, avgFinish: 23.75, lapsLed: 0, totalIncidents: 124,
    races: [{ num: 1, track: 'Daytona', pos: null }, { num: 2, track: 'Atlanta', pos: null }, { num: 3, track: 'COTA', pos: null }, { num: 4, track: 'Phoenix', pos: 24 }, { num: 5, track: 'Las Vegas', pos: 22 }, { num: 6, track: 'Darlington', pos: 25 }, { num: 7, track: 'Martinsville', pos: 24 }] },
  ronald: { name: 'Ronald Ramsey', number: 77, nickname: 'The Fuzz', points: 10, wins: 0, top5: 0, top10: 0, avgFinish: 26.0, lapsLed: 0, totalIncidents: 46,
    races: [{ num: 1, track: 'Daytona', pos: null }, { num: 2, track: 'Atlanta', pos: null }, { num: 3, track: 'COTA', pos: null }, { num: 4, track: 'Phoenix', pos: null }, { num: 5, track: 'Las Vegas', pos: null }, { num: 6, track: 'Darlington', pos: null }, { num: 7, track: 'Martinsville', pos: 26 }] },
};

export default function HeadToHead() {
  const [driverAKey, setDriverAKey] = useState('');
  const [driverBKey, setDriverBKey] = useState('');

  const driverA = driverAKey ? DRIVERS[driverAKey] : null;
  const driverB = driverBKey ? DRIVERS[driverBKey] : null;

  const driverList = Object.entries(DRIVERS).map(([key, driver]) => ({
    key,
    name: driver.name,
    number: driver.number,
  }));

  const chartData = useMemo(() => {
    if (!driverA || !driverB) return [];

    const data = [];
    for (let i = 0; i < 7; i++) {
      const raceA = driverA.races[i];
      const raceB = driverB.races[i];

      data.push({
        race: `Race ${i + 1}`,
        [driverA.name]: raceA?.pos ?? null,
        [driverB.name]: raceB?.pos ?? null,
      });
    }
    return data;
  }, [driverA, driverB]);

  const raceByRaceMatchup = useMemo(() => {
    if (!driverA || !driverB) return [];

    const matchups = [];
    let aWins = 0;
    let bWins = 0;

    for (let i = 0; i < 7; i++) {
      const raceA = driverA.races[i];
      const raceB = driverB.races[i];

      let winner = null;
      if (raceA?.pos !== null && raceB?.pos !== null) {
        if (raceA.pos < raceB.pos) {
          winner = 'A';
          aWins++;
        } else if (raceB.pos < raceA.pos) {
          winner = 'B';
          bWins++;
        }
      }

      matchups.push({
        race: i + 1,
        track: raceA?.track || raceB?.track || 'Unknown',
        posA: raceA?.pos,
        posB: raceB?.pos,
        winner,
        aWins,
        bWins,
      });
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
        aValue: parseFloat(driverA.avgFinish.toFixed(2)),
        bValue: parseFloat(driverB.avgFinish.toFixed(2)),
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

    for (let i = 0; i < 7; i++) {
      const raceA = driverA.races[i];
      const raceB = driverB.races[i];

      if (raceA?.pos !== null && raceB?.pos !== null) {
        totalRaces++;
        if (raceA.pos < raceB.pos) {
          aWins++;
        } else if (raceB.pos < raceA.pos) {
          bWins++;
        }
      }
    }

    return { aWins, bWins, totalRaces };
  }, [driverA, driverB]);

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
              value={driverAKey}
              onChange={(e) => setDriverAKey(e.target.value)}
              className="w-full bg-[#14141f] border border-[#2a2a3e] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#f5a623] transition"
            >
              <option value="">Select Driver A</option>
              {driverList.map((driver) => (
                <option key={driver.key} value={driver.key}>
                  #{driver.number} - {driver.name}
                </option>
              ))}
            </select>
          </div>

          {/* Driver B Selection */}
          <div>
            <label className="block text-[#2ec4b6] font-semibold mb-3">Driver B</label>
            <select
              value={driverBKey}
              onChange={(e) => setDriverBKey(e.target.value)}
              className="w-full bg-[#14141f] border border-[#2a2a3e] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#2ec4b6] transition"
            >
              <option value="">Select Driver B</option>
              {driverList.map((driver) => (
                <option key={driver.key} value={driver.key}>
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
                        const aPos = race.posA !== null ? `P${race.posA}` : 'DNR';
                        const bPos = race.posB !== null ? `P${race.posB}` : 'DNR';
                        const winnerText =
                          race.winner === 'A' ? 'A' : race.winner === 'B' ? 'B' : '-';
                        const winnerColor =
                          race.winner === 'A'
                            ? 'text-[#f5a623]'
                            : race.winner === 'B'
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

        {(!driverA || !driverB) && (driverAKey || driverBKey) && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a] text-lg">Select both drivers to view the comparison</p>
          </div>
        )}
      </div>
    </div>
  );
}
