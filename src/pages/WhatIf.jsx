import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useComputedStandings, useRaces } from '../hooks/useSupabase';

export default function WhatIf() {
  const { standings, loading: standingsLoading } = useComputedStandings();
  const { data: races, loading: racesLoading } = useRaces();

  // Build race list from live data
  const raceList = useMemo(() => {
    if (!races || races.length === 0) return [];
    return races.map((race, idx) => ({
      id: `r${idx + 1}`,
      label: `R${race.race_number}: ${race.track_name}`,
      raceNumber: race.race_number,
    }));
  }, [races]);

  // Initialize activeRaces to include all available races
  const defaultActiveRaces = useMemo(() => {
    return new Set(raceList.map(r => r.id));
  }, [raceList]);

  const [activeRaces, setActiveRaces] = useState(defaultActiveRaces);

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
    setActiveRaces(defaultActiveRaces);
  };

  const allStandings = useMemo(() => {
    if (!standings || standings.length === 0) return [];

    return standings.map((driver) => {
      let total = 0;
      if (driver.raceByRace && Array.isArray(driver.raceByRace)) {
        driver.raceByRace.forEach((race, idx) => {
          const raceId = `r${idx + 1}`;
          if (activeRaces.has(raceId)) {
            total += race.points || 0;
          }
        });
      }
      return { ...driver, points: total };
    }).sort((a, b) => b.points - a.points);
  }, [standings, activeRaces]);

  const originalStandings = useMemo(() => {
    if (!standings || standings.length === 0) return [];

    return standings.map((driver) => {
      let total = 0;
      if (driver.raceByRace && Array.isArray(driver.raceByRace)) {
        driver.raceByRace.forEach((race) => {
          total += race.points || 0;
        });
      }
      return { ...driver, points: total };
    }).sort((a, b) => b.points - a.points);
  }, [standings]);

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

  const isAllActive = activeRaces.size === raceList.length;

  if (standingsLoading || racesLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="text-center">
          <p style={{ color: '#f5a623' }} className="text-lg font-semibold">
            Loading standings...
          </p>
        </div>
      </div>
    );
  }

  if (!standings || standings.length === 0 || raceList.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="text-center">
          <p style={{ color: '#8a8a9a' }}>No standings data available</p>
        </div>
      </div>
    );
  }

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
            {raceList.map((race) => (
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
            Selected races: {activeRaces.size} / {raceList.length}
          </p>
        </div>
      </div>
    </div>
  );
}
