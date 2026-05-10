import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Youtube,
  Save,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Video,
  Trash2,
} from 'lucide-react';

export default function ManageHighlights() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState({});
  const [urls, setUrls] = useState({});

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('schedule')
        .select('id, race_number, track_name, status, race_date, youtube_url')
        .order('race_number', { ascending: false });
      if (fetchErr) throw fetchErr;
      setRaces(data || []);
      // Initialize URL state from existing data
      const urlMap = {};
      (data || []).forEach((r) => {
        urlMap[r.id] = r.youtube_url || '';
      });
      setUrls(urlMap);
    } catch (err) {
      setError('Failed to load races: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSave = async (raceId) => {
    try {
      setSaving((prev) => ({ ...prev, [raceId]: true }));
      setError('');

      const url = urls[raceId]?.trim() || null;

      // Validate URL if provided
      if (url && !extractVideoId(url)) {
        setError('Invalid YouTube URL. Use a standard youtube.com or youtu.be link.');
        setSaving((prev) => ({ ...prev, [raceId]: false }));
        return;
      }

      const { error: updateErr } = await supabase
        .from('schedule')
        .update({ youtube_url: url })
        .eq('id', raceId);

      if (updateErr) throw updateErr;

      // Update local state
      setRaces((prev) =>
        prev.map((r) => (r.id === raceId ? { ...r, youtube_url: url } : r))
      );
      setSuccess('Saved!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [raceId]: false }));
    }
  };

  const handleClear = async (raceId) => {
    setUrls((prev) => ({ ...prev, [raceId]: '' }));
    try {
      setSaving((prev) => ({ ...prev, [raceId]: true }));
      const { error: updateErr } = await supabase
        .from('schedule')
        .update({ youtube_url: null })
        .eq('id', raceId);
      if (updateErr) throw updateErr;
      setRaces((prev) =>
        prev.map((r) => (r.id === raceId ? { ...r, youtube_url: null } : r))
      );
      setSuccess('Cleared!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to clear: ' + err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [raceId]: false }));
    }
  };

  const completedRaces = races.filter((r) => r.status === 'completed');
  const upcomingRaces = races.filter((r) => r.status !== 'completed');
  const linkedCount = completedRaces.filter((r) => r.youtube_url).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Youtube className="w-8 h-8 text-[#ff0000]" />
          <h1 className="text-3xl font-bold text-white">Manage Highlights</h1>
        </div>
        <p className="text-[#8a8a9a]">
          Add YouTube highlight video links for each race. These will appear as
          embedded players on the Results page and as links throughout the site.
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-[#8a8a9a]">
            <span className="text-white font-bold">{linkedCount}</span> of{' '}
            <span className="text-white font-bold">{completedRaces.length}</span>{' '}
            races have highlights
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-[#1a0a0a] border border-[#c8102e] rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#c8102e] flex-shrink-0" />
          <p className="text-[#c8102e]">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-[#0a1a0a] border border-[#008564] rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#008564] flex-shrink-0" />
          <p className="text-[#008564]">{success}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 text-[#f5a623] animate-spin mx-auto mb-3" />
          <p className="text-[#8a8a9a]">Loading races...</p>
        </div>
      )}

      {/* Completed Races */}
      {!loading && (
        <>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-[#f5a623]" />
            Completed Races
          </h2>
          <div className="space-y-3 mb-10">
            {completedRaces.map((race) => {
              const videoId = extractVideoId(urls[race.id]);
              const hasUrl = !!race.youtube_url;

              return (
                <div
                  key={race.id}
                  className={`bg-[#14141f] border rounded-lg p-5 ${
                    hasUrl ? 'border-[#008564]' : 'border-[#2a2a3e]'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[#f5a623] font-bold text-sm">
                        Race #{race.race_number}
                      </span>
                      <span className="text-white font-bold text-lg">
                        {race.track_name}
                      </span>
                      {race.race_date && (
                        <span className="text-[#8a8a9a] text-sm">
                          {new Date(race.race_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    {hasUrl && (
                      <span className="text-xs bg-[#008564] text-white px-2 py-1 rounded font-bold">
                        LINKED
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={urls[race.id] || ''}
                      onChange={(e) =>
                        setUrls((prev) => ({ ...prev, [race.id]: e.target.value }))
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#f5a623]"
                    />
                    <button
                      onClick={() => handleSave(race.id)}
                      disabled={saving[race.id]}
                      className="px-4 py-2.5 bg-[#f5a623] text-[#0a0a0f] rounded-lg font-bold text-sm hover:bg-[#e09000] transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving[race.id] ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    {hasUrl && (
                      <>
                        <a
                          href={race.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-[#8a8a9a] hover:text-white transition flex items-center"
                          title="Open in YouTube"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleClear(race.id)}
                          className="px-3 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-[#8a8a9a] hover:text-[#c8102e] transition flex items-center"
                          title="Remove link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Preview thumbnail */}
                  {videoId && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-[#2a2a3e]">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={`${race.track_name} highlights`}
                        className="w-full max-w-sm h-auto"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upcoming Races (read-only) */}
          {upcomingRaces.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-[#8a8a9a] mb-4">
                Upcoming Races
              </h2>
              <div className="space-y-2">
                {upcomingRaces.map((race) => (
                  <div
                    key={race.id}
                    className="bg-[#14141f] border border-[#1a1a2e] rounded-lg p-4 opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#555] font-bold text-sm">
                        Race #{race.race_number}
                      </span>
                      <span className="text-[#555] font-bold">
                        {race.track_name}
                      </span>
                      <span className="text-xs text-[#444] ml-auto">
                        Available after race completes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
