import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign, Users, Trophy, TrendingUp, Zap, AlertCircle,
  CheckCircle, Lock, ChevronDown, Star, Target, Award, BarChart3,
} from 'lucide-react';
import {
  useDrivers,
  useAllRaceResults,
  useRaceResultsByRace,
  useSchedule,
  useRaces,
  useFantasyLineups,
  useAllFantasyLineups,
  submitFantasyLineup,
} from '../hooks/useSupabase';

// ─── Constants ───────────────────────────────────────────────
const SALARY_CAP = 10000;
const ROSTER_SIZE = 3;
const MAX_SALARY = 6000;
const MIN_SALARY = 1800;

// Fantasy scoring rules
const SCORING = {
  WIN: 10,
  TOP_3: 7,
  TOP_5: 5,
  TOP_8: 3,
  TOP_10: 1,
  OUTSIDE_TOP_10: -2,
  LAPS_LED_PER: 0.25,
  INCIDENT_PER: -0.10,
  FASTEST_LAP: 5,
};

// ─── Salary Calculation Engine ───────────────────────────────
/**
 * Compute driver salaries from historical race data.
 * Better performers = higher salary. Cap at $6,000, floor at $1,800.
 * Uses composite of: avg finish, win rate, laps led, incident rate.
 */
function computeSalaries(drivers, allResults) {
  if (!drivers || !allResults || allResults.length === 0) return {};

  const driverStats = {};
  drivers.forEach((d) => {
    const results = allResults.filter((r) => r.driver_id === d.id);
    if (results.length === 0) {
      driverStats[d.id] = { avgFinish: 9, winRate: 0, avgLapsLed: 0, avgIncidents: 20, races: 0 };
      return;
    }

    const avgFinish = results.reduce((s, r) => s + (r.finish_position || 9), 0) / results.length;
    const wins = results.filter((r) => r.finish_position === 1).length;
    const winRate = wins / results.length;
    const avgLapsLed = results.reduce((s, r) => s + (r.laps_led || 0), 0) / results.length;
    const avgIncidents = results.reduce((s, r) => s + (r.incidents || 0), 0) / results.length;

    driverStats[d.id] = { avgFinish, winRate, avgLapsLed, avgIncidents, races: results.length };
  });

  // Normalize each metric to 0-1 (higher = better)
  const allStats = Object.values(driverStats);
  const maxAvgFinish = Math.max(...allStats.map((s) => s.avgFinish));
  const minAvgFinish = Math.min(...allStats.map((s) => s.avgFinish));
  const maxWinRate = Math.max(...allStats.map((s) => s.winRate), 0.01);
  const maxLapsLed = Math.max(...allStats.map((s) => s.avgLapsLed), 1);
  const maxIncidents = Math.max(...allStats.map((s) => s.avgIncidents), 1);

  const scores = {};
  Object.entries(driverStats).forEach(([driverId, stats]) => {
    // Lower avg finish = better (invert)
    const finishScore = maxAvgFinish === minAvgFinish ? 0.5 :
      (maxAvgFinish - stats.avgFinish) / (maxAvgFinish - minAvgFinish);
    const winScore = stats.winRate / maxWinRate;
    const lapsScore = stats.avgLapsLed / maxLapsLed;
    // Lower incidents = better (invert)
    const incidentScore = 1 - (stats.avgIncidents / maxIncidents);

    // Weighted composite
    scores[driverId] = (finishScore * 0.40) + (winScore * 0.25) + (lapsScore * 0.20) + (incidentScore * 0.15);
  });

  // Rank by composite score and assign salaries
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const count = ranked.length;
  const salaries = {};

  ranked.forEach(([driverId], idx) => {
    if (count === 1) {
      salaries[driverId] = MAX_SALARY;
    } else {
      // Linear spread from MAX to MIN
      const ratio = idx / (count - 1);
      const raw = MAX_SALARY - ratio * (MAX_SALARY - MIN_SALARY);
      // Round to nearest 100
      salaries[driverId] = Math.round(raw / 100) * 100;
    }
  });

  return salaries;
}

// ─── Scoring Engine ──────────────────────────────────────────
/**
 * Compute fantasy points for a single driver in a single race.
 * Returns breakdown object.
 */
function scoreDriver(raceResult, allRaceResults) {
  if (!raceResult) return { finish: 0, lapsLed: 0, incidents: 0, fastestLap: 0, total: 0 };

  const pos = raceResult.finishPosition || raceResult.finish_position;
  const lapsLed = raceResult.lapsLed || raceResult.laps_led || 0;
  const incidents = raceResult.incidents || 0;

  // Position scoring (highest tier only, not stacking)
  let finishPts = 0;
  if (pos === 1) finishPts = SCORING.WIN;
  else if (pos <= 3) finishPts = SCORING.TOP_3;
  else if (pos <= 5) finishPts = SCORING.TOP_5;
  else if (pos <= 8) finishPts = SCORING.TOP_8;
  else if (pos <= 10) finishPts = SCORING.TOP_10;
  else finishPts = SCORING.OUTSIDE_TOP_10;

  // Laps led
  const lapsLedPts = lapsLed * SCORING.LAPS_LED_PER;

  // Incidents
  const incidentPts = incidents * SCORING.INCIDENT_PER;

  // Fastest lap — check if this driver had the fastest lap in the race
  let fastestLapPts = 0;
  if (allRaceResults && allRaceResults.length > 0) {
    const fastestTime = allRaceResults.reduce((best, r) => {
      const t = r.fastest_lap_time || r.bestLap;
      if (!t) return best;
      if (!best || t < best) return t;
      return best;
    }, null);

    const driverTime = raceResult.fastest_lap_time || raceResult.bestLap;
    if (fastestTime && driverTime && driverTime === fastestTime) {
      fastestLapPts = SCORING.FASTEST_LAP;
    }
  }

  const total = finishPts + lapsLedPts + incidentPts + fastestLapPts;

  return {
    finish: finishPts,
    lapsLed: parseFloat(lapsLedPts.toFixed(2)),
    incidents: parseFloat(incidentPts.toFixed(2)),
    fastestLap: fastestLapPts,
    total: parseFloat(total.toFixed(2)),
  };
}

// ─── Component ───────────────────────────────────────────────
export default function FantasyDraft({ pickerId, nextRace, drivers }) {
  const { data: allResults } = useAllRaceResults();
  const { data: raceResultsData } = useRaceResultsByRace();
  const { data: schedule } = useSchedule(null);
  const { data: allRaces } = useRaces();
  const { data: allFantasyData } = useAllFantasyLineups();

  const nextRaceId = nextRace?.id || null;
  const { data: raceLineupsData, loading: lineupsLoading, refresh: refreshLineups } = useFantasyLineups(nextRaceId);

  // Sub-tab state
  const [subTab, setSubTab] = useState('lineup'); // 'lineup' | 'results' | 'leaderboard'
  const [selectedRoster, setSelectedRoster] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [selectedResultRace, setSelectedResultRace] = useState('latest');

  // ── Compute salaries from all race data ──
  const salaries = useMemo(() => {
    return computeSalaries(drivers, allResults);
  }, [drivers, allResults]);

  // ── Driver salary cards sorted by salary desc ──
  const driverCards = useMemo(() => {
    if (!drivers) return [];
    return drivers
      .map((d) => ({
        ...d,
        salary: salaries[d.id] || MIN_SALARY,
      }))
      .sort((a, b) => b.salary - a.salary);
  }, [drivers, salaries]);

  // ── Load existing lineup for this picker ──
  useEffect(() => {
    if (!pickerId || !raceLineupsData) return;
    const myLineup = raceLineupsData.filter((l) => l.picker_id === pickerId);
    if (myLineup.length > 0) {
      setSelectedRoster(myLineup.map((l) => ({ driverId: l.driver_id, salary: l.salary })));
      setSubmitted(true);
    } else {
      setSelectedRoster([]);
      setSubmitted(false);
    }
  }, [pickerId, raceLineupsData]);

  // ── Remaining salary ──
  const usedSalary = selectedRoster.reduce((s, r) => s + r.salary, 0);
  const remainingSalary = SALARY_CAP - usedSalary;

  // ── Helper functions ──
  const getDriverName = (id) => drivers?.find((d) => d.id === id)?.name || 'Unknown';
  const getDriverNumber = (id) => drivers?.find((d) => d.id === id)?.car_number || '?';
  const getDriverNickname = (id) => drivers?.find((d) => d.id === id)?.nickname || '';

  const isInRoster = (driverId) => selectedRoster.some((r) => r.driverId === driverId);

  const canAfford = (salary) => {
    if (selectedRoster.length >= ROSTER_SIZE) return false;
    return salary <= remainingSalary;
  };

  const addToRoster = (driverId, salary) => {
    if (submitted) return;
    if (isInRoster(driverId)) return;
    if (selectedRoster.length >= ROSTER_SIZE) return;
    if (salary > remainingSalary) return;
    setSelectedRoster((prev) => [...prev, { driverId, salary }]);
    setError('');
  };

  const removeFromRoster = (driverId) => {
    if (submitted) return;
    setSelectedRoster((prev) => prev.filter((r) => r.driverId !== driverId));
  };

  const handleSubmit = async () => {
    if (!pickerId) { setError('Please select who you are first'); return; }
    if (!nextRaceId) { setError('No upcoming race found'); return; }
    if (selectedRoster.length !== ROSTER_SIZE) { setError(`Select exactly ${ROSTER_SIZE} drivers`); return; }
    if (usedSalary > SALARY_CAP) { setError('Lineup exceeds salary cap'); return; }

    setSubmitting(true);
    setError('');
    try {
      await submitFantasyLineup(nextRaceId, pickerId, selectedRoster);
      setSubmitted(true);
      refreshLineups();
    } catch (err) {
      setError(err.message || 'Failed to submit lineup');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeLineup = () => {
    setSubmitted(false);
  };

  // ── Schedule-to-race mapping (picks use schedule IDs, results use race IDs) ──
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

  // ── Build race results lookup for scoring ──
  const raceResultsMap = useMemo(() => {
    if (!raceResultsData) return {};
    const map = {};
    raceResultsData.forEach((race) => {
      map[race.id] = race;
    });
    return map;
  }, [raceResultsData]);

  // ── Completed races for results tab ──
  const completedRaces = useMemo(() => {
    if (!raceResultsData) return [];
    return raceResultsData.filter((r) => r.results && r.results.length > 0)
      .sort((a, b) => b.raceNumber - a.raceNumber);
  }, [raceResultsData]);

  // ── Score all fantasy lineups across all races ──
  const allScoredLineups = useMemo(() => {
    if (!allFantasyData || !raceResultsData || !schedule) return [];

    const scored = [];

    // Group lineups by race_id + picker_id
    const grouped = {};
    allFantasyData.forEach((entry) => {
      const key = `${entry.race_id}_${entry.picker_id}`;
      if (!grouped[key]) grouped[key] = { raceId: entry.race_id, pickerId: entry.picker_id, drivers: [] };
      grouped[key].drivers.push(entry);
    });

    Object.values(grouped).forEach((lineup) => {
      const racesTableId = scheduleToRaceId[lineup.raceId];
      const raceData = raceResultsMap[racesTableId];
      if (!raceData || !raceData.results) return;

      let lineupTotal = 0;
      const driverScores = lineup.drivers.map((entry) => {
        const result = raceData.results.find((r) => r.id === entry.driver_id);
        const score = scoreDriver(result, raceData.results);
        lineupTotal += score.total;
        return {
          driverId: entry.driver_id,
          salary: entry.salary,
          ...score,
        };
      });

      scored.push({
        raceId: lineup.raceId,
        racesTableId,
        pickerId: lineup.pickerId,
        raceNumber: raceData.raceNumber,
        track: raceData.track,
        driverScores,
        total: parseFloat(lineupTotal.toFixed(2)),
        totalSalary: lineup.drivers.reduce((s, d) => s + d.salary, 0),
      });
    });

    return scored;
  }, [allFantasyData, raceResultsData, schedule, scheduleToRaceId, raceResultsMap]);

  // ── Season Leaderboard ──
  const leaderboard = useMemo(() => {
    const pickerTotals = {};
    allScoredLineups.forEach((lineup) => {
      if (!pickerTotals[lineup.pickerId]) {
        pickerTotals[lineup.pickerId] = { total: 0, races: 0, bestWeek: -Infinity, worstWeek: Infinity };
      }
      pickerTotals[lineup.pickerId].total += lineup.total;
      pickerTotals[lineup.pickerId].races += 1;
      if (lineup.total > pickerTotals[lineup.pickerId].bestWeek) {
        pickerTotals[lineup.pickerId].bestWeek = lineup.total;
      }
      if (lineup.total < pickerTotals[lineup.pickerId].worstWeek) {
        pickerTotals[lineup.pickerId].worstWeek = lineup.total;
      }
    });

    return Object.entries(pickerTotals)
      .map(([pickerId, stats]) => ({
        pickerId,
        total: parseFloat(stats.total.toFixed(2)),
        races: stats.races,
        avg: parseFloat((stats.total / stats.races).toFixed(2)),
        bestWeek: stats.bestWeek === -Infinity ? 0 : parseFloat(stats.bestWeek.toFixed(2)),
        worstWeek: stats.worstWeek === Infinity ? 0 : parseFloat(stats.worstWeek.toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total);
  }, [allScoredLineups]);

  // ── Weekly Optimal Lineup Calculator ──
  const computeOptimalLineup = (raceData) => {
    if (!raceData || !raceData.results || !drivers) return null;

    // Score every driver in this race
    const driverScoresForRace = raceData.results.map((result) => {
      const score = scoreDriver(result, raceData.results);
      const salary = salaries[result.id] || MIN_SALARY;
      return { driverId: result.id, salary, ...score };
    });

    // Brute force best 3-driver combo under salary cap
    let bestCombo = null;
    let bestTotal = -Infinity;

    const n = driverScoresForRace.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          const combo = [driverScoresForRace[i], driverScoresForRace[j], driverScoresForRace[k]];
          const totalSal = combo.reduce((s, d) => s + d.salary, 0);
          const totalPts = combo.reduce((s, d) => s + d.total, 0);
          if (totalSal <= SALARY_CAP && totalPts > bestTotal) {
            bestTotal = totalPts;
            bestCombo = combo;
          }
        }
      }
    }

    return bestCombo ? {
      drivers: bestCombo,
      total: parseFloat(bestTotal.toFixed(2)),
      totalSalary: bestCombo.reduce((s, d) => s + d.salary, 0),
    } : null;
  };

  // ── Results for selected race ──
  const selectedRaceResults = useMemo(() => {
    if (completedRaces.length === 0) return null;
    if (selectedResultRace === 'latest') return completedRaces[0];
    return completedRaces.find((r) => r.id === selectedResultRace) || completedRaces[0];
  }, [completedRaces, selectedResultRace]);

  const selectedRaceFantasyResults = useMemo(() => {
    if (!selectedRaceResults) return { lineups: [], optimal: null };

    const schedId = raceIdToScheduleId[selectedRaceResults.id];
    const lineups = allScoredLineups.filter((l) => l.raceId === schedId);
    const optimal = computeOptimalLineup(selectedRaceResults);

    return { lineups: lineups.sort((a, b) => b.total - a.total), optimal };
  }, [selectedRaceResults, allScoredLineups, raceIdToScheduleId, salaries, drivers]);

  // ── Determine if lineups should be hidden (race not completed yet) ──
  const isNextRaceCompleted = useMemo(() => {
    if (!nextRace || !raceResultsData) return false;
    const schedId = nextRace.id;
    const racesId = scheduleToRaceId[schedId];
    return raceResultsData.some((r) => r.id === racesId);
  }, [nextRace, raceResultsData, scheduleToRaceId]);

  // Count lineups submitted for current race
  const currentRaceLineupCount = useMemo(() => {
    if (!raceLineupsData) return 0;
    const pickers = new Set(raceLineupsData.map((l) => l.picker_id));
    return pickers.size;
  }, [raceLineupsData]);

  return (
    <div>
      {/* Fantasy Sub-tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-[#e0e0e0]">
        {[
          { key: 'lineup', label: 'My Lineup', icon: DollarSign },
          { key: 'results', label: 'Results', icon: BarChart3 },
          { key: 'leaderboard', label: 'Standings', icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition ${
              subTab === key
                ? 'bg-[#008564] text-white'
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

      {/* ═══ SUB-TAB: My Lineup ═══ */}
      {subTab === 'lineup' && (
        <div>
          {/* Salary Cap Bar */}
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-[#008564]" />
                <span className="font-bold text-[#131313]">SALARY CAP</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#131313]">${remainingSalary.toLocaleString()}</span>
                <span className="text-[#6c6d6f] text-sm ml-1">/ ${SALARY_CAP.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-[#e0e0e0] rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(usedSalary / SALARY_CAP) * 100}%`,
                  backgroundColor: usedSalary > SALARY_CAP ? '#cc0000' : usedSalary > SALARY_CAP * 0.8 ? '#f5a623' : '#008564',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#6c6d6f]">
              <span>{selectedRoster.length}/{ROSTER_SIZE} drivers selected</span>
              <span>${usedSalary.toLocaleString()} used</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Roster */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#e0e0e0] rounded-lg p-5">
                <h3 className="text-sm font-bold text-[#d00000] uppercase mb-4">
                  {submitted ? 'Your Lineup' : 'Your Roster'}
                  {nextRace && <span className="text-[#6c6d6f] font-normal text-xs ml-2">— {nextRace.track_name}</span>}
                </h3>

                {selectedRoster.length === 0 ? (
                  <p className="text-[#6c6d6f] text-sm py-6 text-center">
                    Tap drivers to add them to your lineup
                  </p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {selectedRoster.map((entry, idx) => (
                      <div
                        key={entry.driverId}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#f5f5f5] border border-[#e0e0e0]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded bg-[#008564] text-white text-xs font-bold">
                            #{getDriverNumber(entry.driverId)}
                          </div>
                          <div>
                            <div className="text-[#131313] text-sm font-bold">{getDriverName(entry.driverId)}</div>
                            {getDriverNickname(entry.driverId) && (
                              <div className="text-[#6c6d6f] text-xs">"{getDriverNickname(entry.driverId)}"</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#008564] font-bold text-sm">${entry.salary.toLocaleString()}</span>
                          {!submitted && (
                            <button
                              onClick={() => removeFromRoster(entry.driverId)}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-[#cc0000] text-white text-xs font-bold hover:bg-[#a00000] transition"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit / Change button */}
                {pickerId && nextRace && (
                  <div>
                    {submitted ? (
                      <button
                        onClick={handleChangeLineup}
                        className="w-full px-4 py-3 rounded-lg font-bold bg-[#e0e0e0] text-[#131313] hover:bg-[#d0d0d0] transition flex items-center justify-center gap-2"
                      >
                        <Lock size={16} />
                        Change Lineup
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedRoster.length !== ROSTER_SIZE}
                        className="w-full px-4 py-3 rounded-lg font-bold text-white bg-[#008564] hover:bg-[#006a50] disabled:opacity-40 transition flex items-center justify-center gap-2"
                      >
                        {submitting ? 'Submitting...' : (
                          <>
                            <CheckCircle size={16} />
                            Lock In Lineup
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {!pickerId && (
                  <p className="text-[#6c6d6f] text-sm text-center py-2">
                    Select who you are above to set a lineup.
                  </p>
                )}

                {/* Lineup count */}
                <div className="mt-4 pt-3 border-t border-[#e0e0e0] text-center">
                  <p className="text-[#6c6d6f] text-xs">
                    <Users size={12} className="inline mr-1" />
                    {currentRaceLineupCount} lineup{currentRaceLineupCount !== 1 ? 's' : ''} submitted
                  </p>
                </div>
              </div>

              {/* Scoring Guide */}
              <div className="bg-white border border-[#e0e0e0] rounded-lg p-5 mt-4">
                <h3 className="text-sm font-bold text-[#d00000] uppercase mb-3">Scoring</h3>
                <div className="space-y-1 text-xs">
                  {[
                    { label: 'Win (P1)', value: `+${SCORING.WIN}`, color: '#008564' },
                    { label: 'Top 3 (P2-P3)', value: `+${SCORING.TOP_3}`, color: '#008564' },
                    { label: 'Top 5 (P4-P5)', value: `+${SCORING.TOP_5}`, color: '#008564' },
                    { label: 'Top 8 (P6-P8)', value: `+${SCORING.TOP_8}`, color: '#008564' },
                    { label: 'Top 10 (P9-P10)', value: `+${SCORING.TOP_10}`, color: '#6c6d6f' },
                    { label: 'Outside Top 10', value: `${SCORING.OUTSIDE_TOP_10}`, color: '#cc0000' },
                    { label: 'Fastest Lap', value: `+${SCORING.FASTEST_LAP}`, color: '#f5a623' },
                    { label: 'Per Lap Led', value: `+${SCORING.LAPS_LED_PER}`, color: '#008564' },
                    { label: 'Per Incident', value: `${SCORING.INCIDENT_PER}`, color: '#cc0000' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-1">
                      <span className="text-[#6c6d6f]">{item.label}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Driver Pool */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#e0e0e0] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#131313] uppercase">Driver Pool</h3>
                  <span className="text-xs text-[#6c6d6f]">
                    Salary Cap: ${SALARY_CAP.toLocaleString()} | Pick {ROSTER_SIZE}
                  </span>
                </div>

                <div className="divide-y divide-[#e0e0e0]">
                  {driverCards.map((driver) => {
                    const inRoster = isInRoster(driver.id);
                    const affordable = canAfford(driver.salary);
                    const disabled = submitted || inRoster || (!affordable && !inRoster);

                    // Quick stats
                    const driverResults = allResults?.filter((r) => r.driver_id === driver.id) || [];
                    const avgFinish = driverResults.length > 0
                      ? (driverResults.reduce((s, r) => s + (r.finish_position || 0), 0) / driverResults.length).toFixed(1)
                      : '—';
                    const wins = driverResults.filter((r) => r.finish_position === 1).length;
                    const avgLapsLed = driverResults.length > 0
                      ? (driverResults.reduce((s, r) => s + (r.laps_led || 0), 0) / driverResults.length).toFixed(1)
                      : '0';
                    const avgIncidents = driverResults.length > 0
                      ? (driverResults.reduce((s, r) => s + (r.incidents || 0), 0) / driverResults.length).toFixed(1)
                      : '0';

                    return (
                      <button
                        key={driver.id}
                        onClick={() => inRoster ? removeFromRoster(driver.id) : addToRoster(driver.id, driver.salary)}
                        disabled={disabled && !inRoster}
                        className={`w-full p-4 flex items-center gap-4 transition text-left ${
                          inRoster
                            ? 'bg-[#e8f5e9] hover:bg-[#c8e6c9]'
                            : disabled
                              ? 'opacity-40 cursor-not-allowed bg-white'
                              : 'bg-white hover:bg-[#f5f5f5]'
                        }`}
                      >
                        {/* Car Number */}
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm ${
                          inRoster ? 'bg-[#008564] text-white' : 'bg-[#f5f5f5] text-[#131313]'
                        }`}>
                          #{driver.car_number}
                        </div>

                        {/* Name + Nickname */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[#131313] font-bold text-sm truncate">{driver.name}</div>
                          {driver.nickname && (
                            <div className="text-[#6c6d6f] text-xs">"{driver.nickname}"</div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex gap-4 text-xs text-center">
                          <div>
                            <div className="text-[#6c6d6f] uppercase" style={{ fontSize: '10px' }}>Avg Fin</div>
                            <div className="font-bold text-[#131313]">{avgFinish}</div>
                          </div>
                          <div>
                            <div className="text-[#6c6d6f] uppercase" style={{ fontSize: '10px' }}>Wins</div>
                            <div className="font-bold text-[#131313]">{wins}</div>
                          </div>
                          <div>
                            <div className="text-[#6c6d6f] uppercase" style={{ fontSize: '10px' }}>Avg Led</div>
                            <div className="font-bold text-[#131313]">{avgLapsLed}</div>
                          </div>
                          <div>
                            <div className="text-[#6c6d6f] uppercase" style={{ fontSize: '10px' }}>Avg Inc</div>
                            <div className="font-bold text-[#131313]">{avgIncidents}</div>
                          </div>
                        </div>

                        {/* Salary */}
                        <div className={`text-right ${inRoster ? 'text-[#008564]' : 'text-[#131313]'}`}>
                          <div className="text-lg font-black">${driver.salary.toLocaleString()}</div>
                          {inRoster && <div className="text-xs text-[#008564] font-bold">IN LINEUP</div>}
                          {!inRoster && !affordable && selectedRoster.length < ROSTER_SIZE && (
                            <div className="text-xs text-[#cc0000]">Can't afford</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SUB-TAB: Results ═══ */}
      {subTab === 'results' && (
        <div>
          {/* Race selector */}
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-[#131313]">Race:</label>
              <select
                value={selectedResultRace}
                onChange={(e) => setSelectedResultRace(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#f5f5f5] border border-[#e0e0e0] text-[#131313] focus:outline-none focus:border-[#008564]"
              >
                <option value="latest">Latest Race</option>
                {completedRaces.map((race) => (
                  <option key={race.id} value={race.id}>
                    Race {race.raceNumber}: {race.track}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedRaceResults ? (
            <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center">
              <Trophy size={48} className="text-[#e0e0e0] mx-auto mb-4" />
              <p className="text-[#6c6d6f]">No completed races with fantasy results yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Race header */}
              <div className="bg-white border border-[#e0e0e0] rounded-lg p-5">
                <h3 className="text-xl font-bold text-[#131313]">
                  Race {selectedRaceResults.raceNumber}: {selectedRaceResults.track}
                </h3>
                <p className="text-[#6c6d6f] text-sm mt-1">{selectedRaceResults.date}</p>
              </div>

              {/* Fantasy Lineups for this race */}
              {selectedRaceFantasyResults.lineups.length === 0 ? (
                <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center">
                  <p className="text-[#6c6d6f]">No fantasy lineups were submitted for this race.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedRaceFantasyResults.lineups.map((lineup, idx) => (
                    <div key={lineup.pickerId} className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
                      {/* Lineup header */}
                      <div className={`p-4 flex items-center justify-between ${
                        idx === 0 ? 'bg-[#008564] text-white' : 'bg-[#f5f5f5]'
                      }`}>
                        <div className="flex items-center gap-3">
                          {idx === 0 && <Trophy size={18} />}
                          <div>
                            <div className={`font-bold ${idx === 0 ? 'text-white' : 'text-[#131313]'}`}>
                              {getDriverName(lineup.pickerId)}
                            </div>
                            <div className={`text-xs ${idx === 0 ? 'text-green-100' : 'text-[#6c6d6f]'}`}>
                              Salary used: ${lineup.totalSalary.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-2xl font-black ${idx === 0 ? 'text-white' : 'text-[#131313]'}`}>
                          {lineup.total} pts
                        </div>
                      </div>

                      {/* Driver breakdown */}
                      <div className="divide-y divide-[#e0e0e0]">
                        {lineup.driverScores.map((ds) => (
                          <div key={ds.driverId} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center rounded bg-[#f5f5f5] text-xs font-bold text-[#131313]">
                                #{getDriverNumber(ds.driverId)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-[#131313]">{getDriverName(ds.driverId)}</div>
                                <div className="text-xs text-[#6c6d6f]">${ds.salary.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <div className="hidden sm:flex gap-3">
                                {ds.finish !== 0 && (
                                  <span className={ds.finish > 0 ? 'text-[#008564]' : 'text-[#cc0000]'}>
                                    Pos: {ds.finish > 0 ? '+' : ''}{ds.finish}
                                  </span>
                                )}
                                {ds.lapsLed !== 0 && (
                                  <span className="text-[#008564]">Led: +{ds.lapsLed}</span>
                                )}
                                {ds.fastestLap !== 0 && (
                                  <span className="text-[#f5a623]">FL: +{ds.fastestLap}</span>
                                )}
                                {ds.incidents !== 0 && (
                                  <span className="text-[#cc0000]">Inc: {ds.incidents}</span>
                                )}
                              </div>
                              <span className={`font-bold text-sm ${ds.total >= 0 ? 'text-[#131313]' : 'text-[#cc0000]'}`}>
                                {ds.total > 0 ? '+' : ''}{ds.total}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Optimal Lineup */}
              {selectedRaceFantasyResults.optimal && (
                <div className="bg-white border-2 border-[#f5a623] rounded-lg overflow-hidden">
                  <div className="p-4 bg-[#fff8e1] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-[#f5a623]" />
                      <div>
                        <div className="font-bold text-[#131313]">Optimal Lineup</div>
                        <div className="text-xs text-[#6c6d6f]">
                          Best possible under ${SALARY_CAP.toLocaleString()} cap
                          — Salary: ${selectedRaceFantasyResults.optimal.totalSalary.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-[#f5a623]">
                      {selectedRaceFantasyResults.optimal.total} pts
                    </div>
                  </div>
                  <div className="divide-y divide-[#e0e0e0]">
                    {selectedRaceFantasyResults.optimal.drivers.map((ds) => (
                      <div key={ds.driverId} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded bg-[#fff8e1] text-xs font-bold text-[#131313]">
                            #{getDriverNumber(ds.driverId)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#131313]">{getDriverName(ds.driverId)}</div>
                            <div className="text-xs text-[#6c6d6f]">${ds.salary.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="hidden sm:flex gap-3">
                            {ds.finish !== 0 && (
                              <span className={ds.finish > 0 ? 'text-[#008564]' : 'text-[#cc0000]'}>
                                Pos: {ds.finish > 0 ? '+' : ''}{ds.finish}
                              </span>
                            )}
                            {ds.lapsLed !== 0 && (
                              <span className="text-[#008564]">Led: +{ds.lapsLed}</span>
                            )}
                            {ds.fastestLap !== 0 && (
                              <span className="text-[#f5a623]">FL: +{ds.fastestLap}</span>
                            )}
                            {ds.incidents !== 0 && (
                              <span className="text-[#cc0000]">Inc: {ds.incidents}</span>
                            )}
                          </div>
                          <span className={`font-bold text-sm ${ds.total >= 0 ? 'text-[#131313]' : 'text-[#cc0000]'}`}>
                            {ds.total > 0 ? '+' : ''}{ds.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ SUB-TAB: Season Leaderboard ═══ */}
      {subTab === 'leaderboard' && (
        <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#e0e0e0]">
            <h2 className="text-xl font-bold text-[#131313]">Fantasy Season Standings</h2>
            <p className="text-[#6c6d6f] text-sm mt-1">
              ${SALARY_CAP.toLocaleString()} cap | {ROSTER_SIZE} drivers | Cumulative points across all races
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy size={48} className="text-[#e0e0e0] mx-auto mb-4" />
              <p className="text-[#6c6d6f]">No fantasy results yet. Submit lineups and race to see standings!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f5f5]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6c6d6f] uppercase">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6c6d6f] uppercase">Player</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6c6d6f] uppercase">Races</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6c6d6f] uppercase">Avg/Race</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6c6d6f] uppercase">Best Wk</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6c6d6f] uppercase">Worst Wk</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6c6d6f] uppercase">Total Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr
                      key={entry.pickerId}
                      className="border-t border-[#e0e0e0] hover:bg-[#f0f0f0] transition"
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                            idx === 0
                              ? 'bg-[#008564] text-white'
                              : idx === 1
                                ? 'bg-[#c0c0c0] text-[#131313]'
                                : idx === 2
                                  ? 'bg-[#cd7f32] text-white'
                                  : 'bg-[#f5f5f5] text-[#131313]'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#131313]">{getDriverName(entry.pickerId)}</div>
                        <div className="text-[#6c6d6f] text-xs">
                          #{getDriverNumber(entry.pickerId)}
                          {getDriverNickname(entry.pickerId) && ` • "${getDriverNickname(entry.pickerId)}"`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-[#6c6d6f]">{entry.races}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[#008564] font-bold">{entry.avg}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[#008564] font-bold">{entry.bestWeek}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={entry.worstWeek < 0 ? 'text-[#cc0000] font-bold' : 'text-[#6c6d6f]'}>
                          {entry.worstWeek}
                        </span>
                      </td>
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
  );
}
