import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const RACE_POINTS = {
  justin: { r1: 18, r2: 21, r3: 15, r4: 35, r5: 37, r6: 34, r7: 33 },
  nate:   { r1: 7,  r2: 22, r3: 46, r4: 44, r5: 18, r6: 26, r7: 40 },
  blaine: { r1: 26, r2: 19, r3: 9,  r4: 32, r5: 35, r6: 34, r7: 32 },
  nik:    { r1: 13, r2: 18, r3: 12, r4: 37, r5: 42, r6: 44, r7: 39 },
  jordan: { r1: 10, r2: 37, r3: 8,  r4: 34, r5: 34, r6: 19, r7: 0 },
  ryan:   { r1: 19, r2: 10, r3: 16, r4: 14, r5: 14, r6: 19, r7: 36 },
  terry:  { r1: 13, r2: 33, r3: 7,  r4: 12, r5: 13, r6: 0,  r7: 23 },
  sam:    { r1: 0,  r2: 0,  r3: 0,  r4: 13, r5: 15, r6: 9,  r7: 10 },
  ronald: { r1: 0,  r2: 0,  r3: 0,  r4: 0,  r5: 0,  r6: 0,  r7: 10 },
};

const DRIVERS = [
  { id: 'justin', name: 'Justin Ellis4', number: 5 },
  { id: 'nate', name: 'Nathan Becker', number: 21 },
  { id: 'blaine', name: 'Blaine Karnes', number: 25 },
  { id: 'nik', name: 'Nik Green2', number: 88 },
  { id: 'jordan', name: 'Jordan Stancil', number: 15 },
  { id: 'ryan', name: 'Ryan Ramsey', number: 10 },
  { id: 'terry', name: 'Terry Domino', number: 11 },
  { id: 'sam', name: 'Sam Kunnemann', number: 64 },
  { id: 'ronald', name: 'Ronald Ramsey', number: 77 },
];

const RACES = [
  { id: 'r1', label: 'R1: Daytona' },
  { id: 'r2', label: 'R2: Atlanta' },
  { id: 'r3', label: 'R3: COTA' },
  { id: 'r4', label: 'R4: Phoenix' },
  { id: 'r5', label: 'R5: Las Vegas' },
  { id: 'r6', label: 'R6: Darlington' },
  { id: 'r7', label: 'R7: Martinsville' },
];

export default function WhatIf() {
  const [activeRaces, setActiveRaces] = useState(new Set(['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7']));

  const toggleRace = (raceId) => {
    const newActive = new Set(activeRaces);
    if (newActive.has(raceId)) {
      newActive.delete(raceId);
    } else {
      newActive.add(raceId);
    }
    setActiveRaces(newActive);
  };

  const resetAll = () => {
    setActiveRaces(new Set(['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7']));
  };

  const allStandings = useMemo(() => {
    const standings = DRIVERS.map((driver) => {
      let total = 0;
      RACES.forEach((race) => {
        if (activeRaces.has(race.id)) {
          total += RACE_POINTS[driver.id][race.id];
        }
      });
      return { ...driver, points: total };
    });
    return standings.sort((a, b) => b.points - a.points);
  }, [activeRaces]);

  const originalStandings = useMemo(() => {
    const standings = DRIVERS.map((driver) => {
      let total = 0;
      RACES.forEach((race) => {
        total += RACE_POINTS[driver.id][race.id];
      });
      return { ...driver, points: total };
    });
    return standings.sort((a, b) => b.points - a.points);
  }, []);

  const positionMap = useMemo(() => {
    const map = {};
    originalStandings.forEach((driver, idx) => {
      map[driver.id] = idx + 1;
    });
    return map;
  }, [originalStandings]);

  const movers = useMemo(() => {
    const movements = allStandings.map((driver, idx) => {
      const originalPos = positionMap[driver.id];
      const currentPos = idx + 1;
      const change = originalPos - currentPos;
      return { ...driver, change, originalPos, currentPos };
    });
    return movements.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [allStandings, positionMap]);

  const biggestMovers = movers.filter((m) => m.change !== 0).slice(0, 3);

  const isAllActive = activeRaces.size === RACES.length;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#f5a623' }}>
          What-If Standings
        </h1>
        <p className="mb-8" style={{ color: '#8a8a9a' }}>
          Toggle race results to see how the standings would change
        </p>

        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            {RACES.map((race) => (
              <button
                key={race.id}
                onClick={() => toggleRace(race.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeRaces.has(race.id)
                    ? 'text-white'
                    : 'text-gray-400 opacity-50'
                }`}
                style={{
                  backgroundColor: activeRaces.has(race.id) ? '#f5a623' : 'transparent',
                  border: `2px solid ${activeRaces.has(race.id) ? '#f5a623' : '#2a2a3e'}`,
                }}
              >
                {race.label}
              </button>
            ))}
          </div>
          <button
            onClick={resetAll}
            disabled={isAllActive}
            className="px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
            style={{
              backgroundColor: '#e63946',
              color: 'white',
            }}
          >
            Reset All
          </button>
        </div>

        {biggestMovers.length > 0 && (
          <div
            className="mb-8 p-4 rounded-lg border"
            style={{
              backgroundColor: '#14141f',
              borderColor: '#2a2a3e',
            }}
          >
            <h2 className="text-lg font-bold mb-3" style={{ color: '#f5a623' }}>
              Biggest Movers
            </h2>
            <div className="space-y-2">
              {biggestMovers.map((mover) => (
                <div key={mover.id} className="flex items-center gap-3">
                  {mover.change > 0 ? (
                    <TrendingUp size={20} style={{ color: '#2ec4b6' }} />
                  ) : (
                    <TrendingDown size={20} style={{ color: '#e63946' }} />
                  )}
                  <span style={{ color: '#8a8a9a' }}>
                    <span className="font-semibold text-white">#{mover.number}</span> {mover.name}
                  </span>
                  <span
                    className="ml-auto font-bold"
                    style={{
                      color: mover.change > 0 ? '#2ec4b6' : '#e63946',
                    }}
                  >
                    {mover.change > 0 ? '+' : ''}
                    {mover.change} (#{mover.originalPos} → #{mover.currentPos})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid #2a2a3e' }}>
                <th className="text-left px-4 py-3" style={{ color: '#f5a623' }}>
                  Position
                </th>
                <th className="text-left px-4 py-3" style={{ color: '#f5a623' }}>
                  Driver
                </th>
                <th className="text-left px-4 py-3" style={{ color: '#f5a623' }}>
                  Number
                </th>
                <th className="text-right px-4 py-3" style={{ color: '#f5a623' }}>
                  Points
                </th>
                <th className="text-center px-4 py-3" style={{ color: '#f5a623' }}>
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {allStandings.map((driver, idx) => {
                const currentPos = idx + 1;
                const originalPos = positionMap[driver.id];
                const change = originalPos - currentPos;
                const originalPoints = originalStandings.find((d) => d.id === driver.id).points;
                const pointChange = driver.points - originalPoints;

                return (
                  <tr
                    key={driver.id}
                    className="border-b"
                    style={{ borderColor: '#2a2a3e' }}
                  >
                    <td
                      className="px-4 py-4 font-bold text-lg"
                      style={{ color: '#f5a623' }}
                    >
                      {currentPos}
                    </td>
                    <td className="px-4 py-4" style={{ color: '#ffffff' }}>
                      {driver.name}
                    </td>
                    <td
                      className="px-4 py-4 font-semibold"
                      style={{ color: '#2ec4b6' }}
                    >
                      #{driver.number}
                    </td>
                    <td className="px-4 py-4 text-right" style={{ color: '#ffffff' }}>
                      {driver.points}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {change !== 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          {change > 0 ? (
                            <>
                              <TrendingUp
                                size={18}
                                style={{ color: '#2ec4b6' }}
                              />
                              <span
                                className="text-sm font-semibold"
                                style={{ color: '#2ec4b6' }}
                              >
                                +{change}
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown
                                size={18}
                                style={{ color: '#e63946' }}
                              />
                              <span
                                className="text-sm font-semibold"
                                style={{ color: '#e63946' }}
                              >
                                {change}
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#8a8a9a' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="mt-8 p-4 rounded-lg border"
          style={{
            backgroundColor: '#14141f',
            borderColor: '#2a2a3e',
          }}
        >
          <p className="text-sm" style={{ color: '#8a8a9a' }}>
            Selected races: {activeRaces.size} / {RACES.length}
          </p>
        </div>
      </div>
    </div>
  );
}
