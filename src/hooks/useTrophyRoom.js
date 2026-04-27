import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetch all trophy entries (race winner images + custom quotes)
 */
export function useTrophyEntries() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trophy_entries')
        .select('*, drivers ( id, name, car_number, nickname ), races ( id, race_number, track_name )')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  return { data, loading, error, refresh: fetchData };
}

/**
 * Fetch stage champion trophies
 */
export function useStageTrophies() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('trophy_stage_champions')
          .select('*, drivers ( id, name, car_number ), teams ( id, name ), stages ( id, stage_number, name )')
          .order('created_at', { ascending: true });

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
 * Fetch cup champions
 */
export function useCupChampions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('trophy_cup_champions')
          .select('*, drivers ( id, name, car_number, nickname )')
          .order('season_year', { ascending: false });

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
 * Upload a trophy image to Supabase storage
 * @param {File} file - Image file
 * @param {string} raceNumber - Race number for naming
 * @returns {string} Public URL of uploaded image
 */
export async function uploadTrophyImage(file, raceNumber) {
  const ext = file.name.split('.').pop();
  const filePath = `race-${raceNumber}-winner.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('trophies')
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage
    .from('trophies')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upsert a trophy entry (race winner image + quote)
 */
export async function upsertTrophyEntry(raceId, driverId, imageUrl, customQuote, trophyName) {
  const { data, error } = await supabase
    .from('trophy_entries')
    .upsert({
      race_id: raceId,
      driver_id: driverId,
      image_url: imageUrl,
      custom_quote: customQuote || null,
      trophy_name: trophyName || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'race_id,driver_id' })
    .select();

  if (error) throw error;
  return data;
}
