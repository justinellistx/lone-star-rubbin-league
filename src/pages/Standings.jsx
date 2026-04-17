import React, { useState } from 'react';
import { ChevronDown, Trophy, Zap, Shield } from 'lucide-react';
import { useComputedStandings } from '../hooks/useSupabase';

export default function Standings() {
  const [selectedStage, setSelectedStage] = useState('stage1');
  const [expandedSection, setExpandedSection] = useState(false);
  const { standings, stageBonusTracker, loading, error } = useComputedStandings();

  // Fallback to empty state while loading
  const displayStandings = standings || [];
  const leader = displayStandings[0] || { name: '—', points: '—' };
  const mostWins =
    displayStandings.length > 0
      ? displayStandings.reduce((max, driver) =>
          driver.wins > (max.wins || 0) ? driver : max
        )
      : { name: '—', wins: '—' };
  const bestAvgFinish =
    displayStandings.length > 0
      ? displayStandings.reduce((min, driver) =>
          driver.avgFinish < (min.avgFinish || Infinity) ? driver : min
        )
      : { name: '—', avgFinish: '—' };
  const mostLapsLed =
    displayStandings.length > 0
      ? displayStandings.reduce((max, driver) =>
          driver.lapsLed > (max.lapsLed || 0) ? driver : max
        )
      : { name: '—', lapsLed: '—' };

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">STANDINGS</h1>
          <p className="text-[#8a8a9a] text-lg">2026 Season - All Stages</p>
        </div>

        {/* Stage Selector */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
          {['stage1', 'stage2', 'stage3', 'overall'].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-6 py-3 rounded font-bold whitespace-nowrap transition ${
                selectedStage === stage
                  ? 'bg-[#f5a623] text-black'
                  : 'bg-[#14141f] text-white border border-[#2a2a3e] hover:border-[#f5a623]'
              }`}
            >
              {stage === 'stage1'
                ? 'Stage 1: Trucks'
                : stage === 'stage2'
                  ? 'Stage 2: Xfinity'
                  : stage === 'stage3'
                    ? 'Stage 3: Cup'
                    : 'Overall'}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#2a2a3e] border-t-[#f5a623] rounded-full animate-spin mb-4"></div>
              <p className="text-[#8a8a9a]">Loading standings data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[#14141f] border border-[#e63946] rounded-lg p-6 mb-12">
            <p className="text-[#e63946] font-bold">Error loading standings</p>
            <p className="text-[#8a8a9a] text-sm mt-2">{error}</p>
          </div>
        )}

        {/* Stats Summary Cards */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Leader</div>
                <div className="text-white font-bold text-xl mb-2">{leader.name}</div>
                <div className="text-[#f5a623] font-bold text-2xl">{leader.points} pts</div>
              </div>

              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Most Wins</div>
                <div className="text-white font-bold text-xl mb-2">{mostWins.name}</div>
                <div className="text-[#2ec4b6] font-bold text-2xl">{mostWins.wins} wins</div>
              </div>

              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Best Avg Finish</div>
                <div className="text-white font-bold text-xl mb-2">{bestAvgFinish.name}</div>
                <div className="text-[#e63946] font-bold text-2xl">{bestAvgFinish.avgFinish}</div>
              </div>

              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Most Laps Led</div>
                <div className="text-white font-bold text-xl mb-2">{mostLapsLed.name}</div>
                <div className="text-[#f5a623] font-bold text-2xl">{mostLapsLed.lapsLed}</div>
              </div>
            </div>

            {/* Drop System Info */}
            {stageBonusTracker && (
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg px-6 py-4 mb-6">
                <p className="text-[#8a8a9a] text-sm">
                  <span className="text-[#f5a623] font-bold">Drop {stageBonusTracker.dropsAllowed} worst</span> of {stageBonusTracker.totalRaces} races per stage.
                  {' '}DNRs count as 0-point races and are dropped first.
                  {' '}<span className="text-white">{stageBonusTracker.racesCompleted} of {stageBonusTracker.totalRaces} races completed.</span>
                </p>
              </div>
            )}

            {/* Full Standings Table */}
            <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3e] bg-[#0a0a0f]">
                      <th className="px-4 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                        Pos
                      </th>
                      <th className="px-4 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                        Driver
                      </th>
                      <th className="px-4 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                        Team
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Points
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Dropped
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Races
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Wins
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Top 5
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Avg Fin
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Laps Led
                      </th>
                      <th className="px-4 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Inc
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayStandings.map((driver, idx) => (
                      <tr
                        key={driver.id}
                        className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition"
                      >
                        <td className="px-4 py-4">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded font-bold ${
                              idx === 0
                                ? 'bg-[#f5a623] text-black'
                                : 'bg-[#2a2a3e] text-white'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-white">{driver.name}</div>
                          <div className="text-sm text-[#8a8a9a]">#{driver.number}</div>
                        </td>
                        <td className="px-4 py-4 text-[#8a8a9a]">{driver.team}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="font-bold text-[#f5a623]">{driver.points}</div>
                          {driver.droppedPoints > 0 && (
                            <div className="text-xs text-[#8a8a9a]">
                              {driver.rawPoints} raw
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {driver.droppedPoints > 0 ? (
                            <span className="text-[#e63946] text-sm font-semibold">-{driver.droppedPoints}</span>
                          ) : (
                            <span className="text-[#8a8a9a]">—</span>
                          )}
                          {driver.dnrCount > 0 && (
                            <div className="text-xs text-[#8a8a9a]">{driver.dnrCount} DNR</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-[#8a8a9a] font-semibold">
                          {driver.racesEntered}
                        </td>
                        <td className="px-4 py-4 text-right text-white font-semibold">
                          {driver.wins}
                        </td>
                        <td className="px-4 py-4 text-right text-[#2ec4b6] font-semibold">
                          {driver.top5}
                        </td>
                        <td className="px-4 py-4 text-right text-white font-semibold">
                          {(driver.avgFinish || 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-4 text-right text-[#f5a623] font-semibold">
                          {driver.lapsLed}
                        </td>
                        <td className="px-4 py-4 text-right text-[#e63946] font-semibold">
                          {driver.totalIncidents}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stage Bonus Tracker */}
            {selectedStage !== 'overall' && stageBonusTracker && (
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden mb-12">
                <div className="px-6 py-6 border-b border-[#2a2a3e]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Stage Champion Bonus Tracker</h3>
                    <span className="text-[#8a8a9a] text-sm">
                      {stageBonusTracker.racesCompleted} of {stageBonusTracker.totalRaces} races completed
                    </span>
                  </div>
                  <p className="text-[#8a8a9a] text-sm mt-1">
                    +3 points each, awarded after all 12 stage races
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#2a2a3e]">
                  {/* Most Laps Led */}
                  <div className="px-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy size={16} className="text-[#f5a623]" />
                      <span className="text-[#8a8a9a] text-xs uppercase font-bold">Most Laps Led</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{stageBonusTracker.mostLapsLed.name}</div>
                      <div className="text-[#f5a623] text-sm font-bold mt-1">
                        {stageBonusTracker.mostLapsLed.value} laps
                      </div>
                    </div>
                  </div>

                  {/* Lowest Incidents */}
                  <div className="px-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={16} className="text-[#2ec4b6]" />
                      <span className="text-[#8a8a9a] text-xs uppercase font-bold">Lowest Total Incidents</span>
                    </div>
                    {stageBonusTracker.lowestIncidents.qualified ? (
                      <div>
                        <div className="text-white font-bold text-lg">{stageBonusTracker.lowestIncidents.name}</div>
                        <div className="text-[#2ec4b6] text-sm font-bold mt-1">
                          {stageBonusTracker.lowestIncidents.value} incidents
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[#8a8a9a] font-bold text-lg">No one qualifies yet</div>
                        <div className="text-[#8a8a9a] text-xs mt-1">
                          Requires {stageBonusTracker.lowestIncidents.minRaces}+ races entered
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Most Fastest Laps */}
                  <div className="px-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={16} className="text-[#e63946]" />
                      <span className="text-[#8a8a9a] text-xs uppercase font-bold">Most Fastest Laps</span>
                    </div>
                    {stageBonusTracker.mostFastestLaps.isTied ? (
                      <div>
                        <div className="text-white font-bold text-lg">
                          {stageBonusTracker.mostFastestLaps.leaders.length}-way tie
                        </div>
                        <div className="text-[#8a8a9a] text-xs mt-1">
                          {stageBonusTracker.mostFastestLaps.leaders.join(', ')} ({stageBonusTracker.mostFastestLaps.value} each)
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-white font-bold text-lg">
                          {stageBonusTracker.mostFastestLaps.leaders[0]}
                        </div>
                        <div className="text-[#e63946] text-sm font-bold mt-1">
                          {stageBonusTracker.mostFastestLaps.value} awards
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Points Breakdown Section */}
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(!expandedSection)}
            className="w-full px-6 py-6 flex items-center justify-between hover:bg-[#1a1a2e] transition"
          >
            <h3 className="text-xl font-bold text-white">Points Breakdown</h3>
            <ChevronDown
              size={24}
              className={`text-[#f5a623] transition ${expandedSection ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSection && (
            <div className="border-t border-[#2a2a3e] px-6 py-6 bg-[#0a0a0f]">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-bold mb-3">Position Points</h4>
                  <div className="bg-[#14141f] rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">1st Place</span>
                      <span className="text-white font-bold">40 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">2nd Place</span>
                      <span className="text-white font-bold">35 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">3rd Place</span>
                      <span className="text-white font-bold">34 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">4th-5th Place</span>
                      <span className="text-white font-bold">33-32 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">6th-10th Place</span>
                      <span className="text-white font-bold">31-27 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">40th Place</span>
                      <span className="text-white font-bold">1 point</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">Bonus Points (+2 each, among league drivers)</h4>
                  <div className="bg-[#14141f] rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Pole Bonus (P1 start)</span>
                      <span className="text-[#2ec4b6] font-bold">+2 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Fastest Lap</span>
                      <span className="text-[#2ec4b6] font-bold">+2 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Most Laps Led</span>
                      <span className="text-[#2ec4b6] font-bold">+2 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Lowest Incidents (tie = 1 pt each)</span>
                      <span className="text-[#2ec4b6] font-bold">+2 points</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">Incident Penalties</h4>
                  <div className="bg-[#14141f] rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">20–29 incidents</span>
                      <span className="text-[#e63946] font-bold">-1 point</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">30–39 incidents</span>
                      <span className="text-[#e63946] font-bold">-2 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">40+ incidents</span>
                      <span className="text-[#e63946] font-bold">-3 points</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">Scoring Note</h4>
                  <div className="bg-[#14141f] rounded p-4 text-[#8a8a9a]">
                    <p>
                      Points are awarded based on actual overall finishing position among all drivers
                      (including AI). A driver finishing P15 overall earns 22 points, not 1st-place
                      league points.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">Stage Rules</h4>
                  <div className="bg-[#14141f] rounded p-4 text-[#8a8a9a]">
                    <p>
                      36-race season split into 3 stages of 12 races. Drop your worst 3 races per
                      stage. Team scoring counts the best 9 finishes per stage.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">Stage Champion Bonuses (+3 each)</h4>
                  <div className="bg-[#14141f] rounded p-4 space-y-2">
                    <div className="text-[#8a8a9a] text-sm mb-3">
                      Awarded after all 12 stage races to determine the stage champion:
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Most total laps led across the stage</span>
                      <span className="text-[#f5a623] font-bold">+3 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Lowest total incident points across the stage</span>
                      <span className="text-[#f5a623] font-bold">+3 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Most fastest lap awards across the stage</span>
                      <span className="text-[#f5a623] font-bold">+3 points</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
