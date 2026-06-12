import React, { useState } from 'react';
import { ChevronDown, Youtube } from 'lucide-react';
import { useRaceResultsByRace } from '../hooks/useSupabase';
import TrackIcon from '../components/TrackIcon';

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/**
 * Derive bonus labels from race data.
 * Uses stored bonusPoints to verify — if a bonus (like fastest lap) wasn't
 * actually awarded (e.g., an AI car had the real fastest lap), the label won't show.
 */
function computeBonusLabels(result, race, allResults) {
  const bonuses = [];
  let expectedBonus = 0;

  // Pole: startPosition === 1
  if (result.startPosition === 1) {
    bonuses.push({ label: 'Pole' });
    expectedBonus += 2;
  }

  // Most Led: highest lapsLed in this race
  if (allResults && result.lapsLed > 0) {
    const maxLapsLed = Math.max(...allResults.map(r => r.lapsLed || 0));
    if (result.lapsLed === maxLapsLed) {
      bonuses.push({ label: 'Most Led' });
      expectedBonus += 2;
    }
  }

  // Low Inc: lowest incidents in this race (or tied)
  if (allResults) {
    const minIncidents = Math.min(...allResults.map(r => r.incidents || 0));
    if (result.incidents === minIncidents) {
      const tiedCount = allResults.filter(r => r.incidents === minIncidents).length;
      bonuses.push({ label: 'Low Inc' });
      expectedBonus += 2 / tiedCount;
    }
  }

  // Fast Lap: only show if the driver's actual bonusPoints exceeds what we can
  // account for from pole + most led + low inc. This means the fastest lap bonus
  // was actually awarded (i.e., a human had the overall fastest lap, not an AI car).
  if (race.fastestLap && result.bestLap === race.fastestLap.time) {
    const actualBonus = result.bonusPoints || 0;
    if (actualBonus > expectedBonus + 0.01) {
      bonuses.push({ label: 'Fast Lap' });
    }
  }

  return bonuses;
}

export default function Results() {
  const { data: races, loading, error } = useRaceResultsByRace();
  const [expandedRaceId, setExpandedRaceId] = useState(null);

  const toggleExpanded = (raceId) => {
    setExpandedRaceId(expandedRaceId === raceId ? null : raceId);
  };

  // Set first race as expanded on initial load
  React.useEffect(() => {
    if (races && races.length > 0 && !expandedRaceId) {
      setExpandedRaceId(races[0].id);
    }
  }, [races, expandedRaceId]);

  return (
    <div className="bg-[#ffffff] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-[#1a1a2e] mb-2">RACE RESULTS</h1>
          <p className="text-[#6c6d6f] text-lg">2026 Season Results</p>
        </div>

        {/* Stage Selector */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
          <button
            className="px-6 py-3 rounded font-bold whitespace-nowrap transition bg-[#003DA5] text-[#1a1a2e]"
          >
            All Stages
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-12 text-center">
            <p className="text-[#6c6d6f] text-lg">Loading race results...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white border border-[#c8102e] rounded-lg p-8 text-center">
            <p className="text-[#c8102e] font-semibold">Error loading race results</p>
            <p className="text-[#6c6d6f] text-sm mt-2">{error}</p>
          </div>
        )}

        {/* Races List */}
        {!loading && !error && (
          <div className="space-y-6">
            {races && races.length > 0 ? (
              races.map((race) => (
                <div
                  key={race.id}
                  className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden"
                >
                  {/* Race Header */}
                  <button
                    onClick={() => toggleExpanded(race.id)}
                    className="w-full px-6 py-6 flex items-center justify-between hover:bg-[#f7f7f7] transition"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <TrackIcon track={race.track} size={48} />
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-[#003DA5] font-bold text-sm">Race #{race.raceNumber}</span>
                          <h3 className="text-2xl font-bold text-[#1a1a2e]">{race.track}</h3>
                        </div>
                      <div className="flex items-center gap-2 text-[#6c6d6f]">
                        <span>
                        {new Date(race.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {race.series}
                        </span>
                        {race.youtubeUrl && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ff0000] bg-[#fff0f0] px-2 py-0.5 rounded">
                            <Youtube size={12} /> HIGHLIGHTS
                          </span>
                        )}
                      </div>
                      </div>
                    </div>
                    <ChevronDown
                      size={24}
                      className={`text-[#003DA5] transition ${expandedRaceId === race.id ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Race Details - Expanded */}
                  {expandedRaceId === race.id && (
                    <div className="border-t border-[#e0e0e0] bg-[#ffffff]">
                      {/* YouTube Highlights Embed */}
                      {race.youtubeUrl && extractVideoId(race.youtubeUrl) && (
                        <div className="px-6 py-6 border-b border-[#e0e0e0] bg-[#f7f7f7]">
                          <h4 className="text-[#1a1a2e] font-bold mb-3 flex items-center gap-2">
                            <Youtube size={18} className="text-[#ff0000]" />
                            Race Highlights
                          </h4>
                          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              src={`https://www.youtube.com/embed/${extractVideoId(race.youtubeUrl)}`}
                              title={`${race.track} Race ${race.raceNumber} Highlights`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full rounded-lg"
                              style={{ border: 'none' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Race Stats */}
                      <div className="px-6 py-6 border-b border-[#e0e0e0]">
                        <h4 className="text-[#1a1a2e] font-bold mb-4">Race Stats</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <div className="text-[#6c6d6f] text-sm uppercase mb-2">Total Laps</div>
                            <div className="text-2xl font-bold text-[#1a1a2e]">{race.totalLaps}</div>
                          </div>
                          <div>
                            <div className="text-[#6c6d6f] text-sm uppercase mb-2">Total Drivers</div>
                            <div className="text-2xl font-bold text-[#1a1a2e]">{race.results?.length || '—'}</div>
                          </div>
                          <div>
                            <div className="text-[#6c6d6f] text-sm uppercase mb-2">Series</div>
                            <div className="text-2xl font-bold text-[#003DA5]">{race.series}</div>
                          </div>
                          {race.fastestLap && (
                            <div>
                              <div className="text-[#6c6d6f] text-sm uppercase mb-2">Fastest Lap (League)</div>
                              <div className="text-2xl font-bold text-[#008564]">{race.fastestLap.time}s</div>
                              <div className="text-sm text-[#6c6d6f]">{race.fastestLap.driver}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Race Results Table */}
                      <div className="px-6 py-6">
                        <h4 className="text-[#1a1a2e] font-bold mb-4">Final Results</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#e0e0e0]">
                                <th className="px-4 py-3 text-left text-[#6c6d6f] text-xs font-bold uppercase">
                                  Fin
                                </th>
                                <th className="px-4 py-3 text-left text-[#6c6d6f] text-xs font-bold uppercase">
                                  Start
                                </th>
                                <th className="px-4 py-3 text-left text-[#6c6d6f] text-xs font-bold uppercase">
                                  Driver
                                </th>
                                <th className="px-4 py-3 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                                  Laps Led
                                </th>
                                <th className="px-4 py-3 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                                  Incidents
                                </th>
                                <th className="px-4 py-3 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                                  Best Lap
                                </th>
                                <th className="px-4 py-3 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                                  Points
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {race.results.map((result) => {
                                const bonuses = computeBonusLabels(result, race, race.results);
                                const totalPts = (result.posPoints || 0) + (result.bonusPoints || 0) + (result.stagePoints || 0) + (result.penalty || 0);
                                return (
                                <tr
                                  key={result.id}
                                  className="border-b border-[#e0e0e0] hover:bg-[#f7f7f7] transition"
                                >
                                  <td className="px-4 py-3">
                                    <div
                                      className={`flex items-center justify-center w-8 h-8 rounded font-bold ${
                                        result.finishPosition === 1
                                          ? 'bg-[#003DA5] text-[#1a1a2e]'
                                          : 'bg-[#e0e0e0] text-[#1a1a2e]'
                                      }`}
                                    >
                                      {result.finishPosition}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-[#1a1a2e] font-semibold">
                                    {result.startPosition}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-[#1a1a2e]">{result.name}</div>
                                    <div className="text-sm text-[#6c6d6f]">#{result.number}</div>
                                  </td>
                                  <td className="px-4 py-3 text-right text-[#008564] font-semibold">
                                    {result.lapsLed}
                                  </td>
                                  <td className="px-4 py-3 text-right text-[#c8102e] font-semibold">
                                    {result.incidents}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold">
                                    {result.bestLap ? (
                                      <span className={result.bestLap === race.fastestLap?.time ? 'text-[#008564]' : 'text-[#1a1a2e]'}>
                                        {result.bestLap}s
                                        {result.bestLap === race.fastestLap?.time && ' ⚡'}
                                      </span>
                                    ) : '—'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="text-[#003DA5] font-bold">{totalPts}</div>
                                    <div className="text-xs text-[#6c6d6f]">
                                      {result.posPoints}p
                                      {result.bonusPoints > 0 && (
                                        <span className="text-[#008564]"> +{result.bonusPoints}</span>
                                      )}
                                      {result.stagePoints > 0 && (
                                        <span className="text-[#f5a623]"> +{result.stagePoints} stg</span>
                                      )}
                                      {result.penalty < 0 && (
                                        <span className="text-[#c8102e]"> {result.penalty}</span>
                                      )}
                                    </div>
                                    {(bonuses.length > 0 || result.stagePoints > 0) && (
                                      <div className="text-xs mt-1">
                                        {bonuses.map((b, i) => (
                                          <span key={i} className="inline-block bg-[#008564]/10 text-[#008564] rounded px-1 mr-1 mb-0.5">
                                            {b.label}
                                          </span>
                                        ))}
                                        {result.stagePoints > 0 && (
                                          <span className="inline-block bg-[#f5a623]/15 text-[#b8860b] rounded px-1 mr-1 mb-0.5">
                                            Stage +{result.stagePoints}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {result.penalty < 0 && (
                                      <div className="text-xs mt-1">
                                        <span className="inline-block bg-[#c8102e]/10 text-[#c8102e] rounded px-1">
                                          {result.incidents >= 40 ? '40+ inc' : result.incidents >= 30 ? '30+ inc' : '20+ inc'}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center">
                <p className="text-[#6c6d6f]">No race results available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
