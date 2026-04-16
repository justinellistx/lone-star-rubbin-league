import React, { useMemo } from 'react';
import { useComputedStandings, useRaces } from '../hooks/useSupabase';

export default function Rivalries() {
  const { standings, loading: standingsLoading } = useComputedStandings();
  const { data: races, loading: racesLoading } = useRaces();

  // Build driver info from standings
  const driverInfo = useMemo(() => {
    if (!standings || standings.length === 0) return {};

    const info = {};
    standings.forEach((driver) => {
      info[driver.name] = {
        number: driver.number,
        nickname: driver.nickname || '',
        finishes: (driver.raceByRace || []).map((r) => r.finishPosition || null),
      };
    });
    return info;
  }, [standings]);

  // Build track names from races
  const trackNames = useMemo(() => {
    if (!races || races.length === 0) return [];
    return races.map((r) => r.track_name);
  }, [races]);

  // Calculate rivalries
  const rivalries = useMemo(() => {
    const rivalryMap = {};
    const drivers = Object.keys(driverInfo);

    if (drivers.length === 0) return [];

    // Compare all pairs of drivers
    for (let i = 0; i < drivers.length; i++) {
      for (let j = i + 1; j < drivers.length; j++) {
        const driver1 = drivers[i];
        const driver2 = drivers[j];
        const finishes1 = driverInfo[driver1].finishes;
        const finishes2 = driverInfo[driver2].finishes;

        let closeFinishes = 0;
        let driver1Ahead = 0;
        let driver2Ahead = 0;
        let closestDifference = Infinity;
        let closestTrackIndex = -1;
        const battleLog = [];

        // Check each race
        for (let raceIdx = 0; raceIdx < finishes1.length; raceIdx++) {
          const pos1 = finishes1[raceIdx];
          const pos2 = finishes2[raceIdx];

          // Skip DNF (null)
          if (pos1 === null || pos2 === null) continue;

          const difference = Math.abs(pos1 - pos2);

          // Within 3 positions
          if (difference <= 3) {
            closeFinishes++;
            if (pos1 < pos2) {
              driver1Ahead++;
            } else if (pos2 < pos1) {
              driver2Ahead++;
            }

            battleLog.push({
              track: trackNames[raceIdx] || `Race ${raceIdx + 1}`,
              pos1,
              pos2,
              difference,
            });

            if (difference < closestDifference) {
              closestDifference = difference;
              closestTrackIndex = raceIdx;
            }
          }
        }

        if (closeFinishes > 0) {
          const key = [driver1, driver2].sort().join('-');
          rivalryMap[key] = {
            driver1,
            driver2,
            closeFinishes,
            driver1Ahead,
            driver2Ahead,
            closestDifference,
            closestTrack: trackNames[closestTrackIndex] || `Race ${closestTrackIndex + 1}`,
            battleLog: battleLog.sort((a, b) => a.difference - b.difference),
          };
        }
      }
    }

    return Object.values(rivalryMap).sort((a, b) => b.closeFinishes - a.closeFinishes);
  }, [driverInfo, trackNames]);

  const getIntensityColor = (closeFinishes) => {
    if (closeFinishes >= 6) return 'from-red-600 to-red-500';
    if (closeFinishes >= 4) return 'from-orange-600 to-orange-500';
    if (closeFinishes >= 2) return 'from-yellow-600 to-yellow-500';
    return 'from-teal-600 to-teal-500';
  };

  const getIntensityLabel = (closeFinishes) => {
    if (closeFinishes >= 6) return 'LEGENDARY';
    if (closeFinishes >= 4) return 'FIERCE';
    if (closeFinishes >= 2) return 'HEATED';
    return 'BUDDING';
  };

  if (standingsLoading || racesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#14141f] p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-semibold">Loading rivalries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#14141f] p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black mb-2 text-white">DRIVER RIVALRIES</h1>
        <p className="text-[#8a8a9a] text-lg">
          {rivalries.length} active rivalries detected • Analyzed by proximity frequency
        </p>
      </div>

      {/* Rivalries Grid */}
      <div className="grid grid-cols-1 gap-6">
        {rivalries.map((rivalry, idx) => {
          const driver1Info = driverInfo[rivalry.driver1];
          const driver2Info = driverInfo[rivalry.driver2];
          const record = `${rivalry.driver1Ahead}-${rivalry.driver2Ahead}`;
          const intensityPercent = Math.min((rivalry.closeFinishes / 7) * 100, 100);

          return (
            <div
              key={idx}
              className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden hover:border-[#f5a623] transition-all duration-300 shadow-2xl"
            >
              {/* Top accent bar */}
              <div className={`h-1 bg-gradient-to-r ${getIntensityColor(rivalry.closeFinishes)}`}></div>

              <div className="p-8">
                {/* Rivalry Header */}
                <div className="flex items-center justify-between mb-8">
                  {/* Driver 1 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#f5a623] to-orange-600 rounded flex items-center justify-center">
                        <span className="text-white font-black text-lg">#{driver1Info.number}</span>
                      </div>
                      <div>
                        <p className="text-xl font-black text-white">{rivalry.driver1}</p>
                        <p className="text-sm text-[#8a8a9a] italic">"{driver1Info.nickname}"</p>
                      </div>
                    </div>
                  </div>

                  {/* VS Center */}
                  <div className="flex-shrink-0 mx-8 text-center">
                    <p className="text-4xl font-black text-[#f5a623] mb-2">VS</p>
                    <p className="text-xs text-[#8a8a9a] font-bold uppercase tracking-widest">
                      {getIntensityLabel(rivalry.closeFinishes)}
                    </p>
                  </div>

                  {/* Driver 2 */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-3 mb-2">
                      <div>
                        <p className="text-xl font-black text-white">{rivalry.driver2}</p>
                        <p className="text-sm text-[#8a8a9a] italic">"{driver2Info.nickname}"</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2ec4b6] to-teal-500 rounded flex items-center justify-center">
                        <span className="text-white font-black text-lg">#{driver2Info.number}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-[#2a2a3e]">
                  {/* Close Finishes */}
                  <div className="text-center">
                    <p className="text-[#8a8a9a] text-xs uppercase font-bold tracking-widest mb-1">
                      Close Finishes
                    </p>
                    <p className="text-3xl font-black text-[#f5a623]">{rivalry.closeFinishes}</p>
                  </div>

                  {/* Head to Head Record */}
                  <div className="text-center">
                    <p className="text-[#8a8a9a] text-xs uppercase font-bold tracking-widest mb-1">
                      H2H Record
                    </p>
                    <p className="text-3xl font-black text-white">
                      {record}
                    </p>
                  </div>

                  {/* Closest Finish */}
                  <div className="text-center">
                    <p className="text-[#8a8a9a] text-xs uppercase font-bold tracking-widest mb-1">
                      Closest @ Track
                    </p>
                    <p className="text-lg font-black text-[#2ec4b6]">{rivalry.closestTrack}</p>
                    <p className="text-xs text-[#8a8a9a]">
                      {rivalry.closestDifference} pos apart
                    </p>
                  </div>
                </div>

                {/* Intensity Meter */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs uppercase font-bold text-[#8a8a9a] tracking-widest">
                      Rivalry Intensity
                    </p>
                    <p className="text-xs font-black text-[#f5a623]">{Math.round(intensityPercent)}%</p>
                  </div>
                  <div className="w-full bg-[#0a0a0f] rounded-full h-3 overflow-hidden border border-[#2a2a3e]">
                    <div
                      className={`h-full bg-gradient-to-r ${getIntensityColor(rivalry.closeFinishes)} transition-all duration-500`}
                      style={{ width: `${intensityPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Battle Log */}
                {rivalry.battleLog.length > 0 && (
                  <div>
                    <p className="text-xs uppercase font-bold text-[#8a8a9a] tracking-widest mb-3">
                      Battle Log (Last 3)
                    </p>
                    <div className="space-y-2">
                      {rivalry.battleLog.slice(0, 3).map((battle, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-center justify-between text-sm px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded"
                        >
                          <span className="text-[#8a8a9a]">{battle.track}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">#{battle.pos1}</span>
                            <span className="text-[#f5a623] font-black">-</span>
                            <span className="font-bold text-white">#{battle.pos2}</span>
                          </div>
                          <span className="text-xs text-[#2ec4b6] font-bold">
                            {battle.difference} positions
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {rivalries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#8a8a9a] text-lg">No rivalries detected yet.</p>
          <p className="text-[#8a8a9a]">Drivers need to finish close together to form rivalries.</p>
        </div>
      )}
    </div>
  );
}
