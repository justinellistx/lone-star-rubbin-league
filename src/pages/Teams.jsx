import React, { useState } from 'react';
import { ChevronDown, Swords, Shield, Zap, Trophy } from 'lucide-react';
import { useTeamStandings } from '../hooks/useSupabase';

const DRIVER_RACES = {
  justin: [19, 20, 22, 4, 3, 2, 4],
  nate:   [30, 13, 1, 1, 19, 13, 1],
  blaine: [15, 17, 25, 5, 2, 3, 5],
  nik:    [24, 18, 24, 2, 1, 1, 3],
  jordan: [27, 1, 26, 3, 4, 16, null],
  ryan:   [18, 30, 23, 23, 25, 18, 2],
  terry:  [26, 2, 27, 25, 24, null, 12],
  sam:    [null, null, null, 24, 22, 25, 24],
  ronald: [null, null, null, null, null, null, 26],
};

const DRIVER_INC = {
  justin: [8, 18, 17, 0, 0, 30, 10],
  nate:   [16, 34, 17, 12, 11, 40, 10],
  blaine: [8, 30, 43, 4, 4, 20, 18],
  nik:    [20, 22, 25, 12, 6, 10, 4],
  jordan: [8, 42, 46, 4, 0, 38, null],
  ryan:   [8, 24, 8, 12, 4, 12, 4],
  terry:  [6, 33, 45, 10, 6, null, 32],
  sam:    [null, null, null, 20, 10, 42, 52],
  ronald: [null, null, null, null, null, null, 46],
};

const RACE_NAMES = ['Daytona', 'Atlanta', 'COTA', 'Phoenix', 'Las Vegas', 'Darlington', 'Martinsville'];

const DEMO_TEAMS = {
  stage1: [
    {
      id: 'team-1', position: 1, name: 'Justin+Nate', points: 396, combinedLapsLed: 286,
      drivers: [
        { id: 'justin', name: 'Justin Ellis4', number: 5, nickname: 'J-Easy', points: 193, posPoints: 185, bonusPoints: 9, penaltyPoints: -1, wins: 0, top5: 4, top10: 4, avgFinish: 10.57, lapsLed: 118, totalIncidents: 83 },
        { id: 'nate', name: 'Nathan Becker', number: 21, nickname: 'Becker Wrecker', points: 203, posPoints: 193, bonusPoints: 14, penaltyPoints: -4, wins: 3, top5: 3, top10: 3, avgFinish: 11.14, lapsLed: 168, totalIncidents: 140 },
      ],
    },
    {
      id: 'team-2', position: 2, name: 'Nik+Jordan', points: 347, combinedLapsLed: 302,
      drivers: [
        { id: 'nik', name: 'Nik Green2', number: 88, nickname: 'Adventure Man', points: 205, posPoints: 194, bonusPoints: 13, penaltyPoints: -2, wins: 2, top5: 4, top10: 4, avgFinish: 10.43, lapsLed: 301, totalIncidents: 99 },
        { id: 'jordan', name: 'Jordan Stancil', number: 15, nickname: 'J-Dawg', points: 142, posPoints: 149, bonusPoints: 1, penaltyPoints: -8, wins: 1, top5: 3, top10: 3, avgFinish: 12.83, lapsLed: 1, totalIncidents: 138 },
      ],
    },
    {
      id: 'team-3', position: 3, name: 'Blaine+Terry', points: 288, combinedLapsLed: 0,
      drivers: [
        { id: 'blaine', name: 'Blaine Karnes', number: 25, nickname: 'Tard', points: 187, posPoints: 187, bonusPoints: 4, penaltyPoints: -4, wins: 0, top5: 4, top10: 4, avgFinish: 10.29, lapsLed: 0, totalIncidents: 127 },
        { id: 'terry', name: 'Terry Domino', number: 11, nickname: 'Domino Slices', points: 101, posPoints: 106, bonusPoints: 2, penaltyPoints: -7, wins: 0, top5: 1, top10: 1, avgFinish: 19.33, lapsLed: 0, totalIncidents: 132 },
      ],
    },
    {
      id: 'team-4', position: 4, name: 'Ryan+Sam+Ronald', points: 185, combinedLapsLed: 54,
      drivers: [
        { id: 'ryan', name: 'Ryan Ramsey', number: 10, nickname: 'Thunder Boy', points: 128, posPoints: 120, bonusPoints: 9, penaltyPoints: -1, wins: 0, top5: 1, top10: 1, avgFinish: 19.86, lapsLed: 54, totalIncidents: 72 },
        { id: 'sam', name: 'Sam Kunnemann', number: 64, nickname: 'Samon', points: 47, posPoints: 53, bonusPoints: 0, penaltyPoints: -6, wins: 0, top5: 0, top10: 0, avgFinish: 23.75, lapsLed: 0, totalIncidents: 124 },
        { id: 'ronald', name: 'Ronald Ramsey', number: 77, nickname: 'The Fuzz', points: 10, posPoints: 11, bonusPoints: 2, penaltyPoints: -3, wins: 0, top5: 0, top10: 0, avgFinish: 26.0, lapsLed: 0, totalIncidents: 46 },
      ],
    },
  ],
};

function getTeammateH2H(driverIds) {
  if (driverIds.length < 2) return null;
  const [a, b] = driverIds;
  let aWins = 0, bWins = 0;
  const battles = [];
  for (let i = 0; i < 7; i++) {
    const aPos = DRIVER_RACES[a][i];
    const bPos = DRIVER_RACES[b][i];
    if (aPos !== null && bPos !== null) {
      if (aPos < bPos) { aWins++; battles.push({ race: i, winner: a }); }
      else if (bPos < aPos) { bWins++; battles.push({ race: i, winner: b }); }
      else { battles.push({ race: i, winner: 'tie' }); }
    }
  }
  return { aWins, bWins, battles };
}

function getTeamWeeklyPoints(team) {
  return RACE_NAMES.map((_, rIdx) => {
    let total = 0;
    team.drivers.forEach((d) => {
      const pos = DRIVER_RACES[d.id][rIdx];
      if (pos !== null) {
        if (pos === 1) total += 40;
        else if (pos === 2) total += 35;
        else if (pos >= 3 && pos <= 40) total += 37 - pos;
        else total += 1;
      }
    });
    return total;
  });
}

export default function Teams() {
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const { data: teamStandings } = useTeamStandings(null);

  const teams =
    teamStandings && teamStandings.length > 0 && teamStandings[0].points !== undefined
      ? teamStandings
      : DEMO_TEAMS.stage1;

  const toggleExpanded = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">TEAM WAR ROOM</h1>
          <p className="text-[#8a8a9a] text-lg">2026 Season - Stage 1 Team Breakdown</p>
        </div>

        {/* Team Power Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {teams.map((team, idx) => {
            const totalWins = team.drivers.reduce((s, d) => s + d.wins, 0);
            const totalIncidents = team.drivers.reduce((s, d) => s + d.totalIncidents, 0);
            const weeklyPts = getTeamWeeklyPoints(team);
            const last3Total = weeklyPts.slice(4).reduce((s, p) => s + p, 0);

            return (
              <div
                key={team.id}
                className={`bg-[#14141f] border rounded-lg p-6 ${
                  idx === 0 ? 'border-[#f5a623]' : 'border-[#2a2a3e]'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg font-black text-lg ${
                      idx === 0 ? 'bg-[#f5a623] text-black' : 'bg-[#2a2a3e] text-white'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{team.name}</div>
                    <div className="text-[#8a8a9a] text-xs">{team.drivers.length} drivers</div>
                  </div>
                </div>
                <div className="text-[#f5a623] font-black text-3xl mb-4">{team.points} pts</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8a8a9a]">Total Wins</span>
                    <span className="text-[#2ec4b6] font-bold">{totalWins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a8a9a]">Laps Led</span>
                    <span className="text-white font-bold">{team.combinedLapsLed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a8a9a]">Team Incidents</span>
                    <span className="text-[#e63946] font-bold">{totalIncidents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a8a9a]">Last 3 Races (pos pts)</span>
                    <span className="text-[#f5a623] font-bold">{last3Total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Detail Cards */}
        <div className="space-y-8">
          {teams.map((team, teamIdx) => {
            const isExpanded = expandedTeamId === team.id;
            const h2h = team.drivers.length >= 2 ? getTeammateH2H(team.drivers.map((d) => d.id)) : null;
            const d1 = team.drivers[0];
            const d2 = team.drivers.length >= 2 ? team.drivers[1] : null;

            return (
              <div
                key={team.id}
                className={`bg-[#14141f] border rounded-lg overflow-hidden ${
                  teamIdx === 0 ? 'border-[#f5a623]' : 'border-[#2a2a3e]'
                }`}
              >
                {/* Team Header */}
                <button
                  onClick={() => toggleExpanded(team.id)}
                  className="w-full px-6 py-6 flex items-center justify-between hover:bg-[#1a1a2e] transition"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <Swords size={20} className="text-[#f5a623]" />
                      <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                      <span className="text-[#f5a623] font-bold">{team.points} pts</span>
                    </div>
                    <div className="text-[#8a8a9a] text-sm">
                      {team.drivers.map((d) => `${d.name} "${d.nickname}"`).join(' & ')}
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-[#f5a623] transition ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-[#2a2a3e]">
                    {/* Teammate Head-to-Head */}
                    {h2h && d2 && (
                      <div className="px-6 py-6 border-b border-[#2a2a3e] bg-[#0a0a0f]">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                          <Swords size={16} className="text-[#e63946]" />
                          Teammate Head-to-Head
                        </h4>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center flex-1">
                            <div className="text-white font-bold text-lg">{d1.name}</div>
                            <div className="text-[#8a8a9a] text-sm">#{d1.number}</div>
                          </div>
                          <div className="px-6">
                            <div className="flex items-center gap-3">
                              <span className={`text-3xl font-black ${h2h.aWins > h2h.bWins ? 'text-[#f5a623]' : 'text-white'}`}>
                                {h2h.aWins}
                              </span>
                              <span className="text-[#8a8a9a] text-xl">-</span>
                              <span className={`text-3xl font-black ${h2h.bWins > h2h.aWins ? 'text-[#f5a623]' : 'text-white'}`}>
                                {h2h.bWins}
                              </span>
                            </div>
                          </div>
                          <div className="text-center flex-1">
                            <div className="text-white font-bold text-lg">{d2.name}</div>
                            <div className="text-[#8a8a9a] text-sm">#{d2.number}</div>
                          </div>
                        </div>
                        {/* H2H bar */}
                        <div className="w-full h-3 bg-[#2a2a3e] rounded-full overflow-hidden mb-4">
                          <div
                            className="h-full bg-gradient-to-r from-[#f5a623] to-[#2ec4b6]"
                            style={{ width: `${(h2h.aWins / (h2h.aWins + h2h.bWins || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Side-by-Side Stats */}
                    {d2 && (
                      <div className="px-6 py-6 border-b border-[#2a2a3e]">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                          <Shield size={16} className="text-[#2ec4b6]" />
                          Stat Comparison
                        </h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Points', a: d1.points, b: d2.points, higher: true },
                            { label: 'Wins', a: d1.wins, b: d2.wins, higher: true },
                            { label: 'Top 5s', a: d1.top5, b: d2.top5, higher: true },
                            { label: 'Avg Finish', a: d1.avgFinish, b: d2.avgFinish, higher: false },
                            { label: 'Laps Led', a: d1.lapsLed, b: d2.lapsLed, higher: true },
                            { label: 'Total Incidents', a: d1.totalIncidents, b: d2.totalIncidents, higher: false },
                            { label: 'Bonus Pts', a: d1.bonusPoints, b: d2.bonusPoints, higher: true },
                            { label: 'Penalty Pts', a: d1.penaltyPoints, b: d2.penaltyPoints, higher: true },
                          ].map((stat) => {
                            const aWins = stat.higher ? stat.a > stat.b : stat.a < stat.b;
                            const bWins = stat.higher ? stat.b > stat.a : stat.b < stat.a;
                            const tie = stat.a === stat.b;
                            return (
                              <div key={stat.label} className="flex items-center gap-4">
                                <div className={`w-20 text-right font-bold ${aWins ? 'text-[#f5a623]' : tie ? 'text-white' : 'text-[#8a8a9a]'}`}>
                                  {typeof stat.a === 'number' && stat.label === 'Avg Finish' ? stat.a.toFixed(1) : stat.a}
                                </div>
                                <div className="flex-1 text-center text-[#8a8a9a] text-xs uppercase font-bold">
                                  {stat.label}
                                </div>
                                <div className={`w-20 text-left font-bold ${bWins ? 'text-[#f5a623]' : tie ? 'text-white' : 'text-[#8a8a9a]'}`}>
                                  {typeof stat.b === 'number' && stat.label === 'Avg Finish' ? stat.b.toFixed(1) : stat.b}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Race-by-Race Comparison */}
                    <div className="px-6 py-6 border-b border-[#2a2a3e]">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-[#f5a623]" />
                        Race-by-Race Finishes
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#2a2a3e]">
                              <th className="px-3 py-2 text-left text-[#8a8a9a] text-xs font-bold uppercase">Driver</th>
                              {RACE_NAMES.map((t, i) => (
                                <th key={i} className="px-3 py-2 text-center text-[#8a8a9a] text-xs font-bold uppercase">{t.slice(0, 3)}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {team.drivers.map((driver) => (
                              <tr key={driver.id} className="border-b border-[#2a2a3e]">
                                <td className="px-3 py-2">
                                  <span className="text-white font-semibold">{driver.name.split(' ')[0]}</span>
                                  <span className="text-[#8a8a9a] ml-1">#{driver.number}</span>
                                </td>
                                {DRIVER_RACES[driver.id].map((pos, rIdx) => {
                                  // Find if this driver beat teammate(s) this race
                                  const otherPositions = team.drivers
                                    .filter((d) => d.id !== driver.id)
                                    .map((d) => DRIVER_RACES[d.id][rIdx])
                                    .filter((p) => p !== null);
                                  const beatAll = pos !== null && otherPositions.length > 0 && otherPositions.every((op) => pos < op);

                                  return (
                                    <td
                                      key={rIdx}
                                      className={`px-3 py-2 text-center font-semibold ${
                                        pos === null
                                          ? 'text-[#8a8a9a]'
                                          : beatAll
                                            ? 'text-[#f5a623]'
                                            : pos <= 5
                                              ? 'text-[#2ec4b6]'
                                              : 'text-white'
                                      }`}
                                    >
                                      {pos === null ? 'DNR' : `P${pos}`}
                                      {beatAll && ' ★'}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 text-xs text-[#8a8a9a]">
                        <span className="text-[#f5a623]">★</span> = beat teammate(s) that race
                      </div>
                    </div>

                    {/* Driver Cards */}
                    <div className="px-6 py-6">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Trophy size={16} className="text-[#f5a623]" />
                        Driver Breakdown
                      </h4>
                      <div className={`grid grid-cols-1 ${team.drivers.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                        {team.drivers.map((driver) => (
                          <div key={driver.id} className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="text-white font-bold">{driver.name}</div>
                                <div className="text-[#f5a623] text-sm">"{driver.nickname}"</div>
                              </div>
                              <div className="bg-[#f5a623] text-black rounded px-3 py-1 font-black text-lg">
                                #{driver.number}
                              </div>
                            </div>
                            <div className="text-[#f5a623] font-black text-2xl mb-3">{driver.points} pts</div>
                            <div className="text-xs text-[#8a8a9a] mb-4">
                              {driver.posPoints}p
                              {driver.bonusPoints > 0 && <span className="text-[#2ec4b6]"> +{driver.bonusPoints}</span>}
                              {driver.penaltyPoints < 0 && <span className="text-[#e63946]"> {driver.penaltyPoints}</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Wins</div>
                                <div className="text-white font-bold">{driver.wins}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Top 5s</div>
                                <div className="text-white font-bold">{driver.top5}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Avg Finish</div>
                                <div className="text-[#2ec4b6] font-bold">{(driver.avgFinish || 0).toFixed(1)}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Laps Led</div>
                                <div className="text-white font-bold">{driver.lapsLed}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Incidents</div>
                                <div className="text-[#e63946] font-bold">{driver.totalIncidents}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Top 10s</div>
                                <div className="text-white font-bold">{driver.top10}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
