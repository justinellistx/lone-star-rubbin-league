import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  ChevronDown,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  User,
  AlertCircle,
} from 'lucide-react';
import {
  useInterviews,
  useDrivers,
  useSchedule,
  useDriverInterviews,
  submitInterviewAnswer,
} from '../hooks/useSupabase';

const TYPE_LABELS = {
  pre_race: 'Pre-Race',
  post_race: 'Post-Race',
};

const TYPE_COLORS = {
  pre_race: { bg: 'bg-[#f5a623]', text: 'text-[#f5a623]', border: 'border-[#f5a623]' },
  post_race: { bg: 'bg-[#2ec4b6]', text: 'text-[#2ec4b6]', border: 'border-[#2ec4b6]' },
};

export default function Interviews() {
  const { data: allInterviews, loading: interviewsLoading, refresh: refreshInterviews } = useInterviews();
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);

  // Tabs: browse | submit
  const [activeTab, setActiveTab] = useState('browse');

  // Browse filters
  const [selectedRace, setSelectedRace] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Submit flow
  const [pickerId, setPickerId] = useState('');
  const { data: myInterviews, loading: myLoading, refresh: refreshMine } = useDriverInterviews(pickerId);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Build schedule lookup
  const scheduleMap = useMemo(() => {
    if (!schedule) return {};
    const map = {};
    schedule.forEach((s) => { map[s.id] = s; });
    return map;
  }, [schedule]);

  // Races that have interviews
  const racesWithInterviews = useMemo(() => {
    if (!allInterviews || !schedule) return [];
    const raceIds = [...new Set(allInterviews.map((q) => q.schedule_id))];
    return raceIds
      .map((id) => scheduleMap[id])
      .filter(Boolean)
      .sort((a, b) => b.race_number - a.race_number);
  }, [allInterviews, schedule, scheduleMap]);

  // Filtered interviews for browse tab
  const filteredInterviews = useMemo(() => {
    if (!allInterviews) return [];
    let filtered = allInterviews;
    if (selectedRace !== 'all') {
      filtered = filtered.filter((q) => q.schedule_id === selectedRace);
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter((q) => q.question_type === selectedType);
    }
    return filtered;
  }, [allInterviews, selectedRace, selectedType]);

  // Group filtered interviews by race for display
  const groupedByRace = useMemo(() => {
    const groups = {};
    filteredInterviews.forEach((q) => {
      const key = q.schedule_id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    // Sort each group: pre_race first, then by driver name
    Object.values(groups).forEach((arr) => {
      arr.sort((a, b) => {
        if (a.question_type !== b.question_type) return a.question_type === 'pre_race' ? -1 : 1;
        return (a.drivers?.name || '').localeCompare(b.drivers?.name || '');
      });
    });
    return groups;
  }, [filteredInterviews]);

  // Sort race groups by race_number descending
  const sortedRaceIds = useMemo(() => {
    return Object.keys(groupedByRace).sort((a, b) => {
      const ra = scheduleMap[a]?.race_number || 0;
      const rb = scheduleMap[b]?.race_number || 0;
      return rb - ra;
    });
  }, [groupedByRace, scheduleMap]);

  // My unanswered questions for submit tab
  const myUnanswered = useMemo(() => {
    if (!myInterviews) return [];
    return myInterviews.filter((q) => !q.answer_text);
  }, [myInterviews]);

  const myAnswered = useMemo(() => {
    if (!myInterviews) return [];
    return myInterviews.filter((q) => q.answer_text);
  }, [myInterviews]);

  const toggleExpand = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAnswerChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
    setSubmitError('');
  };

  const handleSubmitAnswer = async (questionId) => {
    const text = answers[questionId]?.trim();
    if (!text) { setSubmitError('Please write an answer before submitting'); return; }

    setSubmitting((prev) => ({ ...prev, [questionId]: true }));
    setSubmitError('');
    try {
      await submitInterviewAnswer(questionId, text);
      setSubmitted((prev) => ({ ...prev, [questionId]: true }));
      setAnswers((prev) => ({ ...prev, [questionId]: '' }));
      refreshMine();
      refreshInterviews();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Stats
  const totalAnswered = allInterviews ? allInterviews.filter((q) => q.answer_text).length : 0;
  const totalQuestions = allInterviews ? allInterviews.length : 0;

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
            Hear from the drivers — pre-race predictions, post-race reactions, and everything in between.
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <span className="text-[#8a8a9a]">
              <span className="text-white font-bold">{totalAnswered}</span> / {totalQuestions} responses in
            </span>
            <span className="text-[#8a8a9a]">
              <span className="text-white font-bold">{racesWithInterviews.length}</span> race{racesWithInterviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[#14141f] p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-[#f5a623] text-[#0a0a0f]'
                : 'text-[#8a8a9a] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Browse Interviews
            </span>
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === 'submit'
                ? 'bg-[#f5a623] text-[#0a0a0f]'
                : 'text-[#8a8a9a] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Submit Answers
            </span>
          </button>
        </div>

        {/* ═══════════════════ BROWSE TAB ═══════════════════ */}
        {activeTab === 'browse' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-[#8a8a9a] mb-1 uppercase tracking-wider">Race</label>
                <select
                  value={selectedRace}
                  onChange={(e) => setSelectedRace(e.target.value)}
                  className="px-4 py-2 bg-[#14141f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors min-w-[180px]"
                >
                  <option value="all">All Races</option>
                  {racesWithInterviews.map((r) => (
                    <option key={r.id} value={r.id}>
                      Race {r.race_number}: {r.track_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8a8a9a] mb-1 uppercase tracking-wider">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 bg-[#14141f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors min-w-[160px]"
                >
                  <option value="all">All Types</option>
                  <option value="pre_race">Pre-Race</option>
                  <option value="post_race">Post-Race</option>
                </select>
              </div>
            </div>

            {/* Interview Cards grouped by race */}
            {sortedRaceIds.length === 0 ? (
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
                <Mic className="w-12 h-12 text-[#2a2a3e] mx-auto mb-4" />
                <p className="text-[#8a8a9a] text-lg">No interviews yet.</p>
                <p className="text-[#8a8a9a] text-sm mt-1">Check back before race day for driver interviews.</p>
              </div>
            ) : (
              sortedRaceIds.map((raceId) => {
                const race = scheduleMap[raceId];
                const interviews = groupedByRace[raceId];
                const answered = interviews.filter((q) => q.answer_text).length;
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
                        <h2 className="text-2xl font-bold text-white">{race?.track_name}</h2>
                        <p className="text-[#8a8a9a] text-sm">
                          {answered} of {interviews.length} responses
                          {race?.status === 'upcoming' && (
                            <span className="ml-2 text-[#f5a623] font-medium">— Upcoming</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Pre-Race Section */}
                    {preRace.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#f5a623]"></span>
                          Pre-Race Interviews
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {preRace.map((q) => (
                            <InterviewCard
                              key={q.id}
                              question={q}
                              scheduleMap={scheduleMap}
                              expanded={expandedCards.has(q.id)}
                              onToggle={() => toggleExpand(q.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Post-Race Section */}
                    {postRace.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-[#2ec4b6] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#2ec4b6]"></span>
                          Post-Race Interviews
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {postRace.map((q) => (
                            <InterviewCard
                              key={q.id}
                              question={q}
                              scheduleMap={scheduleMap}
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
        )}

        {/* ═══════════════════ SUBMIT TAB ═══════════════════ */}
        {activeTab === 'submit' && (
          <div>
            {/* Driver identity */}
            <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-6">
              <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#f5a623]" />
                Who are you?
              </label>
              <select
                value={pickerId}
                onChange={(e) => {
                  setPickerId(e.target.value);
                  setAnswers({});
                  setSubmitted({});
                  setSubmitError('');
                }}
                className="w-full md:w-80 px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors text-lg"
              >
                <option value="">Select your name...</option>
                {drivers
                  ?.filter((d) => d.active)
                  .sort((a, b) => (a.car_number || 0) - (b.car_number || 0))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      #{d.car_number} — {d.name}{d.nickname ? ` "${d.nickname}"` : ''}
                    </option>
                  ))}
              </select>
            </div>

            {!pickerId ? (
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
                <User className="w-12 h-12 text-[#2a2a3e] mx-auto mb-4" />
                <p className="text-[#8a8a9a] text-lg">Select your name above to see your interview questions.</p>
              </div>
            ) : myLoading ? (
              <div className="text-center py-12">
                <Mic className="w-8 h-8 text-[#f5a623] animate-pulse mx-auto mb-4" />
                <p className="text-[#8a8a9a]">Loading your questions...</p>
              </div>
            ) : (
              <div>
                {submitError && (
                  <div className="mb-4 p-4 bg-[#1a1a2e] border border-[#e63946] rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#e63946] flex-shrink-0 mt-0.5" />
                    <p className="text-[#e63946]">{submitError}</p>
                  </div>
                )}

                {/* Unanswered questions */}
                {myUnanswered.length > 0 ? (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#f5a623]" />
                      Waiting for Your Response ({myUnanswered.length})
                    </h3>
                    <div className="space-y-4">
                      {myUnanswered.map((q) => {
                        const race = scheduleMap[q.schedule_id];
                        const colors = TYPE_COLORS[q.question_type];
                        return (
                          <div
                            key={q.id}
                            className={`bg-[#14141f] border rounded-lg p-6 ${colors.border}`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`${colors.bg} text-white text-xs font-bold px-2 py-1 rounded`}>
                                {TYPE_LABELS[q.question_type]}
                              </span>
                              <span className="text-[#8a8a9a] text-sm">
                                Race {race?.race_number}: {race?.track_name}
                              </span>
                            </div>

                            <p className="text-white text-lg font-medium mb-4">
                              "{q.question_text}"
                            </p>

                            {submitted[q.id] ? (
                              <div className="flex items-center gap-2 text-[#2ec4b6]">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Answer submitted!</span>
                              </div>
                            ) : (
                              <div>
                                <textarea
                                  value={answers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  placeholder="Type your answer here... Be yourself, talk trash, hype it up!"
                                  rows="3"
                                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors resize-none mb-3"
                                />
                                <button
                                  onClick={() => handleSubmitAnswer(q.id)}
                                  disabled={submitting[q.id]}
                                  className="flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#e59b1a] transition-colors disabled:opacity-50"
                                >
                                  <Send className="w-4 h-4" />
                                  {submitting[q.id] ? 'Submitting...' : 'Submit Answer'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8 text-center mb-8">
                    <CheckCircle className="w-10 h-10 text-[#2ec4b6] mx-auto mb-3" />
                    <p className="text-white text-lg font-medium">You're all caught up!</p>
                    <p className="text-[#8a8a9a] text-sm mt-1">No pending questions right now. Check back before the next race.</p>
                  </div>
                )}

                {/* Previously answered */}
                {myAnswered.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#2ec4b6]" />
                      Your Previous Answers ({myAnswered.length})
                    </h3>
                    <div className="space-y-3">
                      {myAnswered.map((q) => {
                        const race = scheduleMap[q.schedule_id];
                        const colors = TYPE_COLORS[q.question_type];
                        return (
                          <div
                            key={q.id}
                            className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-5"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`${colors.bg} text-white text-xs font-bold px-2 py-1 rounded`}>
                                {TYPE_LABELS[q.question_type]}
                              </span>
                              <span className="text-[#8a8a9a] text-sm">
                                Race {race?.race_number}: {race?.track_name}
                              </span>
                            </div>
                            <p className="text-[#8a8a9a] text-sm mb-2">"{q.question_text}"</p>
                            <p className="text-white">{q.answer_text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ Interview Card Component ═══════════════════ */
function InterviewCard({ question, scheduleMap, expanded, onToggle }) {
  const q = question;
  const driver = q.drivers;
  const colors = TYPE_COLORS[q.question_type];
  const hasAnswer = !!q.answer_text;

  return (
    <div
      className={`bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden hover:border-[#f5a623]/50 transition-colors cursor-pointer`}
      onClick={onToggle}
    >
      <div className="p-5">
        {/* Driver header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
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
          {hasAnswer ? (
            <CheckCircle className="w-4 h-4 text-[#2ec4b6]" />
          ) : (
            <Clock className="w-4 h-4 text-[#8a8a9a]" />
          )}
        </div>

        {/* Question */}
        <p className="text-[#8a8a9a] text-sm italic mb-2">"{q.question_text}"</p>

        {/* Answer or awaiting */}
        {hasAnswer ? (
          <div>
            <p className={`text-white ${expanded ? '' : 'line-clamp-2'}`}>
              {q.answer_text}
            </p>
            {q.answer_text.length > 120 && (
              <button className="text-[#f5a623] text-xs mt-1 hover:underline">
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-[#8a8a9a] text-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Awaiting response...
          </p>
        )}
      </div>
    </div>
  );
}
