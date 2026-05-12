import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// ─── Core data hooks ───────────────────────────────────────────

/**
 * Fetch ALL race results with driver + race info joined.
 * This is the master query that powers most pages.
 */
export function useAllRaceResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('race_results')
          .select(`
            *,
            drivers ( id, name, car_number, cust_id, team_id, nickname, active ),
            races ( id, race_number, track_name, race_date, series, stage_id, total_laps, status )
          `)
          .order('finish_position', { ascending: true });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Fetch race results for a single race
 */
export function useRaceResults(raceId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!raceId) { setData(null); setLoading(false); return; }

    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('race_results')
          .select(`
            *,
            drivers ( id, name, car_number, cust_id, team_id, nickname )
          `)
          .eq('race_id', raceId)
          .order('finish_position', { ascending: true });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [raceId]);

  return { data, loading, error };
}

/**
 * Fetch all races with stage info
 */
export function useRaces(stageId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let query = supabase
          .from('races')
          .select('*, stages ( id, name, stage_number, season_id )')
          .order('race_number', { ascending: true });

        if (stageId) query = query.eq('stage_id', stageId);

        const { data, error } = await query;
        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stageId]);

  return { data, loading, error };
}

/**
 * Fetch all active drivers with team info
 */
export function useDrivers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('drivers')
          .select('*, teams!drivers_team_id_fkey ( id, name )')
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Fetch all teams with driver info
 */
export function useTeams() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: teams, error: tErr } = await supabase
          .from('teams')
          .select('*')
          .eq('active', true)
          .order('name');

        if (tErr) throw tErr;

        const { data: drivers, error: dErr } = await supabase
          .from('drivers')
          .select('*')
          .eq('active', true);

        if (dErr) throw dErr;

        const teamsWithDrivers = teams.map(team => ({
          ...team,
          drivers: drivers.filter(d => d.team_id === team.id),
        }));

        setData(teamsWithDrivers);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Fetch all stages
 */
export function useStages() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('stages')
          .select('*')
          .order('stage_number', { ascending: true });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Fetch schedule for a season (or all)
 */
export function useSchedule(seasonId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let query = supabase
          .from('schedule')
          .select('*')
          .order('race_number', { ascending: true });

        if (seasonId) query = query.eq('season_id', seasonId);

        const { data, error } = await query;
        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [seasonId]);

  return { data, loading, error };
}

/**
 * Fetch published news
 */
export function useNews(limit = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [limit]);

  return { data, loading, error };
}

/**
 * Fetch single driver with race results
 */
export function useDriver(driverId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) { setData(null); setLoading(false); return; }

    async function fetchData() {
      try {
        setLoading(true);
        const { data: driver, error: dErr } = await supabase
          .from('drivers')
          .select('*, teams!drivers_team_id_fkey ( id, name )')
          .eq('id', driverId)
          .single();

        if (dErr) throw dErr;

        const { data: results, error: rErr } = await supabase
          .from('race_results')
          .select('*, races ( id, race_number, track_name, race_date, series, stage_id )')
          .eq('driver_id', driverId)
          .order('races(race_number)', { ascending: true });

        if (rErr) throw rErr;

        setData({ ...driver, raceResults: results });
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [driverId]);

  return { data, loading, error };
}

// ─── Computed data hooks (derive standings from race_results) ──

/**
 * Compute driver standings from raw race results.
 * Stage-aware: computes per-stage standings (with drops + bonuses)
 * and overall season standings (cumulative post-drop points, no bonuses).
 */
export function useComputedStandings() {
  const { data: allResults, loading: rLoading, error: rError } = useAllRaceResults();
  const { data: drivers, loading: dLoading, error: dError } = useDrivers();
  const { data: teams, error: tError } = useTeams();

  // Debug logging for data pipeline
  if (!rLoading && !dLoading) {
    if (rError) console.error('[useComputedStandings] race_results error:', rError);
    if (dError) console.error('[useComputedStandings] drivers error:', dError);
    if (tError) console.error('[useComputedStandings] teams error:', tError);
    if (!allResults) console.warn('[useComputedStandings] allResults is null after loading');
    if (!drivers) console.warn('[useComputedStandings] drivers is null after loading');
  }

  const DROPS_ALLOWED = 3;
  const RACES_PER_STAGE = 12;
  const MIN_RACES_FOR_INCIDENTS = 9;
  const STAGE_BONUS_POINTS = 3;

  // ─── Helper: compute standings for a set of race results ───
  function computeStageStandings(stageResults, stageRaceIds, driverMap) {
    const completedRaceList = [...stageRaceIds];

    return Object.values(driverMap).map(d => {
      const enteredRaces = stageResults.filter(r => r.driver_id === d.id);
      const enteredRaceIds = new Set(enteredRaces.map(r => r.race_id));

      // Inject DNR entries for races this driver missed in this stage
      const raceInfoMap = {};
      stageResults.forEach(r => {
        if (!raceInfoMap[r.race_id]) raceInfoMap[r.race_id] = r.races;
      });

      const dnrRaces = completedRaceList
        .filter(raceId => !enteredRaceIds.has(raceId))
        .map(raceId => ({
          race_id: raceId,
          races: raceInfoMap[raceId],
          driver_id: d.id,
          finish_position: null,
          start_position: null,
          total_points: 0,
          race_points: 0,
          bonus_points: 0,
          penalty_points: 0,
          laps_led: 0,
          incidents: 0,
          fastest_lap_time: null,
          isDNR: true,
        }));

      const allRaces = [...enteredRaces, ...dnrRaces];
      const dnrCount = dnrRaces.length;

      // Sort by total_points ascending — worst races first (DNRs at 0 sink to bottom)
      const sorted = [...allRaces].sort((a, b) => (a.total_points || 0) - (b.total_points || 0));

      // Drop worst N races
      const dropCount = Math.min(DROPS_ALLOWED, sorted.length);
      const dropped = sorted.slice(0, dropCount);
      const kept = sorted.slice(dropCount);

      const droppedRaceIds = new Set(dropped.map(r => r.race_id));

      // Only non-DNR kept races count for stats
      const keptEntered = kept.filter(r => !r.isDNR);

      // Points after drops
      const points = kept.reduce((s, r) => s + (r.total_points || 0), 0);

      // Raw totals (all entered races before drops)
      const rawPoints = enteredRaces.reduce((s, r) => s + (r.total_points || 0), 0);

      // All stats computed from KEPT races only
      const posPoints = keptEntered.reduce((s, r) => s + (r.race_points || 0), 0);
      const bonusPoints = keptEntered.reduce((s, r) => s + (r.bonus_points || 0), 0);
      const penaltyPoints = keptEntered.reduce((s, r) => s + (r.penalty_points || 0), 0);
      const wins = keptEntered.filter(r => r.finish_position === 1).length;
      const top5 = keptEntered.filter(r => r.finish_position <= 5).length;
      const top10 = keptEntered.filter(r => r.finish_position <= 10).length;
      const lapsLed = keptEntered.reduce((s, r) => s + (r.laps_led || 0), 0);
      const totalIncidents = keptEntered.reduce((s, r) => s + (r.incidents || 0), 0);
      const poles = keptEntered.filter(r => r.start_position === 1).length;
      const avgFinish = keptEntered.length > 0
        ? keptEntered.reduce((s, r) => s + r.finish_position, 0) / keptEntered.length
        : 0;

      // Per-race data for charts
      const raceByRace = enteredRaces
        .sort((a, b) => a.races.race_number - b.races.race_number)
        .map(r => ({
          raceNum: r.races.race_number,
          track: r.races.track_name,
          date: r.races.race_date,
          finishPosition: r.finish_position,
          startPosition: r.start_position,
          points: r.total_points || 0,
          incidents: r.incidents || 0,
          lapsLed: r.laps_led || 0,
          bestLap: r.fastest_lap_time,
          isDropped: droppedRaceIds.has(r.race_id),
        }));

      return {
        id: d.id,
        name: d.name,
        number: d.number,
        nickname: d.nickname,
        team: d.team,
        teamId: d.teamId,
        points,
        rawPoints,
        droppedPoints: rawPoints - points,
        posPoints,
        bonusPoints,
        penaltyPoints,
        wins,
        top5,
        top10,
        lapsLed,
        totalIncidents,
        poles,
        avgFinish: parseFloat(avgFinish.toFixed(1)),
        racesEntered: enteredRaces.length,
        dnrCount,
        dropsUsed: DROPS_ALLOWED,
        raceByRace,
        keptRaceIds: new Set(kept.map(r => r.race_id)),
      };
    })
    .filter(d => d.racesEntered > 0)
    .sort((a, b) => b.points - a.points);
  }

  // ─── Helper: compute stage bonuses from kept races only ───
  function computeStageBonuses(stageStandings, stageResults) {
    const racesCompleted = stageStandings.length > 0
      ? Math.max(...stageStandings.map(d => d.racesEntered), 0)
      : 0;

    // Most Laps Led (from kept races — already computed in standings)
    const mostLapsLed = stageStandings.length > 0
      ? stageStandings.reduce((best, d) =>
          d.lapsLed > (best?.lapsLed || 0) ? d : best, stageStandings[0])
      : null;

    // Lowest Incidents — requires 9+ kept races to qualify
    const qualifiedForIncidents = stageStandings.filter(d =>
      d.raceByRace.filter(r => !r.isDropped).length >= MIN_RACES_FOR_INCIDENTS
    );
    const lowestIncidents = qualifiedForIncidents.length > 0
      ? qualifiedForIncidents.reduce((best, d) =>
          d.totalIncidents < (best?.totalIncidents || Infinity) ? d : best, qualifiedForIncidents[0])
      : null;

    // Most Poles (from kept races — already computed in standings)
    const mostPoles = stageStandings.length > 0
      ? stageStandings.reduce((best, d) =>
          d.poles > (best?.poles || 0) ? d : best, stageStandings[0])
      : null;
    // Check for ties in poles
    const maxPolesValue = mostPoles?.poles || 0;
    const poleLeaders = maxPolesValue > 0
      ? stageStandings.filter(d => d.poles === maxPolesValue)
      : [];

    // Most Fastest Laps — only count from KEPT races for each driver
    const fastestLapWinnerByRace = {};
    if (stageResults) {
      const byRace = {};
      stageResults.forEach(r => {
        if (!byRace[r.race_id]) byRace[r.race_id] = [];
        byRace[r.race_id].push(r);
      });

      Object.entries(byRace).forEach(([raceId, raceResults]) => {
        const fastest = raceResults.reduce((best, r) => {
          if (!r.fastest_lap_time) return best;
          if (!best || r.fastest_lap_time < best.fastest_lap_time) return r;
          return best;
        }, null);
        if (fastest) {
          fastestLapWinnerByRace[raceId] = fastest.driver_id;
        }
      });
    }

    // Count fastest laps only from races in each driver's KEPT set
    const fastestLapCounts = {};
    stageStandings.forEach(d => {
      let count = 0;
      Object.entries(fastestLapWinnerByRace).forEach(([raceId, winnerId]) => {
        if (winnerId === d.id && d.keptRaceIds.has(raceId)) {
          count++;
        }
      });
      if (count > 0) fastestLapCounts[d.name] = count;
    });

    const maxFastestLaps = Math.max(...Object.values(fastestLapCounts), 0);
    const fastestLapLeaders = Object.entries(fastestLapCounts)
      .filter(([, count]) => count === maxFastestLaps);

    return {
      racesCompleted,
      totalRaces: RACES_PER_STAGE,
      dropsAllowed: DROPS_ALLOWED,
      bonusValue: STAGE_BONUS_POINTS,
      mostLapsLed: {
        name: mostLapsLed?.name || '—',
        value: mostLapsLed?.lapsLed || 0,
        driverId: mostLapsLed?.id,
      },
      lowestIncidents: lowestIncidents
        ? { name: lowestIncidents.name, value: lowestIncidents.totalIncidents, qualified: true, driverId: lowestIncidents.id }
        : { name: 'No one qualifies yet', value: null, qualified: false, minRaces: MIN_RACES_FOR_INCIDENTS },
      mostPoles: {
        leaders: poleLeaders.map(d => d.name),
        value: maxPolesValue,
        isTied: poleLeaders.length > 1,
        driverIds: poleLeaders.map(d => d.id),
      },
      mostFastestLaps: {
        leaders: fastestLapLeaders.map(([name]) => name),
        value: maxFastestLaps,
        isTied: fastestLapLeaders.length > 1,
      },
    };
  }

  // ─── Main computation: per-stage + overall ───
  const stageData = useMemo(() => {
    if (!allResults || !drivers) return null;

    // Build driver info map
    const driverMap = {};
    drivers.forEach(d => {
      driverMap[d.id] = {
        id: d.id,
        name: d.name,
        number: d.car_number,
        nickname: d.nickname,
        team: d.teams?.name || '',
        teamId: d.team_id,
      };
    });

    // Group results by stage_id
    const resultsByStage = {};
    const raceIdsByStage = {};
    allResults.forEach(r => {
      const stageId = r.races?.stage_id;
      if (!stageId) return;
      if (!resultsByStage[stageId]) {
        resultsByStage[stageId] = [];
        raceIdsByStage[stageId] = new Set();
      }
      resultsByStage[stageId].push(r);
      raceIdsByStage[stageId].add(r.race_id);
    });

    // Compute per-stage standings
    const stages = {};
    Object.entries(resultsByStage).forEach(([stageId, stageResults]) => {
      const stageRaceIds = raceIdsByStage[stageId];
      const standings = computeStageStandings(stageResults, stageRaceIds, driverMap);
      const bonusTracker = computeStageBonuses(standings, stageResults);

      // Determine stage number from first race result's races data
      const firstResult = stageResults[0];
      const stageNumber = firstResult?.races?.stage_id === stageId
        ? Object.keys(resultsByStage).indexOf(stageId) + 1
        : null;

      stages[stageId] = {
        standings,
        bonusTracker,
        raceCount: stageRaceIds.size,
      };
    });

    // ─── Overall Season Standings ───
    // Sum of per-stage post-drop points for each driver. No stage bonuses.
    const overallMap = {};
    Object.values(stages).forEach(({ standings: stageStandings }) => {
      stageStandings.forEach(d => {
        if (!overallMap[d.id]) {
          overallMap[d.id] = {
            id: d.id,
            name: d.name,
            number: d.number,
            nickname: d.nickname,
            team: d.team,
            teamId: d.teamId,
            points: 0,
            rawPoints: 0,
            droppedPoints: 0,
            posPoints: 0,
            bonusPoints: 0,
            penaltyPoints: 0,
            wins: 0,
            top5: 0,
            top10: 0,
            lapsLed: 0,
            totalIncidents: 0,
            poles: 0,
            avgFinishSum: 0,
            avgFinishCount: 0,
            racesEntered: 0,
            dnrCount: 0,
            raceByRace: [],
          };
        }
        const o = overallMap[d.id];
        o.points += d.points;
        o.rawPoints += d.rawPoints;
        o.droppedPoints += d.droppedPoints;
        o.posPoints += d.posPoints;
        o.bonusPoints += d.bonusPoints;
        o.penaltyPoints += d.penaltyPoints;
        o.wins += d.wins;
        o.top5 += d.top5;
        o.top10 += d.top10;
        o.lapsLed += d.lapsLed;
        o.totalIncidents += d.totalIncidents;
        o.poles += d.poles;
        o.racesEntered += d.racesEntered;
        o.dnrCount += d.dnrCount;
        o.raceByRace = [...o.raceByRace, ...d.raceByRace];
        // For avg finish: accumulate weighted
        const keptCount = d.raceByRace.filter(r => !r.isDropped).length;
        o.avgFinishSum += d.avgFinish * keptCount;
        o.avgFinishCount += keptCount;
      });
    });

    const overallStandings = Object.values(overallMap)
      .map(d => ({
        ...d,
        avgFinish: d.avgFinishCount > 0
          ? parseFloat((d.avgFinishSum / d.avgFinishCount).toFixed(1))
          : 0,
        dropsUsed: DROPS_ALLOWED,
        raceByRace: d.raceByRace.sort((a, b) => a.raceNum - b.raceNum),
      }))
      .filter(d => d.racesEntered > 0)
      .sort((a, b) => b.points - a.points);

    return { stages, overallStandings };
  }, [allResults, drivers]);

  // ─── Derive the "active" standings (default: first stage with data) ───
  // Also provide a flat "standings" for backward compatibility
  const standings = useMemo(() => {
    if (!stageData) return null;
    const stageKeys = Object.keys(stageData.stages);
    if (stageKeys.length === 0) return null;
    // Return stage 1 standings as default
    return stageData.stages[stageKeys[0]]?.standings || null;
  }, [stageData]);

  const stageBonusTracker = useMemo(() => {
    if (!stageData) return null;
    const stageKeys = Object.keys(stageData.stages);
    if (stageKeys.length === 0) return null;
    return stageData.stages[stageKeys[0]]?.bonusTracker || null;
  }, [stageData]);

  // Team standings (computed from overall)
  const teamStandings = useMemo(() => {
    if (!stageData?.overallStandings || !teams) return null;

    return teams.map(team => {
      const teamDrivers = stageData.overallStandings.filter(d => d.teamId === team.id);
      const totalPoints = teamDrivers.reduce((s, d) => s + d.points, 0);
      const totalLapsLed = teamDrivers.reduce((s, d) => s + d.lapsLed, 0);
      const totalWins = teamDrivers.reduce((s, d) => s + d.wins, 0);
      const totalIncidents = teamDrivers.reduce((s, d) => s + d.totalIncidents, 0);

      return {
        id: team.id,
        name: team.name,
        drivers: teamDrivers,
        points: totalPoints,
        lapsLed: totalLapsLed,
        wins: totalWins,
        incidents: totalIncidents,
      };
    }).sort((a, b) => b.points - a.points);
  }, [stageData, teams]);

  return {
    standings,          // backward compat: stage 1 standings
    teamStandings,
    stageBonusTracker,  // backward compat: stage 1 bonuses
    stageData,          // NEW: { stages: { [stageId]: { standings, bonusTracker } }, overallStandings }
    loading: rLoading || dLoading,
    error: rError,
  };
}

/**
 * Compute per-race results grouped by race (for Results page).
 */
export function useRaceResultsByRace() {
  const { data: allResults, loading: rLoading, error: rError } = useAllRaceResults();
  const { data: races, loading: racesLoading } = useRaces();
  const { data: schedule, loading: schedLoading } = useSchedule();

  const raceResults = useMemo(() => {
    if (!allResults || !races) return null;

    // Build a map from race_id → youtube_url from schedule
    const youtubeMap = {};
    if (schedule) {
      schedule.forEach(s => {
        if (s.race_id && s.youtube_url) {
          youtubeMap[s.race_id] = s.youtube_url;
        }
      });
    }

    return races
      .filter(race => race.status === 'completed')
      .map(race => {
        const results = allResults
          .filter(r => r.race_id === race.id)
          .sort((a, b) => a.finish_position - b.finish_position);

        const fastestResult = results.reduce((best, r) => {
          if (!r.fastest_lap_time) return best;
          if (!best || r.fastest_lap_time < best.fastest_lap_time) return r;
          return best;
        }, null);

        return {
          id: race.id,
          raceNumber: race.race_number,
          track: race.track_name,
          date: race.race_date,
          series: race.series,
          totalLaps: race.total_laps,
          stageId: race.stage_id,
          stageName: race.stages?.name || '',
          youtubeUrl: youtubeMap[race.id] || null,
          fastestLap: fastestResult ? {
            driver: fastestResult.drivers?.name,
            time: fastestResult.fastest_lap_time,
          } : null,
          results: results.map(r => ({
            id: r.driver_id,
            name: r.drivers?.name || 'Unknown',
            number: r.car_number || r.drivers?.car_number,
            finishPosition: r.finish_position,
            startPosition: r.start_position,
            lapsLed: r.laps_led || 0,
            incidents: r.incidents || 0,
            bestLap: r.fastest_lap_time,
            posPoints: r.race_points || 0,
            bonusPoints: r.bonus_points || 0,
            penalty: r.penalty_points || 0,
            totalPoints: r.total_points || 0,
          })),
        };
      })
      .sort((a, b) => a.raceNumber - b.raceNumber);
  }, [allResults, races, schedule]);

  return { data: raceResults, loading: rLoading || racesLoading || schedLoading, error: rError };
}

// Legacy aliases
export function useStandings(stageId) {
  const { standings, loading, error } = useComputedStandings();
  return { data: standings, loading, error };
}

export function useTeamStandings(stageId) {
  const { teamStandings, loading, error } = useComputedStandings();
  return { data: teamStandings, loading, error };
}

// ─── Pick'em hooks ────────────────────────────────────────────

/**
 * Fetch all picks for a specific race
 */
export function usePickemPicks(raceId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!raceId) { setData(null); setLoading(false); return; }

    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pickem_picks')
          .select('*')
          .eq('race_id', raceId)
          .order('picker_id')
          .order('pick_position', { ascending: true });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [raceId, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);
  return { data, loading, error, refresh };
}

/**
 * Fetch ALL picks across all races (for leaderboard)
 */
export function useAllPickemPicks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pickem_picks')
          .select('*')
          .order('race_id')
          .order('picker_id')
          .order('pick_position', { ascending: true });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Submit picks for a race (upserts — replaces existing picks)
 */
export async function submitPickemPicks(raceId, pickerId, picks) {
  // picks = [{ position: 1, driverId: '...' }, ...]
  // Delete existing picks for this picker+race first
  const { error: delError } = await supabase
    .from('pickem_picks')
    .delete()
    .eq('race_id', raceId)
    .eq('picker_id', pickerId);

  if (delError) throw delError;

  // Insert new picks
  const rows = picks.map((p) => ({
    race_id: raceId,
    picker_id: pickerId,
    pick_position: p.position,
    picked_driver_id: p.driverId,
  }));

  const { error: insError } = await supabase
    .from('pickem_picks')
    .insert(rows);

  if (insError) throw insError;
  return true;
}

// ── Interview Hooks ──

/**
 * Fetch all interview questions (with driver info), optionally filtered by schedule_id
 */
export function useInterviews(scheduleId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('interview_questions')
        .select('*, drivers ( id, name, car_number, nickname )')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (scheduleId) query = query.eq('schedule_id', scheduleId);

      const { data, error } = await query;
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [scheduleId]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Fetch interview questions for a specific driver
 */
export function useDriverInterviews(driverId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!driverId) { setData(null); setLoading(false); return; }

      const { data, error } = await supabase
        .from('interview_questions')
        .select('*, drivers ( id, name, car_number, nickname )')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [driverId]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Fetch ALL interview questions (admin — includes unpublished)
 */
export function useAllInterviews() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*, drivers ( id, name, car_number, nickname )')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
}

/**
 * Submit an interview answer (driver submits their response)
 */
export async function submitInterviewAnswer(questionId, answerText) {
  const { error } = await supabase
    .from('interview_questions')
    .update({
      answer_text: answerText,
      answered_at: new Date().toISOString(),
    })
    .eq('id', questionId);

  if (error) throw error;
  return true;
}

// ─── Fantasy Draft hooks ─────────────────────────────────────

/**
 * Fetch fantasy lineups for a specific race
 */
export function useFantasyLineups(raceId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!raceId) { setData(null); setLoading(false); return; }

    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('fantasy_lineups')
          .select('*')
          .eq('race_id', raceId)
          .order('picker_id')
          .order('salary', { ascending: false });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [raceId, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);
  return { data, loading, error, refresh };
}

/**
 * Fetch ALL fantasy lineups across all races (for leaderboard)
 */
export function useAllFantasyLineups() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('fantasy_lineups')
          .select('*')
          .order('race_id')
          .order('picker_id')
          .order('salary', { ascending: false });

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Submit a fantasy lineup for a race (upserts — replaces existing lineup)
 * lineup = [{ driverId: '...', salary: 5800 }, ...]
 */
export async function submitFantasyLineup(raceId, pickerId, lineup) {
  // Delete existing lineup for this picker+race
  const { error: delError } = await supabase
    .from('fantasy_lineups')
    .delete()
    .eq('race_id', raceId)
    .eq('picker_id', pickerId);

  if (delError) throw delError;

  // Insert new lineup
  const rows = lineup.map((entry) => ({
    race_id: raceId,
    picker_id: pickerId,
    driver_id: entry.driverId,
    salary: entry.salary,
  }));

  const { error: insError } = await supabase
    .from('fantasy_lineups')
    .insert(rows);

  if (insError) throw insError;
  return true;
}

// ─── Podcast hooks ───────────────────────────────────────────

/**
 * Fetch published podcasts ordered by episode number descending.
 */
export function usePodcasts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPodcasts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('podcasts')
          .select('*')
          .eq('published', true)
          .order('episode_number', { ascending: false });

        if (error) throw error;
        setData(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPodcasts();
  }, []);

  return { data, loading, error };
}
