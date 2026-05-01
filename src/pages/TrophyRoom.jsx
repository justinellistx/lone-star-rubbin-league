import React, { useMemo, useState } from 'react';
import {
  Trophy, Crown, Star, Award, TrendingUp, Flag, Zap, Shield,
  ChevronDown, ChevronUp, Medal, Target, Flame,
} from 'lucide-react';
import {
  useRaceResultsByRace,
  useComputedStandings,
  useDrivers,
  useInterviews,
  useSchedule,
  useStages,
} from '../hooks/useSupabase';
import { useTrophyEntries, useStageTrophies, useCupChampions } from '../hooks/useTrophyRoom';

// ─── Trophy name mapping by track ─────────────────────────────
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

// ─── Component ────────────────────────────────────────────────
export default function TrophyRoom() {
  const { data: races, loading: racesLoading } = useRaceResultsByRace();
  const { standings, teamStandings } = useComputedStandings();
  const { data: drivers } = useDrivers();
  const { data: schedule } = useSchedule(null);
  const { data: stages } = useStages();
  const { data: trophyEntries } = useTrophyEntries();
  const { data: stageTrophies } = useStageTrophies();
  const { data: cupChampions } = useCupChampions();
  const { data: allInterviews } = useInterviews();

  const [expandedRace, setExpandedRace] = useState(null);
  const [activeSection, setActiveSection] = useState('shelf'); // 'shelf' | 'stages' | 'cup' | 'records'

  // Map schedule_id to race_id for interview linking
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

  // Build race winners with stats + interview quotes
  const raceWinners = useMemo(() => {
    if (!races) return [];

    return races
      .filter((race) => race.results && race.results.length > 0)
      .sort((a, b) => a.raceNumber - b.raceNumber)
      .map((race) => {
        const results = race.results.sort((a, b) => a.finishPosition - b.finishPosition);
        const winner = results[0];
        if (!winner) return null;

        // Look up nickname from drivers data
        const driverData = drivers?.find((d) => d.id === winner.id);
        const nickname = driverData?.nickname || null;

        // Get trophy entry (AI image) if it exists
        const trophyEntry = trophyEntries?.find((t) => t.race_id === race.id);

        // Get winner's interview quote
        const schedId = raceIdToScheduleId[race.id];
        let winnerQuote = trophyEntry?.custom_quote || null;
        if (!winnerQuote && allInterviews && schedId) {
          const interview = allInterviews.find(
            (i) => i.driver_id === winner.id && i.schedule_id === schedId && i.answer_text
          );
          if (interview) {
            // Take first ~200 chars of their answer as the quote
            const full = interview.answer_text;
            winnerQuote = full.length > 200 ? full.slice(0, 200).trim() + '...' : full;
          }
        }

        const trophyName = TROPHY_NAMES[race.track] || `The ${race.track} Trophy`;

        return {
          raceNumber: race.raceNumber,
          track: race.track,
          date: race.date,
          raceId: race.id,
          trophyName,
          winner: {
            id: winner.id,
            name: winner.name,
            carNumber: winner.number,
            nickname,
          },
          stats: {
            finishPosition: winner.finishPosition,
            startPosition: winner.startPosition,
            lapsLed: winner.lapsLed || 0,
            incidents: winner.incidents || 0,
            totalLaps: race.totalLaps,
          },
          quote: winnerQuote,
          imageUrl: trophyEntry?.image_url || null,
          thumbnailUrl: trophyEntry?.thumbnail_url || null,
          // Top 3 for podium
          podium: results.slice(0, 3).map((r) => ({
            name: r.name,
            carNumber: r.number,
            position: r.finishPosition,
          })),
        };
      })
      .filter(Boolean);
  }, [races, drivers, trophyEntries, allInterviews, raceIdToScheduleId]);

  // Calculate records & milestones
  const records = useMemo(() => {
    if (!races || !standings) return null;

    const completedRaces = races.filter((r) => r.results?.length > 0);

    // Most wins
    const winCounts = {};
    completedRaces.forEach((race) => {
      const winner = race.results?.sort((a, b) => a.finishPosition - b.finishPosition)[0];
      if (winner) {
        winCounts[winner.id] = winCounts[winner.id] || { name: winner.name, carNumber: winner.number, wins: 0 };
        winCounts[winner.id].wins += 1;
      }
    });
    const mostWins = Object.values(winCounts).sort((a, b) => b.wins - a.wins)[0] || null;

    // Most laps led (season total)
    const lapsLedTotals = {};
    completedRaces.forEach((race) => {
      race.results?.forEach((r) => {
        if (!lapsLedTotals[r.id]) lapsLedTotals[r.id] = { name: r.name, carNumber: r.number, total: 0 };
        lapsLedTotals[r.id].total += r.lapsLed || 0;
      });
    });
    const mostLapsLed = Object.values(lapsLedTotals).sort((a, b) => b.total - a.total)[0] || null;

    // Lowest total incidents
    const incidentTotals = {};
    completedRaces.forEach((race) => {
      race.results?.forEach((r) => {
        if (!incidentTotals[r.id]) incidentTotals[r.id] = { name: r.name, carNumber: r.number, total: 0, races: 0 };
        incidentTotals[r.id].total += r.incidents || 0;
        incidentTotals[r.id].races += 1;
      });
    });
    const cleanestDriver = Object.values(incidentTotals)
      .filter((d) => d.races >= 3)
      .sort((a, b) => (a.total / a.races) - (b.total / b.races))[0] || null;

    // Most poles (P1 starts)
    const poleCounts = {};
    completedRaces.forEach((race) => {
      const poler = race.results?.find((r) => r.startPosition === 1);
      if (poler) {
        poleCounts[poler.id] = poleCounts[poler.id] || { name: poler.name, carNumber: poler.number, poles: 0 };
        poleCounts[poler.id].poles += 1;
      }
    });
    const mostPoles = Object.values(poleCounts).sort((a, b) => b.poles - a.poles)[0] || null;

    // Most top-5 finishes
    const top5Counts = {};
    completedRaces.forEach((race) => {
      race.results?.forEach((r) => {
        if (r.finishPosition <= 5) {
          top5Counts[r.id] = top5Counts[r.id] || { name: r.name, carNumber: r.number, count: 0 };
          top5Counts[r.id].count += 1;
        }
      });
    });
    const mostTop5 = Object.values(top5Counts).sort((a, b) => b.count - a.count)[0] || null;

    // Biggest single-race comeback (positions gained)
    let biggestComeback = null;
    let maxGain = 0;
    completedRaces.forEach((race) => {
      race.results?.forEach((r) => {
        const gain = (r.startPosition || 0) - (r.finishPosition || 0);
        if (gain > maxGain) {
          maxGain = gain;
          biggestComeback = { name: r.name, carNumber: r.number, gain, track: race.track, raceNumber: race.raceNumber };
        }
      });
    });

    // Most laps led in single race
    let singleRaceLapsLed = null;
    let maxLaps = 0;
    completedRaces.forEach((race) => {
      race.results?.forEach((r) => {
        if ((r.lapsLed || 0) > maxLaps) {
          maxLaps = r.lapsLed;
          singleRaceLapsLed = { name: r.name, carNumber: r.number, laps: r.lapsLed, track: race.track, raceNumber: race.raceNumber };
        }
      });
    });

    return {
      mostWins,
      mostLapsLed,
      cleanestDriver,
      mostPoles,
      mostTop5,
      biggestComeback,
      singleRaceLapsLed,
      totalRaces: completedRaces.length,
    };
  }, [races, standings]);

  if (racesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Trophy size={48} className="text-[#e0e0e0] mx-auto mb-4 animate-pulse" />
          <p className="text-[#6c6d6f]">Loading the Trophy Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a1a1a] rounded-2xl p-8 md:p-12 mb-8 overflow-hidden">
        {/* Gold shimmer overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          background: 'linear-gradient(135deg, transparent 0%, #f5a623 25%, transparent 50%, #f5a623 75%, transparent 100%)',
          backgroundSize: '400% 400%',
          animation: 'shimmer 8s ease-in-out infinite',
        }} />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy size={40} className="text-[#f5a623]" />
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              THE TROPHY ROOM
            </h1>
            <Trophy size={40} className="text-[#f5a623]" />
          </div>
          <p className="text-[#c4a265] text-lg max-w-2xl mx-auto">
            Every victory. Every champion. Every record. The complete hardware collection
            of the Lone Star Rubbin' League.
          </p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {[
          { key: 'shelf', label: 'Race Winners', icon: Trophy, count: raceWinners.length },
          { key: 'stages', label: 'Stage Champions', icon: Crown },
          { key: 'cup', label: 'Cup Champion', icon: Star },
          { key: 'records', label: 'Records & Milestones', icon: Medal },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeSection === key
                ? 'bg-[#f5a623] text-[#1a1a1a] shadow-lg shadow-[#f5a623]/20'
                : 'bg-white border border-[#e0e0e0] text-[#6c6d6f] hover:border-[#f5a623] hover:text-[#f5a623]'
            }`}
          >
            <Icon size={18} />
            {label}
            {count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeSection === key ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]' : 'bg-[#ffffff] text-[#6c6d6f]'
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ SECTION: Race Winners Shelf ═══ */}
      {activeSection === 'shelf' && (
        <div>
          {raceWinners.length === 0 ? (
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-12 text-center">
              <Trophy size={64} className="text-[#e0e0e0] mx-auto mb-4" />
              <p className="text-[#6c6d6f] text-lg">No races completed yet. The shelf awaits its first trophy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raceWinners.map((race) => (
                <div
                  key={race.raceId}
                  className="group bg-white border border-[#e0e0e0] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#f5a623]/10 transition-all duration-300 hover:border-[#f5a623]/30"
                >
                  {/* Trophy Display Area */}
                  <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#2d2015] p-6 text-center">
                    {/* Race number badge */}
                    <div className="absolute top-3 left-3 bg-[#f5a623] text-[#1a1a1a] text-xs font-black px-2 py-1 rounded">
                      RACE {race.raceNumber}
                    </div>

                    {/* AI Trophy Image or Placeholder */}
                    {race.imageUrl ? (
                      <img
                        src={race.imageUrl}
                        alt={`${race.winner.name} wins at ${race.track}`}
                        className="w-40 h-40 mx-auto rounded-xl object-cover shadow-lg shadow-black/30 border-2 border-[#f5a623]/30"
                      />
                    ) : (
                      <div className="w-40 h-40 mx-auto rounded-xl bg-gradient-to-br from-[#2d2015] to-[#3d2a15] border-2 border-[#f5a623]/20 flex flex-col items-center justify-center">
                        <Trophy size={48} className="text-[#f5a623]/60 mb-2" />
                        <span className="text-[#f5a623]/40 text-xs font-bold">#{race.winner.number}</span>
                      </div>
                    )}

                    {/* Trophy name */}
                    <p className="text-[#c4a265] text-xs mt-3 italic">{race.trophyName}</p>
                  </div>

                  {/* Winner Info */}
                  <div className="p-5">
                    {/* Track + Date */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[#1a1a2e] font-black text-lg">{race.track}</h3>
                      <span className="text-[#6c6d6f] text-xs">{race.date}</span>
                    </div>

                    {/* Winner Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#f5a623] text-[#1a1a1a] font-black text-sm">
                        #{race.winner.number}
                      </div>
                      <div>
                        <div className="text-[#1a1a2e] font-bold">{race.winner.name}</div>
                        {race.winner.nickname && (
                          <div className="text-[#6c6d6f] text-xs">"{race.winner.nickname}"</div>
                        )}
                      </div>
                      <Trophy size={20} className="text-[#f5a623] ml-auto" />
                    </div>

                    {/* Race Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-[#ffffff] rounded-lg p-2 text-center">
                        <div className="text-[#6c6d6f] text-[10px] uppercase font-bold">Started</div>
                        <div className="text-[#1a1a2e] font-black">P{race.stats.startPosition}</div>
                      </div>
                      <div className="bg-[#ffffff] rounded-lg p-2 text-center">
                        <div className="text-[#6c6d6f] text-[10px] uppercase font-bold">Laps Led</div>
                        <div className="text-[#1a1a2e] font-black">{race.stats.lapsLed}</div>
                      </div>
                      <div className="bg-[#ffffff] rounded-lg p-2 text-center">
                        <div className="text-[#6c6d6f] text-[10px] uppercase font-bold">Incidents</div>
                        <div className={`font-black ${race.stats.incidents === 0 ? 'text-[#008564]' : race.stats.incidents <= 4 ? 'text-[#1a1a2e]' : 'text-[#c8102e]'}`}>
                          {race.stats.incidents}x
                        </div>
                      </div>
                    </div>

                    {/* Podium */}
                    <div className="flex items-center gap-1 mb-4 text-xs">
                      <Medal size={12} className="text-[#6c6d6f]" />
                      <span className="text-[#6c6d6f]">Podium:</span>
                      {race.podium.map((p, idx) => (
                        <span key={idx} className={`font-bold ${
                          idx === 0 ? 'text-[#f5a623]' : idx === 1 ? 'text-[#8a8a8a]' : 'text-[#cd7f32]'
                        }`}>
                          {idx > 0 && ' · '}#{p.carNumber}
                        </span>
                      ))}
                    </div>

                    {/* Winner Quote */}
                    {race.quote && (
                      <button
                        onClick={() => setExpandedRace(expandedRace === race.raceId ? null : race.raceId)}
                        className="w-full text-left"
                      >
                        <div className={`bg-[#fffbf0] border border-[#f5a623]/20 rounded-lg p-3 transition-all ${
                          expandedRace === race.raceId ? '' : 'line-clamp-3'
                        }`}>
                          <div className="flex items-start gap-2">
                            <span className="text-[#f5a623] text-lg leading-none">"</span>
                            <p className={`text-[#4a4a4a] text-xs italic leading-relaxed ${
                              expandedRace === race.raceId ? '' : 'line-clamp-3'
                            }`}>
                              {race.quote}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[#f5a623] text-[10px] font-bold uppercase">
                              — {race.winner.name}, Post-Race
                            </span>
                            {race.quote.length > 150 && (
                              expandedRace === race.raceId
                                ? <ChevronUp size={12} className="text-[#6c6d6f]" />
                                : <ChevronDown size={12} className="text-[#6c6d6f]" />
                            )}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty shelf spots for upcoming races */}
              {schedule && schedule
                .filter((s) => !scheduleToRaceId[s.id] || !races?.some((r) => r.id === scheduleToRaceId[s.id]))
                .sort((a, b) => a.race_number - b.race_number)
                .map((s) => (
                  <div key={s.id} className="bg-white/50 border-2 border-dashed border-[#e0e0e0] rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] opacity-60">
                    <div className="w-20 h-20 rounded-xl bg-[#ffffff] flex items-center justify-center mb-3">
                      <Trophy size={32} className="text-[#e0e0e0]" />
                    </div>
                    <p className="text-[#6c6d6f] font-bold">Race {s.race_number}</p>
                    <p className="text-[#6c6d6f] text-sm">{s.track_name}</p>
                    <p className="text-[#e0e0e0] text-xs mt-1">TBD</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ SECTION: Stage Champions ═══ */}
      {activeSection === 'stages' && (
        <div>
          {/* Current standings leader (in-progress stage) */}
          {standings && standings.length > 0 && (
            <div className="bg-white border border-[#e0e0e0] rounded-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d1810] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Crown size={24} className="text-[#f5a623]" />
                  <h2 className="text-xl font-black text-white">Stage 1 — In Progress</h2>
                </div>
                <p className="text-[#c4a265] text-sm">
                  {raceWinners.length} of 12 races complete. Points leader after drops will be crowned Stage Champion.
                </p>
              </div>

              <div className="p-6">
                {/* Individual Leader */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#003DA5] uppercase mb-3">Points Leader — Individual</h3>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#fffbf0] to-white border border-[#f5a623]/20 rounded-xl">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#f5a623] text-[#1a1a1a] font-black text-lg">
                      #{standings[0].number || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="text-[#1a1a2e] font-black text-lg">{standings[0].name}</div>
                      <div className="text-[#6c6d6f] text-sm">
                        {standings[0].totalPoints || standings[0].points} raw points · {standings[0].wins || 0} wins
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#f5a623] text-2xl font-black">{standings[0].totalPoints || standings[0].points}</div>
                      <div className="text-[#6c6d6f] text-xs">POINTS</div>
                    </div>
                  </div>
                </div>

                {/* Team Leader */}
                {teamStandings && teamStandings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-[#003DA5] uppercase mb-3">Points Leader — Team</h3>
                    <div className="flex items-center gap-4 p-4 bg-[#ffffff] border border-[#e0e0e0] rounded-xl">
                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#1a1a2e] text-white">
                        <Shield size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[#1a1a2e] font-black text-lg">{teamStandings[0].teamName}</div>
                        <div className="text-[#6c6d6f] text-sm">
                          {teamStandings[0].driverCount} drivers
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#1a1a2e] text-2xl font-black">{teamStandings[0].points}</div>
                        <div className="text-[#6c6d6f] text-xs">POINTS</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top 5 Standings Preview */}
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-[#6c6d6f] uppercase mb-3">Championship Top 5</h3>
                  <div className="space-y-2">
                    {standings.slice(0, 5).map((driver, idx) => (
                      <div key={driver.custId || idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#ffffff] transition">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${
                          idx === 0 ? 'bg-[#f5a623] text-[#1a1a1a]'
                          : idx === 1 ? 'bg-[#c0c0c0] text-[#1a1a1a]'
                          : idx === 2 ? 'bg-[#cd7f32] text-white'
                          : 'bg-[#ffffff] text-[#6c6d6f]'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-[#1a1a2e] font-bold text-sm flex-1">{driver.name}</span>
                        <span className="text-[#6c6d6f] text-sm font-bold">{driver.totalPoints || driver.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed stage champions will show here */}
          {stageTrophies && stageTrophies.length > 0 ? (
            stageTrophies.map((trophy) => (
              <div key={trophy.id} className="bg-white border border-[#e0e0e0] rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown size={24} className="text-[#f5a623]" />
                  <h2 className="text-xl font-black text-[#1a1a2e]">
                    Stage {trophy.stages?.stage_number} Champion
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  {trophy.image_url ? (
                    <img src={trophy.image_url} alt="Stage Champion" className="w-24 h-24 rounded-xl object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-[#f5a623]/10 flex items-center justify-center">
                      <Crown size={36} className="text-[#f5a623]" />
                    </div>
                  )}
                  <div>
                    <div className="text-[#1a1a2e] font-black text-xl">
                      {trophy.champion_type === 'team' ? trophy.teams?.name : trophy.drivers?.name}
                    </div>
                    <div className="text-[#6c6d6f]">{trophy.points_total} points</div>
                    <div className="text-[#f5a623] text-sm font-bold uppercase mt-1">
                      {trophy.champion_type === 'team' ? 'Team Champion' : 'Individual Champion'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/50 border-2 border-dashed border-[#e0e0e0] rounded-xl p-8 text-center">
              <Crown size={48} className="text-[#e0e0e0] mx-auto mb-3" />
              <p className="text-[#6c6d6f] font-bold">Stage Champions — Coming Soon</p>
              <p className="text-[#6c6d6f] text-sm mt-1">
                Stage 1 champion will be crowned after Race 12 at Watkins Glen.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ SECTION: Cup Champion ═══ */}
      {activeSection === 'cup' && (
        <div>
          {cupChampions && cupChampions.length > 0 ? (
            cupChampions.map((champ) => (
              <div key={champ.id} className="bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a1a1a] rounded-2xl p-8 md:p-12 text-center">
                {champ.image_url ? (
                  <img src={champ.image_url} alt="Cup Champion" className="w-48 h-48 mx-auto rounded-2xl object-cover border-4 border-[#f5a623] shadow-2xl mb-6" />
                ) : (
                  <div className="w-48 h-48 mx-auto rounded-2xl bg-[#2d2015] border-4 border-[#f5a623]/30 flex items-center justify-center mb-6">
                    <Star size={64} className="text-[#f5a623]" />
                  </div>
                )}
                <h2 className="text-3xl md:text-4xl font-black text-[#f5a623] mb-2">
                  {champ.drivers?.name || 'TBD'}
                </h2>
                <p className="text-[#c4a265] text-lg mb-4">
                  {champ.season_year} LSR Cup Champion · {champ.points_total} Points
                </p>
                {champ.quote && (
                  <div className="max-w-xl mx-auto bg-[#2d2015] rounded-xl p-6 border border-[#f5a623]/20">
                    <p className="text-white italic">"{champ.quote}"</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a1a1a] rounded-2xl p-12 md:p-16 text-center">
              <div className="relative inline-block mb-6">
                <Star size={80} className="text-[#f5a623]/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#f5a623]/50 text-2xl font-black">?</span>
                </div>
              </div>
              <h2 className="text-3xl font-black text-[#f5a623]/60 mb-3">THE CUP AWAITS</h2>
              <p className="text-[#c4a265]/60 text-lg max-w-md mx-auto">
                The 2026 LSR Cup Champion will be crowned after the final race of the season.
                Who will etch their name in league history?
              </p>
              {standings && standings.length > 0 && (
                <div className="mt-8 inline-block bg-[#2d2015] rounded-xl p-4 border border-[#f5a623]/20">
                  <p className="text-[#c4a265] text-sm mb-2">Current Points Leader</p>
                  <p className="text-white font-black text-xl">{standings[0].name}</p>
                  <p className="text-[#f5a623] font-bold">{standings[0].totalPoints || standings[0].points} points</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ SECTION: Records & Milestones ═══ */}
      {activeSection === 'records' && records && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Wins */}
          {records.mostWins && (
            <RecordCard
              icon={Trophy}
              iconColor="#f5a623"
              title="Most Wins"
              driverName={records.mostWins.name}
              carNumber={records.mostWins.carNumber}
              value={records.mostWins.wins}
              unit={records.mostWins.wins === 1 ? 'victory' : 'victories'}
            />
          )}

          {/* Most Laps Led */}
          {records.mostLapsLed && (
            <RecordCard
              icon={Flag}
              iconColor="#008564"
              title="Most Laps Led (Season)"
              driverName={records.mostLapsLed.name}
              carNumber={records.mostLapsLed.carNumber}
              value={records.mostLapsLed.total}
              unit="laps"
            />
          )}

          {/* Cleanest Driver */}
          {records.cleanestDriver && (
            <RecordCard
              icon={Shield}
              iconColor="#008564"
              title="Cleanest Driver"
              driverName={records.cleanestDriver.name}
              carNumber={records.cleanestDriver.carNumber}
              value={(records.cleanestDriver.total / records.cleanestDriver.races).toFixed(1)}
              unit="avg incidents/race"
              subtitle={`${records.cleanestDriver.total} total in ${records.cleanestDriver.races} races`}
            />
          )}

          {/* Most Poles */}
          {records.mostPoles && (
            <RecordCard
              icon={Zap}
              iconColor="#003DA5"
              title="Most Pole Positions"
              driverName={records.mostPoles.name}
              carNumber={records.mostPoles.carNumber}
              value={records.mostPoles.poles}
              unit={records.mostPoles.poles === 1 ? 'pole' : 'poles'}
            />
          )}

          {/* Most Top 5s */}
          {records.mostTop5 && (
            <RecordCard
              icon={TrendingUp}
              iconColor="#008564"
              title="Most Top-5 Finishes"
              driverName={records.mostTop5.name}
              carNumber={records.mostTop5.carNumber}
              value={records.mostTop5.count}
              unit={`in ${records.totalRaces} races`}
            />
          )}

          {/* Biggest Comeback */}
          {records.biggestComeback && (
            <RecordCard
              icon={Flame}
              iconColor="#f5a623"
              title="Biggest Single-Race Comeback"
              driverName={records.biggestComeback.name}
              carNumber={records.biggestComeback.carNumber}
              value={`+${records.biggestComeback.gain}`}
              unit="positions gained"
              subtitle={`Race ${records.biggestComeback.raceNumber} at ${records.biggestComeback.track}`}
            />
          )}

          {/* Most Laps Led Single Race */}
          {records.singleRaceLapsLed && (
            <RecordCard
              icon={Target}
              iconColor="#003DA5"
              title="Most Laps Led (Single Race)"
              driverName={records.singleRaceLapsLed.name}
              carNumber={records.singleRaceLapsLed.carNumber}
              value={records.singleRaceLapsLed.laps}
              unit="laps"
              subtitle={`Race ${records.singleRaceLapsLed.raceNumber} at ${records.singleRaceLapsLed.track}`}
            />
          )}

          {/* Points Leader */}
          {standings && standings.length > 0 && (
            <RecordCard
              icon={Award}
              iconColor="#f5a623"
              title="Current Points Leader"
              driverName={standings[0].name}
              carNumber={standings[0].number}
              value={standings[0].totalPoints || standings[0].points}
              unit="points"
              subtitle={`${standings[0].wins || 0} wins, ${standings[0].racesEntered || 0} races`}
            />
          )}
        </div>
      )}

      {/* Shimmer animation CSS */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

// ─── Record Card Component ──────────────────────────────────
function RecordCard({ icon: Icon, iconColor, title, driverName, carNumber, value, unit, subtitle }) {
  return (
    <div className="bg-white border border-[#e0e0e0] rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${iconColor}15` }}>
          <Icon size={24} style={{ color: iconColor }} />
        </div>
        <div className="flex-1">
          <h3 className="text-[#6c6d6f] text-xs font-bold uppercase mb-1">{title}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-[#1a1a2e]">{value}</span>
            <span className="text-[#6c6d6f] text-sm">{unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#ffffff] text-[#1a1a2e] text-xs font-bold px-2 py-0.5 rounded">
              #{carNumber}
            </span>
            <span className="text-[#1a1a2e] font-bold text-sm">{driverName}</span>
          </div>
          {subtitle && (
            <p className="text-[#6c6d6f] text-xs mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
