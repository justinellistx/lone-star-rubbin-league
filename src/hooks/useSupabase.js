import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetch driver standings for a specific stage
 * @param {string} stageId - Stage UUID
 * @returns {Object} { data, loading, error }
 */
export function useStandings(stageId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stageId) {
      setData(null);
      setLoading(false);
      return;
    }

    async function fetchStandings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('driver_standings')
          .select('*')
          .eq('stage_id', stageId)
          .order('position', { ascending: true });

        if (error) throw error;
        setData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, [stageId]);

  return { data, loading, error };
}

/**
 * Fetch race results for a specific race with driver info
 * @param {string} raceId - Race UUID
 * @returns {Object} { data, loading, error }
 */
export function useRaceResults(raceId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!raceId) {
      setData(null);
      setLoading(false);
      return;
    }

    async function fetchResults() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('race_results')
          .select(
            `
            *,
            drivers (
              id,
              name,
              number,
              team_id
            )
          `
          )
          .eq('race_id', raceId)
          .order('finish_position', { ascending: true });

        if (error) throw error;
        setData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [raceId]);

  return { data, loading, error };
}

/**
 * Fetch all races for a specific stage
 * @param {string} stageId - Stage UUID
 * @returns {Object} { data, loading, error }
 */
export function useRaces(stageId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stageId) {
      setData(null);
      setLoading(false);
      return;
    }

    async function fetchRaces() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('races')
          .select('*')
          .eq('stage_id', stageId)
          .order('race_date', { ascending: true });

        if (error) throw error;
        setData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRaces();
  }, [stageId]);

  return { data, loading, error };
}

/**
 * Fetch all active drivers
 * @returns {Object} { data, loading, error }
 */
export function useDrivers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        setData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDrivers();
  }, []);

  return { data, loading, error };
}

/**
 * Fetch team standings for a specific stage
 * @param {string} stageId - Stage UUID
 * @returns {Object} { data, loading, error }
 */
export function useTeamStandings(stageId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stageId) {
      setData(null);
      setLoading(false);
      return;
    }

    async function fetchTeamStandings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('team_standings')
          .select('*')
          .eq('stage_id', stageId)
          .order('position', { ascending: true });

        if (error) throw error;
        setData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamStandings();
  }, [stageId]);

  return { data, loading, error };
}

/**
 * Fetch schedule entries for a season
 * @param {string} seasonId - Season UUID
 * @returns {Object} { data, loading, error }
 */
export function useSchedule(seasonId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!seasonId) {
      setData(null);
      setLoading(false);
      return;
    }

    async function fetchSchedule() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('schedule')
          .select(
            `
            *,
            races (
              id,
              race_date,
              track,
              series
            )
          `
          )
          .eq('season_id', seasonId)
          .order('race_date', { ascending: true });

        if (error) throw error;
        setData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [seasonId]);

  return { data, loading, error };
}

/**
 * Fetch latest published news
 * @param {number} limit - Number of news items to fetch (default: 10)
 * @returns {Object} { data, loading, error }
 */
export function useNews(limit = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNews() {
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
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [limit]);

  return { data, loading, error };
}

/**
 * Fetch single driver with their race results across all races
 * @param {string} driverId - Driver UUID
 * @returns {Object} { data, loading, error }
 */
export function useDriver(driverId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) {
      setData(null);
      setLoading(false);
      return;
    }

    async function fetchDriver() {
      try {
        setLoading(true);

        // Fetch driver info
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', driverId)
          .single();

        if (driverError) throw driverError;

        // Fetch all race results for this driver
        const { data: raceResults, error: resultsError } = await supabase
          .from('race_results')
          .select(
            `
            *,
            races (
              id,
              race_date,
              track,
              series,
              stage_id
            )
          `
          )
          .eq('driver_id', driverId)
          .order('races(race_date)', { ascending: false });

        if (resultsError) throw resultsError;

        setData({
          ...driverData,
          raceResults,
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDriver();
  }, [driverId]);

  return { data, loading, error };
}
