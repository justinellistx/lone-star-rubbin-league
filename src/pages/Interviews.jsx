import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  CheckCircle,
  Clock,
  DoorOpen,
} from 'lucide-react';
import {
  useInterviews,
  useDrivers,
  useSchedule,
} from '../hooks/useSupabase';

export default function Interviews() {
  const { data: allInterviews, loading: interviewsLoading } = useInterviews();
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);

  const scheduleMap = useMemo(() => {
    if (!schedule) return {};
    const map = {};
    schedule.forEach((s) => { map[s.id] = s; });
    return map;
  }, [schedule]);

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

  const isLoading = interviewsLoading || driversLoading || scheduleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <Mic className="w-8 h-8 text-[#d00000] animate-pulse mx-auto mb-4" />
          <p className="text-[#6c6d6f]">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mic className="w-8 h-8 text-[#d00000]" />
            <h1 className="text-4xl font-bold text-[#131313]">Driver Interviews</h1>
          </div>
          <p className="text-[#6c6d6f] text-lg">
            Pre-race predictions, post-race reactions, and everything in between.
          </p>
        </div>

        {/* ═══════════ DRIVER CARDS — MEDIA ROOM ENTRY ═══════════ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#131313] mb-1">Media Room</h2>
          <p className="text-[#6c6d6f] text-sm mb-5">
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
                    className="group bg-white border border-[#e0e0e0] rounded-lg p-5 hover:border-[#d00000] transition-all hover:shadow-lg hover:shadow-[#f5a623]/5"
                  >
                    <div className="flex items-center gap-4">
                      {/* Driver number badge */}
                      <div className="w-14 h-14 rounded-full bg-[#f0f0f0] border-2 border-[#e0e0e0] group-hover:border-[#d00000] transition-colors flex items-center justify-center flex-shrink-0">
                        <span className="text-[#131313] font-bold text-lg">#{d.car_number}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[#131313] font-bold text-lg truncate">{d.name}</p>
                        {d.nickname && (
                          <p className="text-[#6c6d6f] text-sm">"{d.nickname}"</p>
                        )}

                        {/* Status line */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {stats.pending > 0 ? (
                            <span className="flex items-center gap-1 text-[#d00000] text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              {stats.pending} pending
                            </span>
                          ) : stats.total > 0 ? (
                            <span className="flex items-center gap-1 text-[#008564] text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              All caught up
                            </span>
                          ) : (
                            <span className="text-[#6c6d6f] text-xs">No questions yet</span>
                          )}
                          {stats.answered > 0 && (
                            <span className="text-[#6c6d6f] text-xs">
                              {stats.answered} answered
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enter arrow */}
                      <DoorOpen className="w-5 h-5 text-[#6c6d6f] group-hover:text-[#d00000] transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Info callout — answers feed into News */}
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 text-center">
          <Mic className="w-8 h-8 text-[#d00000] mx-auto mb-2" />
          <p className="text-[#131313] font-medium">Driver answers fuel the storylines.</p>
          <p className="text-[#6c6d6f] text-sm mt-1">
            Interview responses are woven into race previews and recaps on the{' '}
            <Link to="/news" className="text-[#d00000] hover:underline">News page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

