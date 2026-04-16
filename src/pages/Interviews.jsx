import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  CheckCircle,
  Clock,
  DoorOpen,
  ChevronDown,
} from 'lucide-react';
import {
  useInterviews,
  useDrivers,
  useSchedule,
} from '../hooks/useSupabase';

const TYPE_LABELS = { pre_race: 'Pre-Race', post_race: 'Post-Race' };
const TYPE_COLORS = {
  pre_race: { bg: 'bg-[#f5a623]', text: 'text-[#f5a623]' },
  post_race: { bg: 'bg-[#2ec4b6]', text: 'text-[#2ec4b6]' },
};

export default function Interviews() {
  const { data: allInterviews, loading: interviewsLoading } = useInterviews();
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);

  // Filters for the answered interviews section
  const [selectedRace, setSelectedRace] = useState('all');
  const [expandedCards, setExpandedCards] = useState(new Set());

  const scheduleMap = useMemo(() => {
    if (!schedule) return {};
    const map = {};
    schedule.forEach((s) => { map[s.id] = s; });
    return map;
  }, [schedule]);

  // Only show answered interviews publicly
  const answeredInterviews = useMemo(() => {
    if (!allInterviews) return [];
    return allInterviews.filter((q) => q.answer_text);
  }, [allInterviews]);

  // Per-driver stats: how many questions answered
  const driverStats = useMemo(() => {
    if (!allInterviews || !drivers) return {};
    const stats = {};
    drivers.forEach((d) => {
      const mine = allInterviews.filter((q) => q.driver_id === d.id);
      const answered = mine.filter((q) => q.answer_text).length;
      const pending = mine.filter((q) => !q.answer_text).length;
      stats[d.id] = { total: mine.length, answered, pending };
    });
    return stats;
  }, [allInterviews, drivers]);

  // Races that have answered interviews
  const racesWithAnswers = useMemo(() => {
    if (!answeredInterviews || !schedule) return [];
    const raceIds = [...new Set(answeredInterviews.map((q) => q.schedule_id))];
    return raceIds
      .map((id) => scheduleMap[id])
      .filter(Boolean)
      .sort((a, b) => b.race_number - a.race_number);
  }, [answeredInterviews, schedule, scheduleMap]);

  // Filter answered interviews
  const filtered = useMemo(() => {
    let list = answeredInterviews;
    if (selectedRace !== 'all') {
      list = list.filter((q) => q.schedule_id === selectedRace);
    }
    return list;
  }, [answeredInterviews, selectedRace]);

  // Group by race
  const groupedByRace = useMemo(() => {
    const groups = {};
    filtered.forEach((q) => {
      const key = q.schedule_id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    Object.values(groups).forEach((arr) => {
      arr.sort((a, b) => {
        if (a.question_type !== b.question_type) return a.question_type === 'pre_race' ? -1 : 1;
        return (a.drivers?.name || '').localeCompare(b.drivers?.name || '');
      });
    });
    return groups;
  }, [filtered]);

  const sortedRaceIds = useMemo(() => {
    return Object.keys(groupedByRace).sort((a, b) => {
      return (scheduleMap[b]?.race_number || 0) - (scheduleMap[a]?.race_number || 0);
    });
  }, [groupedByRace, scheduleMap]);

  const toggleExpand = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isLoading = interviewsLoading || driversLoading || scheduleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <Mic className="w-8 h-8 text-[#f5a623] animate-pulse mx-auto mb-4" />
          <p className="text-[#8a8a9a]">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mic className="w-8 h-8 text-[#f5a623]" />
            <h1 className="text-4xl font-bold text-white">Driver Interviews</h1>
          </div>
          <p className="text-[#8a8a9a] text-lg">
            Pre-race predictions, post-race reactions, and everything in between.
          </p>
        </div>

        {/* ═══════════ DRIVER CARDS — MEDIA ROOM ENTRY ═══════════ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-1">Media Room</h2>
          <p className="text-[#8a8a9a] text-sm mb-5">
            Drivers — enter your media room to answer interview questions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers
              ?.filter((d) => d.active)
              .sort((a, b) => (a.car_number || 0) - (b.car_number || 0))
              .map((d) => {
                const stats = driverStats[d.id] || { total: 0, answered: 0, pending: 0 };
                return (
                  <Link
                    key={d.id}
                    to={`/interviews/${d.id}`}
                    className="group bg-[#14141f] border border-[#2a2a3e] rounded-lg p-5 hover:border-[#f5a623] transition-all hover:shadow-lg hover:shadow-[#f5a623]/5"
                  >
                    <div className="flex items-center gap-4">
                      {/* Driver number badge */}
                      <div className="w-14 h-14 rounded-full bg-[#1a1a2e] border-2 border-[#2a2a3e] group-hover:border-[#f5a623] transition-colors flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">#{d.car_number}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-lg truncate">{d.name}</p>
                        {d.nickname && (
                          <p className="text-[#8a8a9a] text-sm">"{d.nickname}"</p>
                        )}

                        {/* Status line */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {stats.pending > 0 ? (
                            <span className="flex items-center gap-1 text-[#f5a623] text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              {stats.pending} pending
                            </span>
                          ) : stats.total > 0 ? (
                            <span className="flex items-center gap-1 text-[#2ec4b6] text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              All caught up
                            </span>
                          ) : (
                            <span className="text-[#8a8a9a] text-xs">No questions yet</span>
                          )}
                          {stats.answered > 0 && (
                            <span className="text-[#8a8a9a] text-xs">
                              {stats.answered} answered
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enter arrow */}
                      <DoorOpen className="w-5 h-5 text-[#8a8a9a] group-hover:text-[#f5a623] transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* ═══════════ PUBLISHED INTERVIEWS (ANSWERED ONLY) ═══════════ */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Published Interviews</h2>
              <p className="text-[#8a8a9a] text-sm">
                {answeredInterviews.length} response{answeredInterviews.length !== 1 ? 's' : ''} from the drivers
              </p>
            </div>

            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="px-4 py-2 bg-[#14141f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors text-sm"
            >
              <option value="all">All Races</option>
              {racesWithAnswers.map((r) => (
                <option key={r.id} value={r.id}>
                  Race {r.race_number}: {r.track_name}
                </option>
              ))}
            </select>
          </div>

          {sortedRaceIds.length === 0 ? (
            <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
              <Mic className="w-12 h-12 text-[#2a2a3e] mx-auto mb-4" />
              <p className="text-[#8a8a9a] text-lg">No published interviews yet.</p>
              <p className="text-[#8a8a9a] text-sm mt-1">
                Once drivers submit their answers, they'll appear here.
              </p>
            </div>
          ) : (
            sortedRaceIds.map((raceId) => {
              const race = scheduleMap[raceId];
              const interviews = groupedByRace[raceId];
              const preRace = interviews.filter((q) => q.question_type === 'pre_race');
              const postRace = interviews.filter((q) => q.question_type === 'post_race');

              return (
                <div key={raceId} className="mb-10">
                  {/* Race header */}
                  <div className="flex items-center gap-4 mb-4 pb-3 border-b border-[#2a2a3e]">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e]">
                      <span className="text-white font-bold text-sm">{race?.race_number}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{race?.track_name}</h3>
                      <p className="text-[#8a8a9a] text-sm">
                        {interviews.length} response{interviews.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Pre-Race */}
                  {preRace.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#f5a623]"></span>
                        Pre-Race
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {preRace.map((q) => (
                          <AnsweredCard
                            key={q.id}
                            question={q}
                            expanded={expandedCards.has(q.id)}
                            onToggle={() => toggleExpand(q.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Post-Race */}
                  {postRace.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-[#2ec4b6] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2ec4b6]"></span>
                        Post-Race
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {postRace.map((q) => (
                          <AnsweredCard
                            key={q.id}
                            question={q}
                            expanded={expandedCards.has(q.id)}
                            onToggle={() => toggleExpand(q.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Answered Interview Card ═══════════ */
function AnsweredCard({ question, expanded, onToggle }) {
  const q = question;
  const driver = q.drivers;
  const colors = TYPE_COLORS[q.question_type];

  return (
    <div
      className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden hover:border-[#f5a623]/50 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center">
            <span className="text-white font-bold text-xs">#{driver?.car_number}</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{driver?.name}</p>
            {driver?.nickname && (
              <p className="text-[#8a8a9a] text-xs">"{driver.nickname}"</p>
            )}
          </div>
        </div>

        <p className="text-[#8a8a9a] text-sm italic mb-2">"{q.question_text}"</p>

        <p className={`text-white ${expanded ? '' : 'line-clamp-3'}`}>
          {q.answer_text}
        </p>
        {q.answer_text && q.answer_text.length > 150 && (
          <button className="text-[#f5a623] text-xs mt-1 hover:underline">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
}
