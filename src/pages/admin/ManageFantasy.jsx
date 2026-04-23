import React, { useState, useMemo } from 'react';
import {
  DollarSign, Users, Trophy, Trash2, AlertCircle, CheckCircle,
  BarChart3, RefreshCw, Star,
} from 'lucide-react';
import {
  useDrivers,
  useAllRaceResults,
  useRaceResultsByRace,
  useSchedule,
  useRaces,
  useAllFantasyLineups,
} from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';

// ─── Salary Calculation (same as FantasyDraft component) ─────
const SALARY_CAP = 10000;
const ROSTER_SIZE = 3;
const MAX_SALARY = 5000;
const MIN_SALARY = 1400;

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

  const allStats = Object.values(driverStats);
  const maxAvgFinish = Math.max(...allStats.map((s) => s.avgFinish));
  const minAvgFinish = Math.min(...allStats.map((s) => s.avgFinish));
  const maxWinRate = Math.max(...allStats.map((s) => s.winRate), 0.01);
  const maxLapsLed = Math.max(...allStats.map((s) => s.avgLapsLed), 1);
  const maxIncidents = Math.max(...allStats.map((s) => s.avgIncidents), 1);

  const scores = {};
  Object.entries(driverStats).forEach(([driverId, stats]) => {
    const finishScore = maxAvgFinish === minAvgFinish ? 0.5 :
      (maxAvgFinish - stats.avgFinish) / (maxAvgFinish - minAvgFinish);
    const winScore = stats.winRate / maxWinRate;
    const lapsScore = stats.avgLapsLed / maxLapsLed;
    const incidentScore = 1 - (stats.avgIncidents / maxIncidents);
    scores[driverId] = (finishScore * 0.40) + (winScore * 0.25) + (lapsScore * 0.20) + (incidentScore * 0.15);
  });

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const count = ranked.length;
  const salaries = {};
  ranked.forEach(([driverId], idx) => {
    if (count === 1) {
      salaries[driverId] = MAX_SALARY;
    } else {
      const ratio = idx / (count - 1);
      const raw = MAX_SALARY - ratio * (MAX_SALARY - MIN_SALARY);
      salaries[driverId] = Math.round(raw / 100) * 100;
    }
  });
  return salaries;
}

// ─── Scoring Engine (same as FantasyDraft) ───────────────────
const SCORING = {
  WIN_BONUS: 5, TOP_3: 7, TOP_5: 5, TOP_8: 3, TOP_10: 1,
  OUTSIDE_TOP_10: -1, LAPS_LED_PER: 0.10, INCIDENT_PER: -0.10, FASTEST_LAP: 3,
};

function scoreDriver(raceResult, allRaceResults) {
  if (!raceResult) return { total: 0 };
  const pos = raceResult.finishPosition || raceResult.finish_position;
  const lapsLed = raceResult.lapsLed || raceResult.laps_led || 0;
  const incidents = raceResult.incidents || 0;

  let finishPts = 0;
  if (pos === 1) finishPts = SCORING.WIN_BONUS + SCORING.TOP_3;
  else if (pos <= 3) finishPts = SCORING.TOP_3;
  else if (pos <= 5) finishPts = SCORING.TOP_5;
  else if (pos <= 8) finishPts = SCORING.TOP_8;
  else if (pos <= 10) finishPts = SCORING.TOP_10;
  else finishPts = SCORING.OUTSIDE_TOP_10;

  const lapsLedPts = lapsLed * SCORING.LAPS_LED_PER;
  const incidentPts = incidents * SCORING.INCIDENT_PER;

  let fastestLapPts = 0;
  if (allRaceResults?.length > 0) {
    const fastestTime = allRaceResults.reduce((best, r) => {
      const t = r.fastest_lap_time || r.bestLap;
      if (!t) return best;
      return !best || t < best ? t : best;
    }, null);
    const driverTime = raceResult.fastest_lap_time || raceResult.bestLap;
    if (fastestTime && driverTime && driverTime === fastestTime) fastestLapPts = SCORING.FASTEST_LAP;
  }

  return { total: parseFloat((finishPts + lapsLedPts + incidentPts + fastestLapPts).toFixed(2)) };
}

export default function ManageFantasy() {
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: allResults, loading: resultsLoading } = useAllRaceResults();
  const { data: raceResultsData } = useRaceResultsByRace();
  const { data: schedule } = useSchedule(null);
  const { data: allFantasyData, loading: fantasyLoading } = useAllFantasyLineups();

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const salaries = useMemo(() => computeSalaries(drivers, allResults), [drivers, allResults]);

  // Map schedule to race IDs
  const scheduleToRaceId = useMemo(() => {
    if (!schedule) return {};
    const map = {};
    schedule.forEach((s) => { if (s.race_id) map[s.id] = s.race_id; });
    return map;
  }, [schedule]);

  const raceResultsMap = useMemo(() => {
    if (!raceResultsData) return {};
    const map = {};
    raceResultsData.forEach((r) => { map[r.id] = r; });
    return map;
  }, [raceResultsData]);

  // Compute fantasy averages per driver from actual race-by-race scoring
  const fantasyAverages = useMemo(() => {
    if (!drivers || !raceResultsData) return {};
    const avgs = {};
    drivers.forEach((d) => {
      let totalPts = 0;
      let raceCount = 0;
      raceResultsData.forEach((race) => {
        if (!race.results) return;
        const result = race.results.find((r) => r.id === d.id);
        if (!result) return;
        const score = scoreDriver(result, race.results);
        totalPts += score.total;
        raceCount += 1;
      });
      avgs[d.id] = {
        total: parseFloat(totalPts.toFixed(2)),
        races: raceCount,
        avg: raceCount > 0 ? parseFloat((totalPts / raceCount).toFixed(2)) : 0,
      };
    });
    return avgs;
  }, [drivers, raceResultsData]);

  // Sorted driver salary list
  const salaryList = useMemo(() => {
    if (!drivers) return [];
    return drivers
      .map((d) => {
        const results = allResults?.filter((r) => r.driver_id === d.id) || [];
        const avgFinish = results.length > 0
          ? (results.reduce((s, r) => s + (r.finish_position || 0), 0) / results.length).toFixed(1)
          : '—';
        const wins = results.filter((r) => r.finish_position === 1).length;
        const fAvg = fantasyAverages[d.id] || { total: 0, races: 0, avg: 0 };
        return {
          ...d,
          salary: salaries[d.id] || MIN_SALARY,
          avgFinish,
          wins,
          races: results.length,
          fantasyAvg: fAvg.avg,
          fantasyTotal: fAvg.total,
        };
      })
      .sort((a, b) => b.salary - a.salary);
  }, [drivers, salaries, allResults, fantasyAverages]);

  // Lineups grouped by race
  const lineupsByRace = useMemo(() => {
    if (!allFantasyData || !schedule) return [];

    const grouped = {};
    allFantasyData.forEach((entry) => {
      const key = entry.race_id;
      if (!grouped[key]) grouped[key] = { raceId: key, entries: [] };
      grouped[key].entries.push(entry);
    });

    return Object.values(grouped).map((group) => {
      const sched = schedule.find((s) => s.id === group.raceId);
      const pickers = new Set(group.entries.map((e) => e.picker_id));
      return {
        raceId: group.raceId,
        trackName: sched?.track_name || 'Unknown',
        raceNumber: sched?.race_number || 0,
        pickerCount: pickers.size,
        entries: group.entries,
      };
    }).sort((a, b) => b.raceNumber - a.raceNumber);
  }, [allFantasyData, schedule]);

  // Delete all lineups for a race
  const handleDeleteRaceLineups = async (raceId) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('fantasy_lineups')
        .delete()
        .eq('race_id', raceId);
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const getDriverName = (id) => drivers?.find((d) => d.id === id)?.name || 'Unknown';
  const getDriverNumber = (id) => drivers?.find((d) => d.id === id)?.car_number || '?';

  if (driversLoading || resultsLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-[#8a8a9a]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fantasy Draft Management</h1>
        <p className="text-[#8a8a9a]">
          View salaries, manage lineups, and monitor fantasy scoring.
        </p>
      </div>

      {/* Config Card */}
      <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-[#f5a623]" />
          Fantasy Settings
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a2e] rounded-lg p-4 text-center">
            <div className="text-[#f5a623] text-2xl font-black">${SALARY_CAP.toLocaleString()}</div>
            <div className="text-[#8a8a9a] text-xs mt-1">Salary Cap</div>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 text-center">
            <div className="text-[#2ec4b6] text-2xl font-black">{ROSTER_SIZE}</div>
            <div className="text-[#8a8a9a] text-xs mt-1">Drivers Per Lineup</div>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 text-center">
            <div className="text-white text-2xl font-black">${MAX_SALARY.toLocaleString()}</div>
            <div className="text-[#8a8a9a] text-xs mt-1">Max Salary</div>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-4 text-center">
            <div className="text-white text-2xl font-black">${MIN_SALARY.toLocaleString()}</div>
            <div className="text-[#8a8a9a] text-xs mt-1">Min Salary</div>
          </div>
        </div>
      </div>

      {/* Current Salaries */}
      <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden mb-8">
        <div className="p-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Star size={18} className="text-[#f5a623]" />
            Current Driver Salaries
          </h2>
          <span className="text-xs text-[#8a8a9a]">Auto-calculated from race performance</span>
        </div>
        <table className="w-full">
          <thead className="bg-[#1a1a2e]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#8a8a9a] uppercase">Driver</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-[#8a8a9a] uppercase">Races</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-[#8a8a9a] uppercase">Avg Fin</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-[#8a8a9a] uppercase">Wins</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-[#f5a623] uppercase">FPTS/Race</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-[#f5a623] uppercase">Season FPTS</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-[#8a8a9a] uppercase">Salary</th>
            </tr>
          </thead>
          <tbody>
            {salaryList.map((d, idx) => (
              <tr key={d.id} className="border-t border-[#2a2a3e] hover:bg-[#1a1a2e]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[#8a8a9a] text-xs w-4">{idx + 1}.</span>
                    <span className="text-white font-bold">#{d.car_number} {d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-[#8a8a9a]">{d.races}</td>
                <td className="px-4 py-3 text-center text-[#8a8a9a]">{d.avgFinish}</td>
                <td className="px-4 py-3 text-center text-[#8a8a9a]">{d.wins}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${
                    d.fantasyAvg >= 10 ? 'text-[#2ec4b6]' : d.fantasyAvg >= 5 ? 'text-white' : 'text-[#e63946]'
                  }`}>
                    {d.fantasyAvg.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-[#8a8a9a]">{d.fantasyTotal.toFixed(1)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-black text-lg ${
                    d.salary >= 4500 ? 'text-[#f5a623]' : d.salary >= 3000 ? 'text-[#2ec4b6]' : 'text-[#8a8a9a]'
                  }`}>
                    ${d.salary.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submitted Lineups by Race */}
      <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#2a2a3e]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-[#2ec4b6]" />
            Submitted Lineups
          </h2>
        </div>

        {lineupsByRace.length === 0 ? (
          <div className="p-8 text-center text-[#8a8a9a]">
            No fantasy lineups submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a3e]">
            {lineupsByRace.map((race) => (
              <div key={race.raceId} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-bold">Race {race.raceNumber}: {race.trackName}</span>
                    <span className="text-[#8a8a9a] text-sm ml-2">
                      ({race.pickerCount} lineup{race.pickerCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {deleteConfirm === race.raceId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#e63946] text-sm">Delete all?</span>
                      <button
                        onClick={() => handleDeleteRaceLineups(race.raceId)}
                        disabled={deleting}
                        className="px-3 py-1 bg-[#e63946] text-white text-xs rounded font-bold hover:bg-[#c0392b]"
                      >
                        {deleting ? '...' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-[#2a2a3e] text-[#8a8a9a] text-xs rounded font-bold hover:bg-[#3a3a4e]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(race.raceId)}
                      className="p-2 text-[#8a8a9a] hover:text-[#e63946] transition"
                      title="Delete all lineups for this race"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Individual lineups */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(() => {
                    const byPicker = {};
                    race.entries.forEach((e) => {
                      if (!byPicker[e.picker_id]) byPicker[e.picker_id] = [];
                      byPicker[e.picker_id].push(e);
                    });
                    return Object.entries(byPicker).map(([pid, entries]) => (
                      <div key={pid} className="bg-[#1a1a2e] rounded-lg p-3">
                        <div className="text-[#f5a623] font-bold text-sm mb-1">
                          {getDriverName(pid)}
                        </div>
                        <div className="text-xs text-[#8a8a9a] space-y-1">
                          {entries.map((e) => (
                            <div key={e.driver_id} className="flex justify-between">
                              <span>#{getDriverNumber(e.driver_id)} {getDriverName(e.driver_id)}</span>
                              <span className="text-[#2ec4b6]">${e.salary.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="border-t border-[#2a2a3e] pt-1 flex justify-between font-bold">
                            <span>Total</span>
                            <span className="text-white">
                              ${entries.reduce((s, e) => s + e.salary, 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
