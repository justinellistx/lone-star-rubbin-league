import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Flame, Snowflake } from 'lucide-react';
import { useComputedStandings, useAllRaceResults, useDrivers } from '../hooks/useSupabase';

function TrendIndicator({ change }) {
  if (change > 0) {
    return (
      <div className="flex items-center gap-1">
        <TrendingUp size={16} className="text-[#008564]" />
        <span className="text-xs font-bold text-[#008564]">UP {change}</span>
      </div>
    );
  } else if (change < 0) {
    return (
      <div className="flex items-center gap-1">
        <TrendingDown size={16} className="text-[#cc0000]" />
        <span className="text-xs font-bold text-[#cc0000]">DOWN {Math.abs(change)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Minus size={16} className="text-[#6c6d6f]" />
      <span className="text-xs font-bold text-[#6c6d6f]">SAME</span>
    </div>
  );
}

function FormBadge({ label, type }) {
  const colors = {
    hot: 'bg-[#d00000]/20 text-[#d00000]',
    strong: 'bg-[#2ec4b6]/20 text-[#008564]',
    steady: 'bg-[#8a8a9a]/20 text-[#6c6d6f]',
    cold: 'bg-[#e63946]/20 text-[#cc0000]',
  };
  const icons = {
    hot: <Flame size={12} />,
    strong: <TrendingUp size={12} />,
    cold: <Snowflake size={12} />,
    steady: <Minus size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold rounded px-2 py-1 ${colors[type]}`}>
      {icons[type]} {label}
    </span>
  );
}

export default function PowerRankings() {
  const { standings, loading: sLoading } = useComputedStandings();
  const { data: allResults, loading: rLoading } = useAllRaceResults();
  const { data: drivers, loading: dLoading } = useDrivers();

  const loading = sLoading || rLoading || dLoading;

  // Build power rankings from ALL race data (no drops)
  const rankings = useMemo(() => {
    if (!standings || !allResults || !drivers) return [];

    // Build raw (no-drops) race-by-race for every driver from allResults
    const driverRawMap = {};
    drivers.forEach(d => {
      driverRawMap[d.id] = {
        id: d.id,
        name: d.name,
        number: d.car_number,
        nickname: d.nickname,
        team: d.teams?.name || '',
        allRaces: [],
      };
    });

    allResults.forEach(r => {
      if (!driverRawMap[r.driver_id]) return;
      driverRawMap[r.driver_id].allRaces.push({
        raceNum: r.races.race_number,
        track: r.races.track_name,
        date: r.races.race_date,
        finishPosition: r.finish_position,
        startPosition: r.start_position,
        points: r.total_points || 0,
        incidents: r.incidents || 0,
        lapsLed: r.laps_led || 0,
      });
    });

    // Sort each driver's races by race number
    Object.values(driverRawMap).forEach(d => {
      d.allRaces.sort((a, b) => a.raceNum - b.raceNum);
    });

    // Use standings for official rank + drop-adjusted points, merge with raw data
    return standings.map((driver, idx) => {
      const raw = driverRawMap[driver.id];
      const allRaces = raw?.allRaces || [];
      const rank = idx + 1;

      // --- ALL stats from every race (no drops) ---
      const rawPoints = allRaces.reduce((s, r) => s + r.points, 0);
      const rawAvgFinish = allRaces.length > 0
        ? allRaces.reduce((s, r) => s + r.finishPosition, 0) / allRaces.length
        : 0;
      const rawIncidents = allRaces.reduce((s, r) => s + r.incidents, 0);
      const rawLapsLed = allRaces.reduce((s, r) => s + r.lapsLed, 0);
      const rawWins = allRaces.filter(r => r.finishPosition === 1).length;

      // Last 3 races (ALL, not filtered by drops)
      const last3 = allRaces.slice(-3);
      const last3Avg = last3.length > 0
        ? last3.reduce((s, r) => s + r.finishPosition, 0) / last3.length
        : null;
      const last3Pts = last3.reduce((s, r) => s + r.points, 0);
      const last3Inc = last3.reduce((s, r) => s + r.incidents, 0);

      // Previous ranking: compute raw points without last race, rank everyone
      // (we'll do this below after the map)

      // Recent form assessment (based on ALL last 3)
      let formLabel, formType;
      if (last3.length < 2) {
        formLabel = 'Too early';
        formType = 'steady';
      } else if (last3Avg !== null && last3Avg <= 5) {
        formLabel = 'On fire';
        formType = 'hot';
      } else if (last3Avg !== null && last3Avg <= 10) {
        formLabel = 'Strong';
        formType = 'strong';
      } else if (last3Avg !== null && last3Avg <= 18) {
        formLabel = 'Steady';
        formType = 'steady';
      } else {
        formLabel = 'Struggling';
        formType = 'cold';
      }

      // Trend: first half vs second half of ALL races
      let trendLabel;
      if (allRaces.length >= 4) {
        const mid = Math.floor(allRaces.length / 2);
        const firstHalf = allRaces.slice(0, mid);
        const secondHalf = allRaces.slice(mid);
        const firstAvg = firstHalf.reduce((s, r) => s + r.finishPosition, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((s, r) => s + r.finishPosition, 0) / secondHalf.length;
        const diff = firstAvg - secondAvg; // positive = improving
        if (diff > 5) trendLabel = 'Surging';
        else if (diff > 2) trendLabel = 'Trending up';
        else if (diff < -5) trendLabel = 'Falling fast';
        else if (diff < -2) trendLabel = 'Trending down';
        else trendLabel = 'Holding steady';
      } else if (allRaces.length >= 2) {
        const recentAvg = allRaces.slice(-2).reduce((s, r) => s + r.finishPosition, 0) / 2;
        if (recentAvg <= 8) trendLabel = 'Looking sharp';
        else if (recentAvg >= 22) trendLabel = 'Rough stretch';
        else trendLabel = 'Finding rhythm';
      } else {
        trendLabel = 'Just getting started';
      }

      const lastRace = allRaces.length > 0 ? allRaces[allRaces.length - 1] : null;

      return {
        id: driver.id,
        name: driver.name,
        number: driver.number,
        nickname: driver.nickname,
        team: driver.team,
        rank,
        // Official standings (with drops)
        standingsPoints: driver.points,
        droppedPoints: driver.droppedPoints || 0,
        // Raw stats (ALL races, no drops — the real picture)
        rawPoints,
        rawAvgFinish,
        rawIncidents,
        rawLapsLed,
        rawWins,
        racesEntered: allRaces.length,
        dnrCount: driver.dnrCount || 0,
        // Trend data (ALL races)
        last3,
        last3Avg,
        last3Pts,
        last3Inc,
        formLabel,
        formType,
        trendLabel,
        lastRace,
        allRaces,
      };
    });
  }, [standings, allResults, drivers]);

  // Compute trend arrows: compare raw points ranking before vs after last race
  const rankingsWithTrend = useMemo(() => {
    if (rankings.length === 0) return [];

    // Previous raw-points ranking (without last race)
    const prevRaw = rankings
      .map(d => {
        const lastPts = d.lastRace ? d.lastRace.points : 0;
        return { id: d.id, prevRawPts: d.rawPoints - lastPts };
      })
      .sort((a, b) => b.prevRawPts - a.prevRawPts);

    const prevRankMap = {};
    prevRaw.forEach((d, i) => { prevRankMap[d.id] = i + 1; });

    return rankings.map(d => ({
      ...d,
      prevRank: prevRankMap[d.id] || d.rank,
      change: (prevRankMap[d.id] || d.rank) - d.rank,
    }));
  }, [rankings]);

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen py-12 px-4 md:px-8 flex items-center justify-center">
        <p className="text-[#6c6d6f]">Loading power rankings...</p>
      </div>
    );
  }

  if (!rankingsWithTrend || rankingsWithTrend.length === 0) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen py-12 px-4 md:px-8 flex items-center justify-center">
        <p className="text-[#6c6d6f]">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-[#131313] mb-2">POWER RANKINGS</h1>
          <p className="text-[#6c6d6f] text-lg">
            Real-time driver assessment — ALL races, no drops. The unfiltered truth.
          </p>
        </div>

        {/* Rankings List */}
        <div className="space-y-6">
          {rankingsWithTrend.map((driver) => {
            const isChamp = driver.rank === 1;

            // Points gap between raw and standings (shows how much drops are helping)
            const dropBenefit = driver.standingsPoints - (driver.rawPoints - driver.droppedPoints);

            return (
              <div
                key={driver.id}
                className={`rounded-lg border overflow-hidden ${
                  isChamp ? 'border-[#d00000] ring-1 ring-[#f5a623]' : 'border-[#e0e0e0]'
                }`}
                style={{ backgroundColor: isChamp ? '#1a1a24' : '#14141f' }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center font-black text-2xl ${
                          isChamp ? 'bg-[#d00000] text-black' : 'bg-[#e0e0e0] text-[#d00000]'
                        }`}
                      >
                        {driver.rank}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name + Trend */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#131313]">{driver.name}</h3>
                          <p className="text-[#008564] text-sm font-semibold">
                            #{driver.number} • {driver.nickname || driver.team}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <FormBadge label={driver.formLabel} type={driver.formType} />
                          <TrendIndicator change={driver.change} />
                        </div>
                      </div>

                      {/* Context blurb */}
                      <p className="text-[#6c6d6f] text-sm leading-relaxed mb-4">
                        {driver.trendLabel}.
                        {driver.lastRace && (
                          <> Last out: P{driver.lastRace.finishPosition} at {driver.lastRace.track}
                            {driver.lastRace.incidents > 20 && (
                              <span className="text-[#cc0000]"> ({driver.lastRace.incidents} inc)</span>
                            )}
                          .</>
                        )}
                        {driver.rawWins > 0 && <> {driver.rawWins} win{driver.rawWins > 1 ? 's' : ''} this stage.</>}
                        {driver.last3Avg !== null && driver.rawAvgFinish > 0 && (
                          driver.last3Avg < driver.rawAvgFinish - 2
                            ? <> Recent form ({driver.last3Avg.toFixed(1)}) well above season average ({driver.rawAvgFinish.toFixed(1)}).</>
                            : driver.last3Avg > driver.rawAvgFinish + 2
                              ? <> Recent form ({driver.last3Avg.toFixed(1)}) dropping below season average ({driver.rawAvgFinish.toFixed(1)}).</>
                              : null
                        )}
                        {driver.dnrCount > 0 && <> {driver.dnrCount} missed race{driver.dnrCount > 1 ? 's' : ''}.</>}
                      </p>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-[#6c6d6f] text-xs uppercase font-bold mb-1">Raw Points</div>
                          <div className="text-[#131313] font-bold text-lg">{driver.rawPoints}</div>
                          <div className="text-xs text-[#6c6d6f]">
                            Standings: <span className="text-[#d00000]">{driver.standingsPoints}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[#6c6d6f] text-xs uppercase font-bold mb-1">Last 3 Avg</div>
                          <div className={`font-bold text-lg ${
                            driver.last3Avg !== null && driver.last3Avg <= 10 ? 'text-[#008564]' :
                            driver.last3Avg !== null && driver.last3Avg > 20 ? 'text-[#cc0000]' : 'text-[#131313]'
                          }`}>
                            {driver.last3Avg !== null ? `P${driver.last3Avg.toFixed(1)}` : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#6c6d6f] text-xs uppercase font-bold mb-1">Season Avg</div>
                          <div className="text-[#131313] font-bold text-lg">P{driver.rawAvgFinish.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-[#6c6d6f] text-xs uppercase font-bold mb-1">Last 3 Pts</div>
                          <div className="text-[#131313] font-bold text-lg">{driver.last3Pts}</div>
                        </div>
                        <div>
                          <div className="text-[#6c6d6f] text-xs uppercase font-bold mb-1">Incidents</div>
                          <div className="text-[#cc0000] font-bold text-lg">{driver.rawIncidents}</div>
                          <div className="text-xs text-[#6c6d6f]">
                            Last 3: <span className="text-[#cc0000]">{driver.last3Inc}</span>
                          </div>
                        </div>
                      </div>

                      {/* All races mini-strip */}
                      {driver.allRaces.length > 0 && (
                        <div className="mt-4 flex gap-2 flex-wrap">
                          {driver.allRaces.map((r, i) => (
                            <div
                              key={i}
                              className={`text-xs rounded px-2 py-1 font-semibold ${
                                r.finishPosition === null
                                  ? 'bg-[#e0e0e0]/50 text-[#6c6d6f]'
                                  : r.finishPosition <= 5
                                    ? 'bg-[#d00000]/20 text-[#d00000]'
                                    : r.finishPosition <= 10
                                      ? 'bg-[#2ec4b6]/20 text-[#008564]'
                                      : r.finishPosition <= 20
                                        ? 'bg-[#e0e0e0] text-[#131313]'
                                        : 'bg-[#e63946]/20 text-[#cc0000]'
                              }`}
                            >
                              {r.track?.slice(0, 3)} P{r.finishPosition}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div className="mt-12 bg-white border border-[#e0e0e0] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#d00000] mb-2">About Power Rankings</h2>
          <p className="text-[#6c6d6f] text-sm">
            Power Rankings use ALL race data with no drops applied. This is the unfiltered picture —
            every finish, every incident, every bad night counts. A driver might look solid in the
            official standings thanks to dropped races, but their power ranking tells the real story.
            Trend arrows show position movement based on raw points after the most recent race.
            Rank order follows official standings; stats reflect the full season.
          </p>
        </div>
      </div>
    </div>
  );
}
