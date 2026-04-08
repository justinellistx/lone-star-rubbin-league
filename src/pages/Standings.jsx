import React, { useState } from 'react';
import { ChevronDown, Trophy, Zap, Shield } from 'lucide-react';
import { useStandings } from '../hooks/useSupabase';

const DEMO_STANDINGS = {
  stage1: [
    { id: 'nik', position: 1, name: 'Nik Green2', number: 88, team: 'Nik+Jordan', points: 205, posPoints: 194, bonusPoints: 13, penaltyPoints: -2, wins: 2, top5: 4, top10: 4, lapsLed: 301, avgFinish: 10.4 },
    { id: 'nate', position: 2, name: 'Nathan Becker', number: 21, team: 'Justin+Nate', points: 203, posPoints: 193, bonusPoints: 14, penaltyPoints: -4, wins: 3, top5: 3, top10: 3, lapsLed: 168, avgFinish: 11.1 },
    { id: 'justin', position: 3, name: 'Justin Ellis4', number: 5, team: 'Justin+Nate', points: 193, posPoints: 185, bonusPoints: 9, penaltyPoints: -1, wins: 0, top5: 4, top10: 4, lapsLed: 118, avgFinish: 10.6 },
    { id: 'blaine', position: 4, name: 'Blaine Karnes', number: 25, team: 'Blaine+Terry', points: 187, posPoints: 187, bonusPoints: 4, penaltyPoints: -4, wins: 0, top5: 4, top10: 4, lapsLed: 0, avgFinish: 10.3 },
    { id: 'jordan', position: 5, name: 'Jordan Stancil', number: 15, team: 'Nik+Jordan', points: 142, posPoints: 149, bonusPoints: 1, penaltyPoints: -8, wins: 1, top5: 3, top10: 3, lapsLed: 1, avgFinish: 12.8 },
    { id: 'ryan', position: 6, name: 'Ryan Ramsey', number: 10, team: 'Ryan+Sam+Ronald', points: 128, posPoints: 120, bonusPoints: 9, penaltyPoints: -1, wins: 0, top5: 1, top10: 1, lapsLed: 54, avgFinish: 19.9 },
    { id: 'terry', position: 7, name: 'Terry Domino', number: 11, team: 'Blaine+Terry', points: 101, posPoints: 106, bonusPoints: 2, penaltyPoints: -7, wins: 0, top5: 1, top10: 1, lapsLed: 0, avgFinish: 19.3 },
    { id: 'sam', position: 8, name: 'Sam Kunnemann', number: 64, team: 'Ryan+Sam+Ronald', points: 47, posPoints: 53, bonusPoints: 0, penaltyPoints: -6, wins: 0, top5: 0, top10: 0, lapsLed: 0, avgFinish: 23.8 },
    { id: 'ronald', position: 9, name: 'Ronald Ramsey', number: 77, team: 'Ryan+Sam+Ronald', points: 10, posPoints: 11, bonusPoints: 2, penaltyPoints: -3, wins: 0, top5: 0, top10: 0, lapsLed: 0, avgFinish: 26.0 },
  ],
};

// Stage bonus tracker - current leaders for end-of-stage +3 bonuses (through 7 of 12 races)
const STAGE_BONUS_TRACKER = {
  stage1: {
    racesCompleted: 7,
    totalRaces: 12,
    bonuses: [
      { category: 'Most Laps Led', leader: 'Nik Green2', value: 301, unit: 'laps', icon: 'trophy' },
      { category: 'Lowest Total Incidents', leader: 'Ryan Ramsey', value: 72, unit: 'incidents', icon: 'shield' },
      { category: 'Most Fastest Laps', leader: '3-way tie', value: 2, unit: 'awards', icon: 'zap', tied: ['Nathan Becker', 'Ryan Ramsey', 'Nik Green2'] },
    ],
  },
};

export default function Standings() {
  const [selectedStage, setSelectedStage] = useState('stage1');
  const [expandedSection, setExpandedSection] = useState(false);
  const { data: standings, loading } = useStandings(null);

  const displayStandings =
    standings && standings.length > 0 && standings[0].points !== undefined
      ? standings
      : DEMO_STANDINGS.stage1;
  const leader = displayStandings[0];
  const mostWins = displayStandings.reduce((max, driver) =>
    driver.wins > (max.wins || 0) ? driver : max
  );
  const bestAvgFinish = displayStandings.reduce((min, driver) =>
    driver.avgFinish < (min.avgFinish || Infinity) ? driver : min
  );
  const mostLapsLed = displayStandings.reduce((max, driver) =>
    driver.lapsLed > (max.lapsLed || 0) ? driver : max
  );

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

        {/* Stats Summary Cards */}
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

        {/* Full Standings Table */}
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3e] bg-[#0a0a0f]">
                  <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                    Pos
                  </th>
                  <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                    Team
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Points
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Pos Pts
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Bonus
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Penalty
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Top 5
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Top 10
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Avg Fin
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayStandings.map((driver, idx) => (
                  <tr
                    key={driver.id}
                    className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition"
                  >
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{driver.name}</div>
                      <div className="text-sm text-[#8a8a9a]">#{driver.number}</div>
                    </td>
                    <td className="px-6 py-4 text-[#8a8a9a]">{driver.team}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-[#f5a623]">{driver.points}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-[#8a8a9a] font-semibold">
                      {driver.posPoints || '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-[#2ec4b6] font-semibold">
                      {driver.bonusPoints ? `+${driver.bonusPoints}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-[#e63946] font-semibold">
                      {driver.penaltyPoints ? driver.penaltyPoints : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {driver.wins}
                    </td>
                    <td className="px-6 py-4 text-right text-[#2ec4b6] font-semibold">
                      {driver.top5}
                    </td>
                    <td className="px-6 py-4 text-right text-[#e63946] font-semibold">
                      {driver.top10}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {(driver.avgFinish || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stage Bonus Tracker */}
        {selectedStage !== 'overall' && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden mb-12">
            <div className="px-6 py-6 border-b border-[#2a2a3e]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Stage Champion Bonus Tracker</h3>
                <span className="text-[#8a8a9a] text-sm">
                  {STAGE_BONUS_TRACKER.stage1.racesCompleted} of {STAGE_BONUS_TRACKER.stage1.totalRaces} races completed
                </span>
              </div>
              <p className="text-[#8a8a9a] text-sm mt-1">
                +3 points each, awarded after all 12 stage races
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#2a2a3e]">
              {STAGE_BONUS_TRACKER.stage1.bonuses.map((bonus) => (
                <div key={bonus.category} className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    {bonus.icon === 'trophy' && <Trophy size={16} className="text-[#f5a623]" />}
                    {bonus.icon === 'shield' && <Shield size={16} className="text-[#2ec4b6]" />}
                    {bonus.icon === 'zap' && <Zap size={16} className="text-[#e63946]" />}
                    <span className="text-[#8a8a9a] text-xs uppercase font-bold">{bonus.category}</span>
                  </div>
                  {bonus.tied ? (
                    <div>
                      <div className="text-white font-bold text-lg">3-way tie</div>
                      <div className="text-[#8a8a9a] text-xs mt-1">
                        {bonus.tied.join(', ')} ({bonus.value} each)
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-white font-bold text-lg">{bonus.leader}</div>
                      <div className="text-[#f5a623] text-sm font-bold mt-1">
                        {bonus.value} {bonus.unit}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
                      <span className="text-[#8a8a9a]">Pole Position (best start)</span>
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
                      <span className="text-[#8a8a9a]">Over 20 incidents</span>
                      <span className="text-[#e63946] font-bold">-1 point</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Over 30 incidents</span>
                      <span className="text-[#e63946] font-bold">-2 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8a8a9a]">Over 40 incidents</span>
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
