import React, { useState, useMemo } from 'react';
import {
  Trophy, Image, Upload, Sparkles, Check, AlertCircle,
  RefreshCw, Trash2, Eye, Star,
} from 'lucide-react';
import {
  useDrivers,
  useRaceResultsByRace,
  useSchedule,
  useInterviews,
} from '../../hooks/useSupabase';
import { useTrophyEntries, uploadTrophyImage, upsertTrophyEntry } from '../../hooks/useTrophyRoom';
import { supabase } from '../../lib/supabase';

// Trophy names by track
const TROPHY_NAMES = {
  'Daytona': 'The Harley J. Earl Trophy',
  'Atlanta': 'The Atlanta Motor Speedway Cup',
  'COTA': 'The Lone Star Grand Prix Trophy',
  'Phoenix': 'The Desert Diamond Trophy',
  'Las Vegas': 'The Neon Garage Trophy',
  'Darlington': 'The Southern 500 Trophy',
  'Martinsville': 'The Grandfather Clock',
  'Bristol': 'The Thunder Valley Sword',
  'Kansas': 'The Hollywood Casino Trophy',
  'Talladega': 'The Yellawood 500 Trophy',
  'Texas': 'The Texas Motor Speedway Six Shooter',
  'Watkins Glen': 'The Sahlen\'s Cup',
};

export default function ManageTrophyRoom() {
  const { data: races, loading: racesLoading } = useRaceResultsByRace();
  const { data: drivers } = useDrivers();
  const { data: schedule } = useSchedule(null);
  const { data: allInterviews } = useInterviews();
  const { data: trophyEntries, loading: trophiesLoading, refresh: refreshTrophies } = useTrophyEntries();

  const [generating, setGenerating] = useState(null); // race ID currently generating
  const [uploading, setUploading] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteText, setQuoteText] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Map schedule_id to race_id
  const scheduleToRaceId = useMemo(() => {
    if (!schedule) return {};
    const map = {};
    schedule.forEach((s) => { if (s.race_id) map[s.id] = s.race_id; });
    return map;
  }, [schedule]);

  const raceIdToScheduleId = useMemo(() => {
    const map = {};
    Object.entries(scheduleToRaceId).forEach(([sId, rId]) => { map[rId] = sId; });
    return map;
  }, [scheduleToRaceId]);

  // Build race winner list
  const raceWinners = useMemo(() => {
    if (!races) return [];
    return races
      .filter((race) => race.results?.length > 0)
      .sort((a, b) => a.raceNumber - b.raceNumber)
      .map((race) => {
        const results = race.results.sort((a, b) => a.finishPosition - b.finishPosition);
        const winner = results[0];
        if (!winner) return null;

        const existing = trophyEntries?.find((t) => t.race_id === race.id);
        const schedId = raceIdToScheduleId[race.id];
        let autoQuote = null;
        if (allInterviews && schedId) {
          const interview = allInterviews.find(
            (i) => i.driver_id === winner.id && i.schedule_id === schedId && i.answer_text
          );
          if (interview) {
            autoQuote = interview.answer_text.length > 200
              ? interview.answer_text.slice(0, 200).trim() + '...'
              : interview.answer_text;
          }
        }

        return {
          raceId: race.id,
          raceNumber: race.raceNumber,
          track: race.track,
          winner: { id: winner.id, name: winner.name, carNumber: winner.number },
          trophyName: TROPHY_NAMES[race.track] || `The ${race.track} Trophy`,
          existing,
          autoQuote,
          lapsLed: winner.lapsLed || 0,
          incidents: winner.incidents || 0,
        };
      })
      .filter(Boolean);
  }, [races, trophyEntries, allInterviews, raceIdToScheduleId]);

  // Handle file upload
  const handleFileUpload = async (raceId, winnerId, raceNumber, file) => {
    setUploading(raceId);
    setError('');
    try {
      const imageUrl = await uploadTrophyImage(file, raceNumber);
      const race = raceWinners.find((r) => r.raceId === raceId);
      await upsertTrophyEntry(raceId, winnerId, imageUrl, race?.existing?.custom_quote, race?.trophyName);
      setSuccess(`Image uploaded for Race ${raceNumber}!`);
      refreshTrophies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  // Handle URL input
  const handleUrlSubmit = async (raceId, winnerId, raceNumber) => {
    if (!imageUrlInput.trim()) return;
    setUploading(raceId);
    setError('');
    try {
      const race = raceWinners.find((r) => r.raceId === raceId);
      await upsertTrophyEntry(raceId, winnerId, imageUrlInput.trim(), race?.existing?.custom_quote, race?.trophyName);
      setSuccess(`Image URL saved for Race ${raceNumber}!`);
      setImageUrlInput('');
      setShowUrlInput(null);
      refreshTrophies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setUploading(null);
    }
  };

  // Handle custom quote save
  const handleQuoteSave = async (raceId, winnerId, raceNumber) => {
    setError('');
    try {
      const race = raceWinners.find((r) => r.raceId === raceId);
      await upsertTrophyEntry(
        raceId, winnerId,
        race?.existing?.image_url || null,
        quoteText.trim() || null,
        race?.trophyName
      );
      setSuccess(`Quote saved for Race ${raceNumber}!`);
      setEditingQuote(null);
      setQuoteText('');
      refreshTrophies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Save failed');
    }
  };

  // Generate AI image prompt
  const getAIPrompt = (race) => {
    return `A cartoon-style illustration of a race car driver holding a trophy in victory lane. ` +
      `The driver wears a racing suit with the number ${race.winner.carNumber}. ` +
      `The trophy is "${race.trophyName}". ` +
      `The background shows ${race.track} speedway with confetti falling. ` +
      `Style: vibrant, celebratory, NASCAR victory lane, cartoon/comic book art style with bold outlines. ` +
      `No text or words in the image.`;
  };

  // Handle AI generation (opens prompt for user to copy)
  const handleGenerateAI = (race) => {
    const prompt = getAIPrompt(race);
    navigator.clipboard.writeText(prompt).then(() => {
      setSuccess(`AI prompt copied to clipboard for Race ${race.raceNumber}! Paste into DALL-E, Midjourney, or your preferred AI image tool.`);
      setTimeout(() => setSuccess(''), 6000);
    }).catch(() => {
      // Fallback: show prompt in alert
      setGenerating(race.raceId);
    });
  };

  // Delete trophy entry
  const handleDelete = async (entryId, raceNumber) => {
    if (!window.confirm(`Remove trophy image for Race ${raceNumber}?`)) return;
    try {
      const { error } = await supabase
        .from('trophy_entries')
        .delete()
        .eq('id', entryId);
      if (error) throw error;
      setSuccess(`Trophy entry removed for Race ${raceNumber}`);
      refreshTrophies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  if (racesLoading || trophiesLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-[#8a8a9a]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Trophy size={28} className="text-[#f5a623]" />
          Trophy Room Management
        </h1>
        <p className="text-[#8a8a9a]">
          Manage trophy images, AI-generated artwork, and winner quotes for each race.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-[#1a0a0a] border border-[#e63946] rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-[#e63946]" />
          <p className="text-[#e63946] text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-[#e63946] hover:text-white">×</button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-[#0a1a0a] border border-[#2ec4b6] rounded-lg flex items-center gap-3">
          <Check size={20} className="text-[#2ec4b6]" />
          <p className="text-[#2ec4b6] text-sm">{success}</p>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-4 text-center">
          <div className="text-[#f5a623] text-2xl font-black">{raceWinners.length}</div>
          <div className="text-[#8a8a9a] text-xs">Races Completed</div>
        </div>
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-4 text-center">
          <div className="text-[#2ec4b6] text-2xl font-black">
            {trophyEntries?.filter((t) => t.image_url).length || 0}
          </div>
          <div className="text-[#8a8a9a] text-xs">Images Added</div>
        </div>
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-4 text-center">
          <div className="text-[#e63946] text-2xl font-black">
            {raceWinners.length - (trophyEntries?.filter((t) => t.image_url).length || 0)}
          </div>
          <div className="text-[#8a8a9a] text-xs">Missing Images</div>
        </div>
      </div>

      {/* Race Winner Cards */}
      <div className="space-y-4">
        {raceWinners.map((race) => (
          <div key={race.raceId} className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  {race.existing?.image_url ? (
                    <img
                      src={race.existing.image_url}
                      alt={`Race ${race.raceNumber} winner`}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-[#f5a623]/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-[#1a1a2e] border-2 border-dashed border-[#2a2a3e] flex flex-col items-center justify-center">
                      <Image size={24} className="text-[#8a8a9a]/40 mb-1" />
                      <span className="text-[#8a8a9a]/40 text-[10px]">No image</span>
                    </div>
                  )}
                </div>

                {/* Race Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-[#f5a623] text-[#0a0a0f] text-xs font-black px-2 py-0.5 rounded">
                      RACE {race.raceNumber}
                    </span>
                    <h3 className="text-white font-bold">{race.track}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#f5a623] font-bold">Winner:</span>
                    <span className="text-white">#{race.winner.carNumber} {race.winner.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#8a8a9a]">
                    <span>Laps Led: {race.lapsLed}</span>
                    <span>Incidents: {race.incidents}x</span>
                    <span className="italic text-[#f5a623]/60">{race.trophyName}</span>
                  </div>

                  {/* Auto-pulled quote preview */}
                  {(race.existing?.custom_quote || race.autoQuote) && (
                    <div className="mt-2 text-xs text-[#8a8a9a] italic bg-[#1a1a2e] rounded p-2">
                      "{(race.existing?.custom_quote || race.autoQuote).slice(0, 120)}..."
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Generate AI Image */}
                  <button
                    onClick={() => handleGenerateAI(race)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f5a623]/10 text-[#f5a623] hover:bg-[#f5a623]/20 text-xs font-bold transition"
                  >
                    <Sparkles size={14} />
                    AI Prompt
                  </button>

                  {/* Upload Image */}
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2ec4b6]/10 text-[#2ec4b6] hover:bg-[#2ec4b6]/20 text-xs font-bold transition cursor-pointer">
                    <Upload size={14} />
                    {uploading === race.raceId ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(race.raceId, race.winner.id, race.raceNumber, file);
                      }}
                    />
                  </label>

                  {/* Paste URL */}
                  <button
                    onClick={() => {
                      setShowUrlInput(showUrlInput === race.raceId ? null : race.raceId);
                      setImageUrlInput(race.existing?.image_url || '');
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a2e] text-[#8a8a9a] hover:text-white text-xs font-bold transition"
                  >
                    <Image size={14} />
                    URL
                  </button>

                  {/* Edit Quote */}
                  <button
                    onClick={() => {
                      setEditingQuote(editingQuote === race.raceId ? null : race.raceId);
                      setQuoteText(race.existing?.custom_quote || race.autoQuote || '');
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a2e] text-[#8a8a9a] hover:text-white text-xs font-bold transition"
                  >
                    ✏️ Quote
                  </button>

                  {/* Delete */}
                  {race.existing && (
                    <button
                      onClick={() => handleDelete(race.existing.id, race.raceNumber)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#e63946]/10 text-[#e63946] hover:bg-[#e63946]/20 text-xs font-bold transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* URL Input Expanded */}
              {showUrlInput === race.raceId && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Paste image URL here..."
                    className="flex-1 px-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-white text-sm focus:outline-none focus:border-[#f5a623]"
                  />
                  <button
                    onClick={() => handleUrlSubmit(race.raceId, race.winner.id, race.raceNumber)}
                    disabled={uploading === race.raceId}
                    className="px-4 py-2 bg-[#2ec4b6] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#26a69a] transition"
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Quote Editor Expanded */}
              {editingQuote === race.raceId && (
                <div className="mt-4">
                  <textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    rows={3}
                    placeholder="Winner's post-race quote..."
                    className="w-full px-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-white text-sm focus:outline-none focus:border-[#f5a623] resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleQuoteSave(race.raceId, race.winner.id, race.raceNumber)}
                      className="px-4 py-2 bg-[#2ec4b6] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#26a69a] transition"
                    >
                      Save Quote
                    </button>
                    <button
                      onClick={() => { setEditingQuote(null); setQuoteText(''); }}
                      className="px-4 py-2 bg-[#1a1a2e] text-[#8a8a9a] font-bold text-sm rounded-lg hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* AI Prompt Display (fallback if clipboard fails) */}
              {generating === race.raceId && (
                <div className="mt-4 p-4 bg-[#1a1a2e] rounded-lg border border-[#f5a623]/20">
                  <p className="text-[#f5a623] text-xs font-bold mb-2">AI IMAGE PROMPT — Copy and paste into DALL-E / Midjourney:</p>
                  <p className="text-white text-sm bg-[#0a0a0f] p-3 rounded font-mono select-all">
                    {getAIPrompt(race)}
                  </p>
                  <button
                    onClick={() => setGenerating(null)}
                    className="mt-2 text-[#8a8a9a] text-xs hover:text-white"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Trophy Room Link */}
      <div className="mt-8 text-center">
        <a
          href="/trophy-room"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5a623] text-[#0a0a0f] font-bold rounded-lg hover:bg-[#e0951e] transition"
        >
          <Eye size={18} />
          View Trophy Room
        </a>
      </div>
    </div>
  );
}
