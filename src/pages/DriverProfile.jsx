import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useDriver } from '../hooks/useSupabase';

const DEMO_DRIVER_DATA = {
  justin: {
    id: 'justin',
    name: 'Justin Ellis4',
    number: 5,
    nickname: 'J-Easy',
    team: 'Justin+Nate',
    points: 193,
    posPoints: 185,
    bonusPoints: 9,
    penaltyPoints: -1,
    wins: 0,
    top5: 4,
    top10: 4,
    avgFinish: 10.57,
    avgStart: 11.43,
    lapsLed: 118,
    totalIncidents: 83,
    raceResults: [
      { id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', finishPosition: 19, startPosition: 27, lapsLed: 0, incidents: 8, posPoints: 18, bonuses: [], penalty: 0 },
      { id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', finishPosition: 20, startPosition: 9, lapsLed: 48, incidents: 18, posPoints: 17, bonuses: [{ label: 'Low Inc', pts: 2 }, { label: 'Most Led', pts: 2 }], penalty: 0 },
      { id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', finishPosition: 22, startPosition: 27, lapsLed: 0, incidents: 17, posPoints: 15, bonuses: [], penalty: 0 },
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 4, startPosition: 4, lapsLed: 5, incidents: 0, posPoints: 33, bonuses: [{ label: 'Low Inc', pts: 2 }], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 3, startPosition: 5, lapsLed: 63, incidents: 0, posPoints: 34, bonuses: [{ label: 'Low Inc (tie)', pts: 1 }, { label: 'Most Led', pts: 2 }], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: 2, startPosition: 4, lapsLed: 0, incidents: 30, posPoints: 35, bonuses: [], penalty: -1 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 4, startPosition: 4, lapsLed: 2, incidents: 10, posPoints: 33, bonuses: [], penalty: 0 },
    ],
  },
  nate: {
    id: 'nate',
    name: 'Nathan Becker',
    number: 21,
    nickname: 'Becker Wrecker',
    team: 'Justin+Nate',
    points: 203,
    posPoints: 193,
    bonusPoints: 14,
    penaltyPoints: -4,
    wins: 3,
    top5: 3,
    top10: 3,
    avgFinish: 11.14,
    avgStart: 7.43,
    lapsLed: 168,
    totalIncidents: 140,
    raceResults: [
      { id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', finishPosition: 30, startPosition: 28, lapsLed: 0, incidents: 16, posPoints: 7, bonuses: [], penalty: 0 },
      { id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', finishPosition: 13, startPosition: 14, lapsLed: 23, incidents: 34, posPoints: 24, bonuses: [], penalty: -2 },
      { id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', finishPosition: 1, startPosition: 1, lapsLed: 34, incidents: 17, posPoints: 40, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Most Led', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: 0 },
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 1, startPosition: 1, lapsLed: 1, incidents: 12, posPoints: 40, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 19, startPosition: 4, lapsLed: 0, incidents: 11, posPoints: 18, bonuses: [], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: 13, startPosition: 1, lapsLed: 47, incidents: 40, posPoints: 24, bonuses: [{ label: 'Most Led', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: -2 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 1, startPosition: 3, lapsLed: 63, incidents: 10, posPoints: 40, bonuses: [], penalty: 0 },
    ],
  },
  blaine: {
    id: 'blaine',
    name: 'Blaine Karnes',
    number: 25,
    nickname: 'Tard',
    team: 'Blaine+Terry',
    points: 187,
    posPoints: 187,
    bonusPoints: 4,
    penaltyPoints: -4,
    wins: 0,
    top5: 4,
    top10: 4,
    avgFinish: 10.29,
    avgStart: 13.71,
    lapsLed: 0,
    totalIncidents: 127,
    raceResults: [
      { id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', finishPosition: 15, startPosition: 24, lapsLed: 0, incidents: 8, posPoints: 22, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: 0 },
      { id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', finishPosition: 17, startPosition: 17, lapsLed: 0, incidents: 30, posPoints: 20, bonuses: [], penalty: -1 },
      { id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', finishPosition: 25, startPosition: 24, lapsLed: 0, incidents: 43, posPoints: 12, bonuses: [], penalty: -3 },
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 5, startPosition: 6, lapsLed: 0, incidents: 4, posPoints: 32, bonuses: [], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 2, startPosition: 10, lapsLed: 0, incidents: 4, posPoints: 35, bonuses: [], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: 3, startPosition: 10, lapsLed: 0, incidents: 20, posPoints: 34, bonuses: [], penalty: 0 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 5, startPosition: 5, lapsLed: 0, incidents: 18, posPoints: 32, bonuses: [], penalty: 0 },
    ],
  },
  terry: {
    id: 'terry',
    name: 'Terry Domino',
    number: 11,
    nickname: 'Domino Slices',
    team: 'Blaine+Terry',
    points: 101,
    posPoints: 106,
    bonusPoints: 2,
    penaltyPoints: -7,
    wins: 0,
    top5: 1,
    top10: 1,
    avgFinish: 19.33,
    avgStart: 13.17,
    lapsLed: 0,
    totalIncidents: 132,
    raceResults: [
      { id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', finishPosition: 26, startPosition: 26, lapsLed: 0, incidents: 6, posPoints: 11, bonuses: [{ label: 'Low Inc', pts: 2 }], penalty: 0 },
      { id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', finishPosition: 2, startPosition: 8, lapsLed: 0, incidents: 33, posPoints: 35, bonuses: [], penalty: -2 },
      { id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', finishPosition: 27, startPosition: 28, lapsLed: 0, incidents: 45, posPoints: 10, bonuses: [], penalty: -3 },
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 25, startPosition: 8, lapsLed: 0, incidents: 10, posPoints: 12, bonuses: [], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 24, startPosition: 3, lapsLed: 0, incidents: 6, posPoints: 13, bonuses: [], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: null, startPosition: null, lapsLed: 0, incidents: 0, dnr: true, posPoints: 0, bonuses: [], penalty: 0 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 12, startPosition: 6, lapsLed: 0, incidents: 32, posPoints: 25, bonuses: [], penalty: -2 },
    ],
  },
  nik: {
    id: 'nik',
    name: 'Nik Green2',
    number: 88,
    nickname: 'Adventure Man',
    team: 'Nik+Jordan',
    points: 205,
    posPoints: 194,
    bonusPoints: 13,
    penaltyPoints: -2,
    wins: 2,
    top5: 4,
    top10: 4,
    avgFinish: 10.43,
    avgStart: 7.0,
    lapsLed: 301,
    totalIncidents: 99,
    raceResults: [
      { id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', finishPosition: 24, startPosition: 29, lapsLed: 0, incidents: 20, posPoints: 13, bonuses: [], penalty: 0 },
      { id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', finishPosition: 18, startPosition: 7, lapsLed: 25, incidents: 22, posPoints: 19, bonuses: [], penalty: -1 },
      { id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', finishPosition: 24, startPosition: 6, lapsLed: 0, incidents: 25, posPoints: 13, bonuses: [], penalty: -1 },
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 2, startPosition: 2, lapsLed: 144, incidents: 12, posPoints: 35, bonuses: [{ label: 'Most Led', pts: 2 }], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 1, startPosition: 1, lapsLed: 25, incidents: 6, posPoints: 40, bonuses: [{ label: 'Pole', pts: 2 }], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: 1, startPosition: 2, lapsLed: 31, incidents: 10, posPoints: 40, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Low Inc', pts: 2 }], penalty: 0 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 3, startPosition: 2, lapsLed: 76, incidents: 4, posPoints: 34, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Low Inc (tie)', pts: 1 }, { label: 'Most Led', pts: 2 }], penalty: 0 },
    ],
  },
  jordan: {
    id: 'jordan',
    name: 'Jordan Stancil',
    number: 15,
    nickname: 'J-Dawg',
    team: 'Nik+Jordan',
    points: 142,
    posPoints: 149,
    bonusPoints: 1,
    penaltyPoints: -8,
    wins: 1,
    top5: 3,
    top10: 3,
    avgFinish: 12.83,
    avgStart: 19.17,
    lapsLed: 1,
    totalIncidents: 138,
    raceResults: [
      { id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', finishPosition: 27, startPosition: 30, lapsLed: 0, incidents: 8, posPoints: 10, bonuses: [], penalty: 0 },
      { id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', finishPosition: 1, startPosition: 20, lapsLed: 1, incidents: 42, posPoints: 40, bonuses: [], penalty: -3 },
      { id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', finishPosition: 26, startPosition: 26, lapsLed: 0, incidents: 46, posPoints: 11, bonuses: [], penalty: -3 },
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 3, startPosition: 5, lapsLed: 0, incidents: 4, posPoints: 34, bonuses: [], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 4, startPosition: 6, lapsLed: 0, incidents: 0, posPoints: 33, bonuses: [{ label: 'Low Inc (tie)', pts: 1 }], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: 16, startPosition: 28, lapsLed: 0, incidents: 38, posPoints: 21, bonuses: [], penalty: -2 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: null, startPosition: null, lapsLed: 0, incidents: 0, dnr: true, posPoints: 0, bonuses: [], penalty: 0 },
    ],
  },
  ryan: {
    id: 'ryan',
    name: 'Ryan Ramsey',
    number: 10,
    nickname: 'Thunder Boy',
    team: 'Ryan+Sam+Ronald',
    points: 128,
    posPoints: 120,
    bonusPoints: 9,
    penaltyPoints: -1,
    wins: 0,
    top5: 1,
    top10: 1,
    avgFinish: 19.86,
    avgStart: 9.71,
    lapsLed: 54,
    totalIncidents: 72,
    raceResults: [
      { id: 'race-1', raceNumber: 1, track: 'Daytona', date: '2026-02-12', finishPosition: 18, startPosition: 25, lapsLed: 0, incidents: 8, posPoints: 19, bonuses: [], penalty: 0 },
      { id: 'race-2', raceNumber: 2, track: 'EchoPark (Atlanta)', date: '2026-02-26', finishPosition: 30, startPosition: 3, lapsLed: 3, incidents: 24, posPoints: 7, bonuses: [{ label: 'Fast Lap', pts: 2 }, { label: 'Pole', pts: 2 }], penalty: -1 },
      { id: 'race-3', raceNumber: 3, track: 'COTA', date: '2026-03-05', finishPosition: 23, startPosition: 25, lapsLed: 0, incidents: 8, posPoints: 14, bonuses: [{ label: 'Low Inc', pts: 2 }], penalty: 0 },
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 23, startPosition: 3, lapsLed: 0, incidents: 12, posPoints: 14, bonuses: [], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 25, startPosition: 2, lapsLed: 24, incidents: 4, posPoints: 12, bonuses: [{ label: 'Fast Lap', pts: 2 }], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: 18, startPosition: 3, lapsLed: 26, incidents: 12, posPoints: 19, bonuses: [], penalty: 0 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 2, startPosition: 7, lapsLed: 1, incidents: 4, posPoints: 35, bonuses: [{ label: 'Low Inc (tie)', pts: 1 }], penalty: 0 },
    ],
  },
  sam: {
    id: 'sam',
    name: 'Sam Kunnemann',
    number: 64,
    nickname: 'Samon',
    team: 'Ryan+Sam+Ronald',
    points: 47,
    posPoints: 53,
    bonusPoints: 0,
    penaltyPoints: -6,
    wins: 0,
    top5: 0,
    top10: 0,
    avgFinish: 23.75,
    avgStart: 9.5,
    lapsLed: 0,
    totalIncidents: 124,
    raceResults: [
      { id: 'race-4', raceNumber: 4, track: 'Phoenix', date: '2026-03-12', finishPosition: 24, startPosition: 9, lapsLed: 0, incidents: 20, posPoints: 13, bonuses: [], penalty: 0 },
      { id: 'race-5', raceNumber: 5, track: 'Las Vegas', date: '2026-03-19', finishPosition: 22, startPosition: 7, lapsLed: 0, incidents: 10, posPoints: 15, bonuses: [], penalty: 0 },
      { id: 'race-6', raceNumber: 6, track: 'Darlington', date: '2026-03-26', finishPosition: 25, startPosition: 14, lapsLed: 0, incidents: 42, posPoints: 12, bonuses: [], penalty: -3 },
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 24, startPosition: 8, lapsLed: 0, incidents: 52, posPoints: 13, bonuses: [], penalty: -3 },
    ],
  },
  ronald: {
    id: 'ronald',
    name: 'Ronald Ramsey',
    number: 77,
    nickname: 'The Fuzz',
    team: 'Ryan+Sam+Ronald',
    points: 10,
    posPoints: 11,
    bonusPoints: 2,
    penaltyPoints: -3,
    wins: 0,
    top5: 0,
    top10: 0,
    avgFinish: 26.0,
    avgStart: 1.0,
    lapsLed: 0,
    totalIncidents: 46,
    raceResults: [
      { id: 'race-7', raceNumber: 7, track: 'Martinsville', date: '2026-04-03', finishPosition: 26, startPosition: 1, lapsLed: 0, incidents: 46, posPoints: 11, bonuses: [{ label: 'Pole', pts: 2 }], penalty: -3 },
    ],
  },
};

export default function DriverProfile() {
  const { id } = useParams();
  const { data: driver, loading } = useDriver(id);

  const displayDriver =
    driver && driver.races !== undefined ? driver : DEMO_DRIVER_DATA[id];

  if (!displayDriver) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/drivers"
            className="flex items-center gap-2 text-[#f5a623] hover:text-white transition mb-8"
          >
            <ArrowLeft size={20} />
            Back to Drivers
          </Link>
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a]">Driver not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = displayDriver.raceResults
    .filter((r) => !r.dnr)
    .map((result) => ({
      race: result.track,
      finish: result.finishPosition,
    }));

  const maxFinish = Math.max(...chartData.map((d) => d.finish), 30);

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          to="/drivers"
          className="flex items-center gap-2 text-[#f5a623] hover:text-white transition mb-8"
        >
          <ArrowLeft size={20} />
          Back to Drivers
        </Link>

        {/* Driver Header */}
        <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-8 mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-2">
                {displayDriver.name}
              </h1>
              <p className="text-[#f5a623] text-xl font-bold mb-1">"{displayDriver.nickname}"</p>
              <p className="text-[#8a8a9a] text-lg">{displayDriver.team}</p>
            </div>
            <div className="bg-[#f5a623] text-black rounded-lg px-6 py-4 text-center">
              <div className="text-4xl font-black">{displayDriver.number}</div>
              <div className="text-xs font-bold uppercase mt-1">Car #</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#f5a623] transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Points</div>
            <div className="text-[#f5a623] font-black text-3xl">{displayDriver.points}</div>
            {displayDriver.posPoints !== undefined && (
              <div className="text-xs text-[#8a8a9a] mt-2">
                {displayDriver.posPoints}p
                {displayDriver.bonusPoints > 0 && (
                  <span className="text-[#2ec4b6]"> +{displayDriver.bonusPoints}</span>
                )}
                {displayDriver.penaltyPoints < 0 && (
                  <span className="text-[#e63946]"> {displayDriver.penaltyPoints}</span>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#2ec4b6] transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Wins</div>
            <div className="text-[#2ec4b6] font-black text-3xl">{displayDriver.wins}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#e63946] transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Top 5s</div>
            <div className="text-[#e63946] font-black text-3xl">{displayDriver.top5}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-white transition">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Top 10s</div>
            <div className="text-white font-black text-3xl">{displayDriver.top10}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Avg Finish</div>
            <div className="text-white font-bold text-2xl">{displayDriver.avgFinish.toFixed(1)}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Avg Start</div>
            <div className="text-white font-bold text-2xl">{displayDriver.avgStart.toFixed(1)}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Laps Led</div>
            <div className="text-white font-bold text-2xl">{displayDriver.lapsLed}</div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Incidents</div>
            <div className="text-white font-bold text-2xl">{displayDriver.totalIncidents}</div>
          </div>
        </div>

        {/* Performance Chart */}
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
                contentStyle={{
                  backgroundColor: '#14141f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#f5a623' }}
                formatter={(value) => [`P${value}`, 'Finish']}
              />
              <Line
                type="monotone"
                dataKey="finish"
                stroke="#f5a623"
                strokeWidth={3}
                dot={{ fill: '#f5a623', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Race Results Table */}
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3e]">
            <h2 className="text-2xl font-bold text-white">Season Results</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3e] bg-[#0a0a0f]">
                  <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                    Race
                  </th>
                  <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                    Track
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Start
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Finish
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Laps Led
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Incidents
                  </th>
                  <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayDriver.raceResults.map((result) => {
                  const bonusTotal = (result.bonuses || []).reduce((s, b) => s + b.pts, 0);
                  const totalPts = (result.posPoints || 0) + bonusTotal + (result.penalty || 0);
                  return (
                  <tr
                    key={result.id}
                    className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition"
                  >
                    <td className="px-6 py-4 text-white font-semibold">Race {result.raceNumber}</td>
                    <td className="px-6 py-4 text-white">{result.track}</td>
                    <td className="px-6 py-4 text-right text-white">
                      {result.dnr ? '—' : result.startPosition}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {result.dnr ? (
                        <span className="text-[#8a8a9a]">DNR</span>
                      ) : (
                        <span className={`font-bold ${result.finishPosition <= 5 ? 'text-[#f5a623]' : 'text-white'}`}>
                          P{result.finishPosition}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-[#2ec4b6]">{result.dnr ? '—' : result.lapsLed}</td>
                    <td className="px-6 py-4 text-right text-[#e63946]">{result.dnr ? '—' : result.incidents}</td>
                    <td className="px-6 py-4 text-right">
                      {result.dnr ? (
                        <span className="text-[#8a8a9a]">—</span>
                      ) : (
                        <div>
                          <div className="text-[#f5a623] font-bold">{totalPts}</div>
                          <div className="text-xs text-[#8a8a9a]">
                            {result.posPoints}p
                            {bonusTotal > 0 && <span className="text-[#2ec4b6]"> +{bonusTotal}</span>}
                            {result.penalty < 0 && <span className="text-[#e63946]"> {result.penalty}</span>}
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
    </div>
  );
}
