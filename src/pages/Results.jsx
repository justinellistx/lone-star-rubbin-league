import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRaceResults } from '../hooks/useSupabase';

const DEMO_RACES = {
  stage1: [
    {
      id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', series: 'NASCAR Trucks',
      totalLaps: 73, totalDrivers: 30, fastestLap: { driver: 'Blaine Karnes', time: '48.569' },
      results: [
        { id: 'blaine', finishPosition: 15, startPosition: 24, name: 'Blaine Karnes', number: 25, lapsLed: 0, incidents: 8, bestLap: '48.569', posPoints: 22, bonuses: [{ label: 'Fastest Lap', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: 0 },
        { id: 'ryan', finishPosition: 18, startPosition: 25, name: 'Ryan Ramsey', number: 10, lapsLed: 0, incidents: 8, bestLap: '48.804', posPoints: 19, bonuses: [], penalty: 0 },
        { id: 'justin', finishPosition: 19, startPosition: 27, name: 'Justin Ellis4', number: 5, lapsLed: 0, incidents: 8, bestLap: '48.669', posPoints: 18, bonuses: [], penalty: 0 },
        { id: 'nik', finishPosition: 24, startPosition: 29, name: 'Nik Green2', number: 88, lapsLed: 0, incidents: 20, bestLap: '48.877', posPoints: 13, bonuses: [], penalty: 0 },
        { id: 'terry', finishPosition: 26, startPosition: 26, name: 'Terry Domino', number: 11, lapsLed: 0, incidents: 6, bestLap: '48.668', posPoints: 11, bonuses: [{ label: 'Low Inc', pts: 2 }], penalty: 0 },
        { id: 'jordan', finishPosition: 27, startPosition: 30, name: 'Jordan Stancil', number: 15, lapsLed: 0, incidents: 8, bestLap: '48.979', posPoints: 10, bonuses: [], penalty: 0 },
        { id: 'nate', finishPosition: 30, startPosition: 28, name: 'Nathan Becker', number: 21, lapsLed: 0, incidents: 16, bestLap: '48.712', posPoints: 7, bonuses: [], penalty: 0 },
      ],
    },
    {
      id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', series: 'NASCAR Trucks',
      totalLaps: 122, totalDrivers: 30, fastestLap: { driver: 'Ryan Ramsey', time: '30.979' },
      results: [
        { id: 'jordan', finishPosition: 1, startPosition: 20, name: 'Jordan Stancil', number: 15, lapsLed: 1, incidents: 42, bestLap: '31.350', posPoints: 40, bonuses: [], penalty: -3 },
        { id: 'terry', finishPosition: 2, startPosition: 8, name: 'Terry Domino', number: 11, lapsLed: 0, incidents: 33, bestLap: '31.465', posPoints: 35, bonuses: [], penalty: -2 },
        { id: 'nate', finishPosition: 13, startPosition: 14, name: 'Nathan Becker', number: 21, lapsLed: 23, incidents: 34, bestLap: '31.319', posPoints: 24, bonuses: [], penalty: -2 },
        { id: 'blaine', finishPosition: 17, startPosition: 17, name: 'Blaine Karnes', number: 25, lapsLed: 0, incidents: 30, bestLap: '31.333', posPoints: 20, bonuses: [], penalty: -1 },
        { id: 'nik', finishPosition: 18, startPosition: 7, name: 'Nik Green2', number: 88, lapsLed: 25, incidents: 22, bestLap: '31.377', posPoints: 19, bonuses: [], penalty: -1 },
        { id: 'justin', finishPosition: 20, startPosition: 9, name: 'Justin Ellis4', number: 5, lapsLed: 48, incidents: 18, bestLap: '31.456', posPoints: 17, bonuses: [{ label: 'Low Inc', pts: 2 }, { label: 'Most Led', pts: 2 }], penalty: 0 },
        { id: 'ryan', finishPosition: 30, startPosition: 3, name: 'Ryan Ramsey', number: 10, lapsLed: 3, incidents: 24, bestLap: '30.979', posPoints: 7, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: -1 },
      ],
    },
    {
      id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', series: 'Hosted All Cars',
      totalLaps: 35, totalDrivers: 28, fastestLap: { driver: 'Nathan Becker', time: '1:44.738' },
      results: [
        { id: 'nate', finishPosition: 1, startPosition: 1, name: 'Nathan Becker', number: 21, lapsLed: 34, incidents: 17, bestLap: '1:44.738', posPoints: 40, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Most Led', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: 0 },
        { id: 'justin', finishPosition: 22, startPosition: 27, name: 'Justin Ellis4', number: 5, lapsLed: 0, incidents: 17, bestLap: '1:47.880', posPoints: 15, bonuses: [], penalty: 0 },
        { id: 'ryan', finishPosition: 23, startPosition: 25, name: 'Ryan Ramsey', number: 10, lapsLed: 0, incidents: 8, bestLap: '1:48.606', posPoints: 14, bonuses: [{ label: 'Low Inc', pts: 2 }], penalty: 0 },
        { id: 'nik', finishPosition: 24, startPosition: 6, name: 'Nik Green2', number: 88, lapsLed: 0, incidents: 25, bestLap: '1:48.369', posPoints: 13, bonuses: [], penalty: -1 },
        { id: 'blaine', finishPosition: 25, startPosition: 24, name: 'Blaine Karnes', number: 25, lapsLed: 0, incidents: 43, bestLap: '1:47.904', posPoints: 12, bonuses: [], penalty: -3 },
        { id: 'jordan', finishPosition: 26, startPosition: 26, name: 'Jordan Stancil', number: 15, lapsLed: 0, incidents: 46, bestLap: '1:51.735', posPoints: 11, bonuses: [], penalty: -3 },
        { id: 'terry', finishPosition: 27, startPosition: 28, name: 'Terry Domino', number: 11, lapsLed: 0, incidents: 45, bestLap: '1:51.952', posPoints: 10, bonuses: [], penalty: -3 },
      ],
    },
    {
      id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', series: 'Hosted All Cars',
      totalLaps: 150, totalDrivers: 29, fastestLap: { driver: 'Nathan Becker', time: '28.404' },
      results: [
        { id: 'nate', finishPosition: 1, startPosition: 1, name: 'Nathan Becker', number: 21, lapsLed: 1, incidents: 12, bestLap: '28.404', posPoints: 40, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: 0 },
        { id: 'nik', finishPosition: 2, startPosition: 2, name: 'Nik Green2', number: 88, lapsLed: 144, incidents: 12, bestLap: '28.444', posPoints: 35, bonuses: [{ label: 'Most Led', pts: 2 }], penalty: 0 },
        { id: 'jordan', finishPosition: 3, startPosition: 5, name: 'Jordan Stancil', number: 15, lapsLed: 0, incidents: 4, bestLap: '28.474', posPoints: 34, bonuses: [], penalty: 0 },
        { id: 'justin', finishPosition: 4, startPosition: 4, name: 'Justin Ellis4', number: 5, lapsLed: 5, incidents: 0, bestLap: '28.554', posPoints: 33, bonuses: [{ label: 'Low Inc', pts: 2 }], penalty: 0 },
        { id: 'blaine', finishPosition: 5, startPosition: 6, name: 'Blaine Karnes', number: 25, lapsLed: 0, incidents: 4, bestLap: '28.665', posPoints: 32, bonuses: [], penalty: 0 },
        { id: 'ryan', finishPosition: 23, startPosition: 3, name: 'Ryan Ramsey', number: 10, lapsLed: 0, incidents: 12, bestLap: '28.628', posPoints: 14, bonuses: [], penalty: 0 },
        { id: 'sam', finishPosition: 24, startPosition: 9, name: 'Sam Kunnemann', number: 64, lapsLed: 0, incidents: 20, bestLap: '29.407', posPoints: 13, bonuses: [], penalty: 0 },
        { id: 'terry', finishPosition: 25, startPosition: 8, name: 'Terry Domino', number: 11, lapsLed: 0, incidents: 10, bestLap: '29.016', posPoints: 12, bonuses: [], penalty: 0 },
      ],
    },
    {
      id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', series: 'Hosted All Cars',
      totalLaps: 120, totalDrivers: 29, fastestLap: { driver: 'Ryan Ramsey', time: '31.776' },
      results: [
        { id: 'nik', finishPosition: 1, startPosition: 1, name: 'Nik Green2', number: 88, lapsLed: 25, incidents: 6, bestLap: '31.785', posPoints: 40, bonuses: [{ label: 'Pole', pts: 2 }], penalty: 0 },
        { id: 'blaine', finishPosition: 2, startPosition: 10, name: 'Blaine Karnes', number: 25, lapsLed: 0, incidents: 4, bestLap: '31.786', posPoints: 35, bonuses: [], penalty: 0 },
        { id: 'justin', finishPosition: 3, startPosition: 5, name: 'Justin Ellis4', number: 5, lapsLed: 63, incidents: 0, bestLap: '31.901', posPoints: 34, bonuses: [{ label: 'Low Inc (tie)', pts: 1 }, { label: 'Most Led', pts: 2 }], penalty: 0 },
        { id: 'jordan', finishPosition: 4, startPosition: 6, name: 'Jordan Stancil', number: 15, lapsLed: 0, incidents: 0, bestLap: '31.796', posPoints: 33, bonuses: [{ label: 'Low Inc (tie)', pts: 1 }], penalty: 0 },
        { id: 'nate', finishPosition: 19, startPosition: 4, name: 'Nathan Becker', number: 21, lapsLed: 0, incidents: 11, bestLap: '32.360', posPoints: 18, bonuses: [], penalty: 0 },
        { id: 'sam', finishPosition: 22, startPosition: 7, name: 'Sam Kunnemann', number: 64, lapsLed: 0, incidents: 10, bestLap: '32.666', posPoints: 15, bonuses: [], penalty: 0 },
        { id: 'terry', finishPosition: 24, startPosition: 3, name: 'Terry Domino', number: 11, lapsLed: 0, incidents: 6, bestLap: '31.960', posPoints: 13, bonuses: [], penalty: 0 },
        { id: 'ryan', finishPosition: 25, startPosition: 2, name: 'Ryan Ramsey', number: 10, lapsLed: 24, incidents: 4, bestLap: '31.776', posPoints: 12, bonuses: [{ label: 'Fast Lap', pts: 2 }], penalty: 0 },
      ],
    },
    {
      id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', series: 'Hosted All Cars',
      totalLaps: 120, totalDrivers: 28, fastestLap: { driver: 'Nik Green2', time: '31.312' },
      results: [
        { id: 'nik', finishPosition: 1, startPosition: 2, name: 'Nik Green2', number: 88, lapsLed: 31, incidents: 10, bestLap: '31.312', posPoints: 40, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Low Inc', pts: 2 }], penalty: 0 },
        { id: 'justin', finishPosition: 2, startPosition: 4, name: 'Justin Ellis4', number: 5, lapsLed: 0, incidents: 30, bestLap: '31.488', posPoints: 35, bonuses: [], penalty: -1 },
        { id: 'blaine', finishPosition: 3, startPosition: 10, name: 'Blaine Karnes', number: 25, lapsLed: 0, incidents: 20, bestLap: '31.642', posPoints: 34, bonuses: [], penalty: 0 },
        { id: 'nate', finishPosition: 13, startPosition: 1, name: 'Nathan Becker', number: 21, lapsLed: 47, incidents: 40, bestLap: '31.369', posPoints: 24, bonuses: [{ label: 'Most Led', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: -2 },
        { id: 'jordan', finishPosition: 16, startPosition: 28, name: 'Jordan Stancil', number: 15, lapsLed: 0, incidents: 38, bestLap: '32.039', posPoints: 21, bonuses: [], penalty: -2 },
        { id: 'ryan', finishPosition: 18, startPosition: 3, name: 'Ryan Ramsey', number: 10, lapsLed: 26, incidents: 12, bestLap: '31.424', posPoints: 19, bonuses: [], penalty: 0 },
        { id: 'sam', finishPosition: 25, startPosition: 14, name: 'Sam Kunnemann', number: 64, lapsLed: 0, incidents: 42, bestLap: '32.562', posPoints: 12, bonuses: [], penalty: -3 },
      ],
    },
    {
      id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', series: 'Hosted All Cars',
      totalLaps: 150, totalDrivers: 28, fastestLap: { driver: 'Nik Green2', time: '20.879' },
      results: [
        { id: 'nate', finishPosition: 1, startPosition: 3, name: 'Nathan Becker', number: 21, lapsLed: 63, incidents: 10, bestLap: '20.901', posPoints: 40, bonuses: [], penalty: 0 },
        { id: 'ryan', finishPosition: 2, startPosition: 7, name: 'Ryan Ramsey', number: 10, lapsLed: 1, incidents: 4, bestLap: '21.089', posPoints: 35, bonuses: [{ label: 'Low Inc (tie)', pts: 1 }], penalty: 0 },
        { id: 'nik', finishPosition: 3, startPosition: 2, name: 'Nik Green2', number: 88, lapsLed: 76, incidents: 4, bestLap: '20.879', posPoints: 34, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Low Inc (tie)', pts: 1 }, { label: 'Most Led', pts: 2 }], penalty: 0 },
        { id: 'justin', finishPosition: 4, startPosition: 4, name: 'Justin Ellis4', number: 5, lapsLed: 2, incidents: 10, bestLap: '21.068', posPoints: 33, bonuses: [], penalty: 0 },
        { id: 'blaine', finishPosition: 5, startPosition: 5, name: 'Blaine Karnes', number: 25, lapsLed: 0, incidents: 18, bestLap: '20.983', posPoints: 32, bonuses: [], penalty: 0 },
        { id: 'terry', finishPosition: 12, startPosition: 6, name: 'Terry Domino', number: 11, lapsLed: 0, incidents: 32, bestLap: '21.512', posPoints: 25, bonuses: [], penalty: -2 },
        { id: 'sam', finishPosition: 24, startPosition: 8, name: 'Sam Kunnemann', number: 64, lapsLed: 0, incidents: 52, bestLap: '21.647', posPoints: 13, bonuses: [], penalty: -3 },
        { id: 'ronald', finishPosition: 26, startPosition: 1, name: 'Ronald Ramsey', number: 77, lapsLed: 0, incidents: 46, bestLap: '20.976', posPoints: 11, bonuses: [{ label: 'Pole', pts: 2 }], penalty: -3 },
      ],
    },
  ],
};

export default function Results() {
  const [selectedStage, setSelectedStage] = useState('stage1');
  const [expandedRaceId, setExpandedRaceId] = useState('race-1');

  const races = DEMO_RACES.stage1 || [];

  const toggleExpanded = (raceId) => {
    setExpandedRaceId(expandedRaceId === raceId ? null : raceId);
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">RACE RESULTS</h1>
          <p className="text-[#8a8a9a] text-lg">2026 Season Results</p>
        </div>

        {/* Stage Selector */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
          {['stage1', 'stage2', 'stage3'].map((stage) => (
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
                  : 'Stage 3: Cup'}
            </button>
          ))}
        </div>

        {/* Races List */}
        <div className="space-y-6">
          {races.length > 0 ? (
            races.map((race) => (
              <div
                key={race.id}
                className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden"
              >
                {/* Race Header */}
                <button
                  onClick={() => toggleExpanded(race.id)}
                  className="w-full px-6 py-6 flex items-center justify-between hover:bg-[#1a1a2e] transition"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-[#f5a623] font-bold text-sm">Race #{race.raceNumber}</span>
                      <h3 className="text-2xl font-bold text-white">{race.track}</h3>
                    </div>
                    <div className="text-[#8a8a9a]">
                      {new Date(race.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      • {race.series}
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-[#f5a623] transition ${expandedRaceId === race.id ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Race Details - Expanded */}
                {expandedRaceId === race.id && (
                  <div className="border-t border-[#2a2a3e] bg-[#0a0a0f]">
                    {/* Race Stats */}
                    <div className="px-6 py-6 border-b border-[#2a2a3e]">
                      <h4 className="text-white font-bold mb-4">Race Stats</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <div className="text-[#8a8a9a] text-sm uppercase mb-2">Total Laps</div>
                          <div className="text-2xl font-bold text-white">{race.totalLaps}</div>
                        </div>
                        <div>
                          <div className="text-[#8a8a9a] text-sm uppercase mb-2">Total Drivers</div>
                          <div className="text-2xl font-bold text-white">{race.totalDrivers || '—'}</div>
                        </div>
                        <div>
                          <div className="text-[#8a8a9a] text-sm uppercase mb-2">Series</div>
                          <div className="text-2xl font-bold text-[#f5a623]">{race.series}</div>
                        </div>
                        {race.fastestLap && (
                          <div>
                            <div className="text-[#8a8a9a] text-sm uppercase mb-2">Fastest Lap (League)</div>
                            <div className="text-2xl font-bold text-[#2ec4b6]">{race.fastestLap.time}s</div>
                            <div className="text-sm text-[#8a8a9a]">{race.fastestLap.driver}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Race Results Table */}
                    <div className="px-6 py-6">
                      <h4 className="text-white font-bold mb-4">Final Results</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#2a2a3e]">
                              <th className="px-4 py-3 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                                Fin
                              </th>
                              <th className="px-4 py-3 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                                Start
                              </th>
                              <th className="px-4 py-3 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                                Driver
                              </th>
                              <th className="px-4 py-3 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                                Laps Led
                              </th>
                              <th className="px-4 py-3 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                                Incidents
                              </th>
                              <th className="px-4 py-3 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                                Best Lap
                              </th>
                              <th className="px-4 py-3 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                                Points
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {race.results.map((result) => {
                              const bonusTotal = (result.bonuses || []).reduce((s, b) => s + b.pts, 0);
                              const totalPts = (result.posPoints || 0) + bonusTotal + (result.penalty || 0);
                              return (
                              <tr
                                key={result.id}
                                className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition"
                              >
                                <td className="px-4 py-3">
                                  <div
                                    className={`flex items-center justify-center w-8 h-8 rounded font-bold ${
                                      result.finishPosition === 1
                                        ? 'bg-[#f5a623] text-black'
                                        : 'bg-[#2a2a3e] text-white'
                                    }`}
                                  >
                                    {result.finishPosition}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-white font-semibold">
                                  {result.startPosition}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-white">{result.name}</div>
                                  <div className="text-sm text-[#8a8a9a]">#{result.number}</div>
                                </td>
                                <td className="px-4 py-3 text-right text-[#2ec4b6] font-semibold">
                                  {result.lapsLed}
                                </td>
                                <td className="px-4 py-3 text-right text-[#e63946] font-semibold">
                                  {result.incidents}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold">
                                  {result.bestLap ? (
                                    <span className={result.bestLap === race.fastestLap?.time ? 'text-[#2ec4b6]' : 'text-white'}>
                                      {result.bestLap}s
                                      {result.bestLap === race.fastestLap?.time && ' ⚡'}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="text-[#f5a623] font-bold">{totalPts}</div>
                                  <div className="text-xs text-[#8a8a9a]">
                                    {result.posPoints}p
                                    {bonusTotal > 0 && (
                                      <span className="text-[#2ec4b6]"> +{bonusTotal}</span>
                                    )}
                                    {result.penalty < 0 && (
                                      <span className="text-[#e63946]"> {result.penalty}</span>
                                    )}
                                  </div>
                                  {(result.bonuses || []).length > 0 && (
                                    <div className="text-xs mt-1">
                                      {result.bonuses.map((b, i) => (
                                        <span key={i} className="inline-block bg-[#2ec4b6]/20 text-[#2ec4b6] rounded px-1 mr-1 mb-0.5">
                                          {b.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {result.penalty < 0 && (
                                    <div className="text-xs mt-1">
                                      <span className="inline-block bg-[#e63946]/20 text-[#e63946] rounded px-1">
                                        {result.incidents > 40 ? '40+ inc' : result.incidents > 30 ? '30+ inc' : '20+ inc'}
                                      </span>
                                    </div>
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
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8 text-center">
              <p className="text-[#8a8a9a]">No race results available for this stage yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
