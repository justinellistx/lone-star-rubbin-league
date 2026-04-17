import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, CheckCircle, Trophy, BarChart3, Users, ChevronDown, Lock } from 'lucide-react';
import {
  useDrivers,
  useRaceResultsByRace,
  useSchedule,
  useRaces,
  usePickemPicks,
  useAllPickemPicks,
  submitPickemPicks,
} from '../hooks/useSupabase';

const POSITION_LABELS = [
  { key: 1, label: '1st Place', emoji: '\u{1F947}' },
  { key: 2, label: '2nd Place', emoji: '\u{1F948}' },
  { key: 3, label: '3rd Place', emoji: '\u{1F949}' },
  { key: 4, label: '4th Place', emoji: '4\uFE0F\u20E3' },
  { key: 5, label: '5th Place', emoji: '5\uFE0F\u20E3' },
];

export default function Pickem() {
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: raceResultsData, loading: racesLoading } = useRaceResultsByRace();
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);
  const { data: allRaces, loading: allRacesLoading } = useRaces();
  const { data: allPicksData, loading: allPicksLoading } = useAllPickemPicks();

  // Picker identity
  const [pickerId, setPickerId] = useState('');

  // Find next upcoming race
  const nextRace = useMemo(() => {
    if (!schedule) return null;
    return schedule.find((r) => r.status === 'upcoming') || null;
  }, [schedule]);

  const nextRaceId = nextRace?.id || null;
  const nextTrackName = nextRace?.track_name || 'Next Race';

  // Picks for the current race
  const { data: racePicksData, loading: picksLoading, refresh: refreshPicks } = usePickemPicks(nextRaceId);

  // Local pick state
  const [picks, setPicks] = useState({ 1: '', 2: '', 3: '', 4: '', 5: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('picks'); // 'picks' | 'percentages' | 'leaderboard'

  // Load existing picks for this picker when they select themselves
  useEffect(() => {
    if (!pickerId || !racePicksData) return;
    const myPicks = racePicksData.filter((p) => p.picker_id === pickerId);
    if (myPicks.length > 0) {
      const loaded = { 1: '', 2: '', 3: '', 4: '', 5: '' };
      myPicks.forEach((p) => {
        loaded[p.pick_position] = p.picked_driver_id;
      });
      setPicks(loaded);
      setSubmitted(true);
    } else {
      setPicks({ 1: '', 2: '', 3: '', 4: '', 5: '' });
      setSubmitted(false);
    }
  }, [pickerId, racePicksData]);

  // ── Percentage calculations ──
  const percentages = useMemo(() => {
    if (!racePicksData || !drivers) return {};
    // Group: position -> driverId -> count
    const posMap = {};
    const pickerCounts = new Set(racePicksData.map((p) => p.picker_id)).size;

    for (let pos = 1; pos <= 5; pos++) {
      const positionPicks = racePicksData.filter((p) => p.pick_position === pos);
      const driverCounts = {};
      positionPicks.forEach((p) => {
        driverCounts[p.picked_driver_id] = (driverCounts[p.picked_driver_id] || 0) + 1;
      });
      // Convert to percentage and sort
      const entries = Object.entries(driverCounts)
        .map(([driverId, count]) => ({
          driverId,
          count,
          pct: pickerCounts > 0 ? Math.round((count / pickerCounts) * 100) : 0,
        }))
        .sort((a, b) => b.pct - a.pct);
      posMap[pos] = entries;
    }
    return { positions: posMap, totalPickers: pickerCounts };
  }, [racePicksData, drivers]);

  // ── Leaderboard calculations ──
  const leaderboard = useMemo(() => {
    if (!allPicksData || !raceResultsData || !drivers || !allRaces) return [];

    // Build schedule_id -> races_id mapping (picks use schedule IDs, results use races IDs)
    const scheduleToRaceId = {};
    if (schedule) {
      schedule.forEach((s) => {
        if (s.race_id) scheduleToRaceId[s.id] = s.race_id;
      });
    }

    // Build a quick lookup: racesTableId -> driverId -> finishPosition
    const finishMap = {};
    if (raceResultsData) {
      raceResultsData.forEach((race) => {
        if (race.results) {
          finishMap[race.id] = {};
          race.results.forEach((r) => {
            finishMap[race.id][r.id] = r.finishPosition;
          });
        }
      });
    }

    // Score each picker
    const pickerScores = {};
    allPicksData.forEach((pick) => {
      const { picker_id, race_id: scheduleId, pick_position, picked_driver_id } = pick;

      // Map schedule ID to races table ID for result lookup
      const racesId = scheduleToRaceId[scheduleId];
      if (!racesId || !finishMap[racesId]) return;

      if (!pickerScores[picker_id]) {
        pickerScores[picker_id] = { total: 0, exact: 0, close: 0, racesPlayed: new Set() };
      }

      pickerScores[picker_id].racesPlayed.add(scheduleId);

      const actualPosition = finishMap[racesId][picked_driver_id];
      if (actualPosition === undefined) return;

      if (actualPosition === pick_position) {
        // Exact match: 3 points
        pickerScores[picker_id].total += 3;
        pickerScores[picker_id].exact += 1;
      } else if (Math.abs(actualPosition - pick_position) === 1) {
        // Within 1 position: 1 point
        pickerScores[picker_id].total += 1;
        pickerScores[picker_id].close += 1;
      }
    });

    // Convert to sorted array
    return Object.entries(pickerScores)
      .map(([driverId, scores]) => ({
        driverId,
        total: scores.total,
        exact: scores.exact,
        close: scores.close,
        racesPlayed: scores.racesPlayed.size,
      }))
      .sort((a, b) => b.total - a.total);
  }, [allPicksData, raceResultsData, drivers, allRaces, schedule]);

  // ── Helpers ──
  const getDriverName = (id) => drivers?.find((d) => d.id === id)?.name || 'Unknown';
  const getDriverNumber = (id) => drivers?.find((d) => d.id === id)?.car_number || '?';
  const getDriverNickname = (id) => drivers?.find((d) => d.id === id)?.nickname || '';

  const handlePickChange = (position, value) => {
    setPicks((prev) => ({ ...prev, [position]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!pickerId) { setError('Please select who you are first'); return; }
    if (!nextRaceId) { setError('No upcoming race found'); return; }

    const selected = Object.values(picks).filter((v) => v !== '');
    if (selected.length < 5) { setError('Please fill all 5 positions'); return; }
    if (new Set(selected).size !== 5) { setError('Cannot pick the same driver twice'); return; }

    setSubmitting(true);
    setError('');
    try {
      const pickArray = Object.entries(picks).map(([pos, driverId]) => ({
        position: parseInt(pos),
        driverId,
      }));
      await submitPickemPicks(nextRaceId, pickerId, pickArray);
      setSubmitted(true);
      refreshPicks();
    } catch (err) {
      setError(err.message || 'Failed to submit picks');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePicks = () => {
    setSubmitted(false);
  };

  // ── Loading ──
  const isLoading = driversLoading || racesLoading || scheduleLoading || allRacesLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <p className="text-[#6c6d6f]">Loading Pick'em...</p>
      </div>
    );
  }

  // ── Last race results for reference ──
  const lastRace = raceResultsData && raceResultsData.length > 0
    ? raceResultsData[raceResultsData.length - 1]
    : null;

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-[#131313] mb-2">PICK'EM</h1>
          <p className="text-[#6c6d6f] text-lg">
            {nextRace ? `Predict the top 5 for ${nextTrackName}` : 'No upcoming race scheduled'}
          </p>
        </div>

        {/* Picker Identity */}
        <div className="mb-6 bg-white border border-[#e0e0e0] rounded-lg p-5">
          <label className="block text-sm font-bold text-[#d00000] uppercase mb-2">
            Who are you?
          </label>
          <select
            value={pickerId}
            onChange={(e) => setPickerId(e.target.value)}
            className="w-full md:w-80 px-4 py-3 rounded-lg bg-[#f5f5f5] border border-[#e0e0e0] text-[#131313] focus:outline-none focus:border-[#d00000] transition"
          >
            <option value="">Select your name...</option>
            {drivers?.map((d) => (
              <option key={d.id} value={d.id}>
                #{d.car_number} {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-[#e0e0e0]">
          {[
            { key: 'picks', label: 'My Picks', icon: CheckCircle },
            { key: 'percentages', label: 'Who\'s Picking Who', icon: BarChart3 },
            { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition ${
                activeTab === key
                  ? 'bg-[#d00000] text-[#0a0a0f]'
                  : 'text-[#6c6d6f] hover:text-[#131313]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-white border border-[#e63946] rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-[#cc0000] flex-shrink-0" />
            <p className="text-[#cc0000] text-sm">{error}</p>
          </div>
        )}

        {/* ═══ TAB: My Picks ═══ */}
        {activeTab === 'picks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#d00000] mb-6">
                  {submitted ? 'Your Picks' : 'Make Your Picks'}
                  {nextRace && <span className="text-[#6c6d6f] font-normal text-base ml-2">— {nextTrackName}</span>}
                </h2>

                {!pickerId ? (
                  <p className="text-[#6c6d6f] py-8 text-center">Select who you are above to make picks.</p>
                ) : !nextRace ? (
                  <p className="text-[#6c6d6f] py-8 text-center">No upcoming race to pick for.</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {POSITION_LABELS.map((pos) => (
                        <div key={pos.key}>
                          <label className="block text-sm font-bold text-[#008564] mb-2">
                            {pos.emoji} {pos.label}
                          </label>
                          {submitted ? (
                            <div className="px-4 py-3 rounded-lg bg-[#f5f5f5] border border-[#e0e0e0] text-[#131313] font-medium flex items-center gap-2">
                              <Lock size={14} className="text-[#6c6d6f]" />
                              #{getDriverNumber(picks[pos.key])} {getDriverName(picks[pos.key])}
                            </div>
                          ) : (
                            <select
                              value={picks[pos.key]}
                              onChange={(e) => handlePickChange(pos.key, e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-[#f5f5f5] border transition focus:outline-none focus:border-[#d00000]"
                              style={{
                                borderColor: picks[pos.key] ? '#2ec4b6' : '#2a2a3e',
                                color: picks[pos.key] ? '#ffffff' : '#8a8a9a',
                              }}
                            >
                              <option value="">Select a driver...</option>
                              {drivers?.map((driver) => {
                                const isSelected = Object.values(picks).includes(driver.id);
                                const isCurrentSelection = picks[pos.key] === driver.id;
                                return (
                                  <option
                                    key={driver.id}
                                    value={driver.id}
                                    disabled={isSelected && !isCurrentSelection}
                                  >
                                    #{driver.car_number} {driver.name}
                                    {isSelected && !isCurrentSelection ? ' (already picked)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {submitted ? (
                        <button
                          onClick={handleChangePicks}
                          className="flex-1 px-6 py-3 rounded-lg font-bold bg-[#2a2a3e] text-[#131313] hover:bg-[#3a3a4e] transition"
                        >
                          Change Picks
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="flex-1 px-6 py-3 rounded-lg font-bold text-[#0a0a0f] bg-[#d00000] hover:bg-[#e59b1a] disabled:opacity-50 transition flex items-center justify-center gap-2"
                        >
                          {submitting ? 'Submitting...' : (
                            <>
                              <CheckCircle size={18} />
                              Lock In Picks
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Last Race Results sidebar */}
            <div>
              {lastRace && lastRace.results && (
                <div className="bg-white border border-[#e0e0e0] rounded-lg p-5">
                  <h3 className="text-sm font-bold text-[#d00000] uppercase mb-4">
                    Last Race: {lastRace.track}
                  </h3>
                  <div className="space-y-2">
                    {lastRace.results.slice(0, 5).map((result, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded bg-[#f5f5f5]"
                      >
                        <div className="w-7 h-7 flex items-center justify-center rounded bg-[#d00000] text-[#0a0a0f] text-xs font-bold">
                          {result.position}
                        </div>
                        <div>
                          <div className="text-[#131313] text-sm font-medium">{result.name}</div>
                          <div className="text-[#6c6d6f] text-xs">#{result.car_number}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB: Percentages ═══ */}
        {activeTab === 'percentages' && (
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#d00000]">
                Who's Picking Who — {nextTrackName}
              </h2>
              <div className="flex items-center gap-2 text-[#6c6d6f] text-sm">
                <Users size={16} />
                {percentages.totalPickers || 0} picker{percentages.totalPickers !== 1 ? 's' : ''}
              </div>
            </div>

            {!percentages.totalPickers ? (
              <p className="text-[#6c6d6f] text-center py-8">
                No picks submitted yet. Be the first!
              </p>
            ) : (
              <div className="space-y-8">
                {POSITION_LABELS.map((pos) => {
                  const posData = percentages.positions?.[pos.key] || [];
                  return (
                    <div key={pos.key}>
                      <h3 className="text-sm font-bold text-[#008564] mb-3">
                        {pos.emoji} {pos.label}
                      </h3>
                      {posData.length === 0 ? (
                        <p className="text-[#6c6d6f] text-sm">No picks for this position</p>
                      ) : (
                        <div className="space-y-2">
                          {posData.map((entry) => (
                            <div key={entry.driverId} className="flex items-center gap-3">
                              <div className="w-32 md:w-48 text-[#131313] text-sm font-medium truncate">
                                #{getDriverNumber(entry.driverId)} {getDriverName(entry.driverId)}
                              </div>
                              <div className="flex-1 bg-[#f5f5f5] rounded-full h-6 overflow-hidden">
                                <div
                                  className="h-full rounded-full flex items-center px-2 transition-all duration-500"
                                  style={{
                                    width: `${Math.max(entry.pct, 8)}%`,
                                    backgroundColor: entry.pct >= 50 ? '#f5a623' : entry.pct >= 25 ? '#2ec4b6' : '#2a2a3e',
                                  }}
                                >
                                  <span className="text-xs font-bold text-[#131313] whitespace-nowrap">
                                    {entry.pct}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-[#6c6d6f] text-xs w-16 text-right">
                                {entry.count} pick{entry.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: Leaderboard ═══ */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
            <div className="p-6 border-b border-[#e0e0e0]">
              <h2 className="text-xl font-bold text-[#d00000]">Season Leaderboard</h2>
              <p className="text-[#6c6d6f] text-sm mt-1">
                Exact position = 3 pts | Within 1 spot = 1 pt
              </p>
            </div>

            {allPicksLoading ? (
              <div className="p-8 text-center text-[#6c6d6f]">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy size={48} className="text-[#2a2a3e] mx-auto mb-4" />
                <p className="text-[#6c6d6f]">No scored picks yet. Leaderboard populates after races are completed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f5f5f5]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#6c6d6f] uppercase">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#6c6d6f] uppercase">Picker</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-[#6c6d6f] uppercase">Exact</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-[#6c6d6f] uppercase">Close</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-[#6c6d6f] uppercase">Races</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-[#6c6d6f] uppercase">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => (
                      <tr
                        key={entry.driverId}
                        className="border-t border-[#e0e0e0] hover:bg-[#f0f0f0] transition"
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                              idx === 0
                                ? 'bg-[#d00000] text-[#0a0a0f]'
                                : idx === 1
                                ? 'bg-[#c0c0c0] text-[#0a0a0f]'
                                : idx === 2
                                ? 'bg-[#cd7f32] text-[#0a0a0f]'
                                : 'bg-[#2a2a3e] text-[#131313]'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#131313]">{getDriverName(entry.driverId)}</div>
                          <div className="text-[#6c6d6f] text-xs">
                            #{getDriverNumber(entry.driverId)}
                            {getDriverNickname(entry.driverId) && ` \u2022 "${getDriverNickname(entry.driverId)}"`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[#008564] font-bold">{entry.exact}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[#d00000] font-bold">{entry.close}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-[#6c6d6f]">{entry.racesPlayed}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-2xl font-black text-[#131313]">{entry.total}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
