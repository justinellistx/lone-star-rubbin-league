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
 * Returns sorted standings with full stats.
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

  const standings = useMemo(() => {
    if (!allResults || !drivers) return null;

    const driverMap = {};
    drivers.forEach(d => {
      driverMap[d.id] = {
        id: d.id,
        name: d.name,
        number: d.car_number,
        nickname: d.nickname,
        team: d.teams?.name || '',
        teamId: d.team_id,
        races: [],
      };
    });

    allResults.forEach(r => {
      if (!driverMap[r.driver_id]) return;
      driverMap[r.driver_id].races.push(r);
    });

    const result = Object.values(driverMap).map(d => {
      const races = d.races;
      const totalPoints = races.reduce((s, r) => s + (r.total_points || 0), 0);
      const posPoints = races.reduce((s, r) => s + (r.race_points || 0), 0);
      const bonusPoints = races.reduce((s, r) => s + (r.bonus_points || 0), 0);
      const penaltyPoints = races.reduce((s, r) => s + (r.penalty_points || 0), 0);
      const wins = races.filter(r => r.finish_position === 1).length;
      const top5 = races.filter(r => r.finish_position <= 5).length;
      const top10 = races.filter(r => r.finish_position <= 10).length;
      const lapsLed = races.reduce((s, r) => s + (r.laps_led || 0), 0);
      const totalIncidents = races.reduce((s, r) => s + (r.incidents || 0), 0);
      const avgFinish = races.length > 0
        ? races.reduce((s, r) => s + r.finish_position, 0) / races.length
        : 0;

      // Per-race data for charts / head-to-head
      const raceByRace = races
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
        }));

      return {
        id: d.id,
        name: d.name,
        number: d.number,
        nickname: d.nickname,
        team: d.team,
        teamId: d.teamId,
        points: totalPoints,
        posPoints,
        bonusPoints,
        penaltyPoints,
        wins,
        top5,
        top10,
        lapsLed,
        totalIncidents,
        avgFinish: parseFloat(avgFinish.toFixed(1)),
        racesEntered: races.length,
        raceByRace,
      };
    })
    .filter(d => d.racesEntered > 0)
    .sort((a, b) => b.points - a.points);

    return result;
  }, [allResults, drivers]);

  const teamStandings = useMemo(() => {
    if (!standings || !teams) return null;

    return teams.map(team => {
      const teamDrivers = standings.filter(d => d.teamId === team.id);
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
  }, [standings, teams]);

  // Stage bonus tracker
  const stageBonusTracker = useMemo(() => {
    if (!standings) return null;

    const mostLapsLed = standings.reduce((best, d) =>
      d.lapsLed > (best?.lapsLed || 0) ? d : best, standings[0]);
    const lowestIncidents = standings.reduce((best, d) =>
      d.totalIncidents < (best?.totalIncidents || Infinity) ? d : best, standings[0]);

    // Count fastest lap awards per driver
    const fastestLapCounts = {};
    if (allResults) {
      // Group results by race
      const byRace = {};
      allResults.forEach(r => {
        if (!byRace[r.race_id]) byRace[r.race_id] = [];
        byRace[r.race_id].push(r);
      });

      Object.values(byRace).forEach(raceResults => {
        const fastest = raceResults.reduce((best, r) => {
          if (!r.fastest_lap_time) return best;
          if (!best || r.fastest_lap_time < best.fastest_lap_time) return r;
          return best;
        }, null);
        if (fastest) {
          const name = fastest.drivers?.name || 'Unknown';
          fastestLapCounts[name] = (fastestLapCounts[name] || 0) + 1;
        }
      });
    }

    const maxFastestLaps = Math.max(...Object.values(fastestLapCounts), 0);
    const fastestLapLeaders = Object.entries(fastestLapCounts)
      .filter(([, count]) => count === maxFastestLaps);

    return {
      racesCompleted: standings[0]?.raceByRace?.length || 0,
      totalRaces: 12,
      mostLapsLed: { name: mostLapsLed?.name, value: mostLapsLed?.lapsLed || 0 },
      lowestIncidents: { name: lowestIncidents?.name, value: lowestIncidents?.totalIncidents || 0 },
      mostFastestLaps: {
        leaders: fastestLapLeaders.map(([name]) => name),
        value: maxFastestLaps,
        isTied: fastestLapLeaders.length > 1,
      },
    };
  }, [standings, allResults]);

  return {
    standings,
    teamStandings,
    stageBonusTracker,
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

  const raceResults = useMemo(() => {
    if (!allResults || !races) return null;

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
  }, [allResults, races]);

  return { data: raceResults, loading: rLoading || racesLoading, error: rError };
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
