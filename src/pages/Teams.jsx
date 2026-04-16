import React, { useState } from 'react';
import { ChevronDown, Swords, Shield, Zap, Trophy } from 'lucide-react';
import { useComputedStandings, useRaces } from '../hooks/useSupabase';

function getTeammateH2H(standings, driver1, driver2) {
  if (!driver1 || !driver2) return null;
  if (!driver1.raceByRace || !driver2.raceByRace) return null;

  let aWins = 0, bWins = 0;
  const battles = [];

  const maxRaces = Math.max(driver1.raceByRace.length, driver2.raceByRace.length);
  for (let i = 0; i < maxRaces; i++) {
    const aRace = driver1.raceByRace[i];
    const bRace = driver2.raceByRace[i];

    if (aRace && bRace && aRace.finishPosition !== null && bRace.finishPosition !== null) {
      if (aRace.finishPosition < bRace.finishPosition) {
        aWins++;
        battles.push({ race: i, winner: driver1.id });
      } else if (bRace.finishPosition < aRace.finishPosition) {
        bWins++;
        battles.push({ race: i, winner: driver2.id });
      } else {
        battles.push({ race: i, winner: 'tie' });
      }
    }
  }

  return { aWins, bWins, battles };
}

export default function Teams() {
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const { standings, teamStandings, loading } = useComputedStandings();
  const { data: races } = useRaces();

  const toggleExpanded = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-4">Loading Teams...</div>
          <div className="text-[#8a8a9a]">Fetching standings and race data</div>
        </div>
      </div>
    );
  }

  if (!teamStandings || teamStandings.length === 0) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-4">No Teams Data</div>
          <div className="text-[#8a8a9a]">Teams will appear here once season data is available</div>
        </div>
      </div>
    );
  }

  // Build teams with drivers by matching teamStandings to standings
  const teams = teamStandings.map((teamData) => {
    const drivers = teamData.drivers
      .map((driverId) => standings.find((d) => d.id === driverId))
      .filter(Boolean);

    return {
      id: teamData.id,
      name: teamData.name,
      points: teamData.points,
      combinedLapsLed: teamData.lapsLed || 0,
      drivers,
    };
  });

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
            const totalWins = team.drivers.reduce((s, d) => s + (d.wins || 0), 0);
            const totalIncidents = team.drivers.reduce((s, d) => s + (d.totalIncidents || 0), 0);

            // Calculate last 3 races points from raceByRace data
            let last3Total = 0;
            team.drivers.forEach((driver) => {
              if (driver.raceByRace) {
                const lastRaces = driver.raceByRace.slice(-3);
                lastRaces.forEach((race) => {
                  if (race.points) {
                    last3Total += race.points;
                  }
                });
              }
            });

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
            const d1 = team.drivers[0];
            const d2 = team.drivers.length >= 2 ? team.drivers[1] : null;
            const h2h = d1 && d2 ? getTeammateH2H(standings, d1, d2) : null;

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
                              {races && races.length > 0 ? (
                                races.map((race, i) => (
                                  <th key={i} className="px-3 py-2 text-center text-[#8a8a9a] text-xs font-bold uppercase">
                                    {race.track_name?.slice(0, 3) || `R${race.race_number}`}
                                  </th>
                                ))
                              ) : (
                                <th className="px-3 py-2 text-center text-[#8a8a9a] text-xs font-bold uppercase">-</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {team.drivers.map((driver) => (
                              <tr key={driver.id} className="border-b border-[#2a2a3e]">
                                <td className="px-3 py-2">
                                  <span className="text-white font-semibold">{driver.name.split(' ')[0]}</span>
                                  <span className="text-[#8a8a9a] ml-1">#{driver.number}</span>
                                </td>
                                {driver.raceByRace && driver.raceByRace.length > 0 ? (
                                  driver.raceByRace.map((raceData, rIdx) => {
                                    const pos = raceData.finishPosition;
                                    // Find if this driver beat teammate(s) this race
                                    const otherPositions = team.drivers
                                      .filter((d) => d.id !== driver.id)
                                      .map((d) => {
                                        if (d.raceByRace && d.raceByRace[rIdx]) {
                                          return d.raceByRace[rIdx].finishPosition;
                                        }
                                        return null;
                                      })
                                      .filter((p) => p !== null);
                                    const beatAll =
                                      pos !== null &&
                                      otherPositions.length > 0 &&
                                      otherPositions.every((op) => pos < op);

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
                                  })
                                ) : (
                                  <td className="px-3 py-2 text-center text-[#8a8a9a] font-semibold">-</td>
                                )}
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
                              {driver.bonusPoints > 0 && (
                                <span className="text-[#2ec4b6]"> +{driver.bonusPoints}</span>
                              )}
                              {driver.penaltyPoints < 0 && (
                                <span className="text-[#e63946]"> {driver.penaltyPoints}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Wins</div>
                                <div className="text-white font-bold">{driver.wins || 0}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Top 5s</div>
                                <div className="text-white font-bold">{driver.top5 || 0}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Avg Finish</div>
                                <div className="text-[#2ec4b6] font-bold">
                                  {driver.avgFinish ? driver.avgFinish.toFixed(1) : '0.0'}
                                </div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Laps Led</div>
                                <div className="text-white font-bold">{driver.lapsLed || 0}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Incidents</div>
                                <div className="text-[#e63946] font-bold">{driver.totalIncidents || 0}</div>
                              </div>
                              <div>
                                <div className="text-[#8a8a9a] text-xs uppercase">Top 10s</div>
                                <div className="text-white font-bold">{driver.top10 || 0}</div>
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
