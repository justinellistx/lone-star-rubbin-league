import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Mic,
  ArrowLeft,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import {
  useDrivers,
  useSchedule,
  useDriverInterviews,
  submitInterviewAnswer,
} from '../hooks/useSupabase';

const TYPE_LABELS = { pre_race: 'Pre-Race', post_race: 'Post-Race' };
const TYPE_COLORS = {
  pre_race: { bg: 'bg-[#d00000]', border: 'border-[#d00000]', glow: 'shadow-[#f5a623]/10' },
  post_race: { bg: 'bg-[#2ec4b6]', border: 'border-[#2ec4b6]', glow: 'shadow-[#2ec4b6]/10' },
};

export default function InterviewRoom() {
  const { driverId } = useParams();
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);
  const { data: myInterviews, loading: interviewsLoading, refresh } = useDriverInterviews(driverId);

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [justSubmitted, setJustSubmitted] = useState({});
  const [error, setError] = useState('');

  const driver = useMemo(() => {
    return drivers?.find((d) => d.id === driverId) || null;
  }, [drivers, driverId]);

  const scheduleMap = useMemo(() => {
    if (!schedule) return {};
    const map = {};
    schedule.forEach((s) => { map[s.id] = s; });
    return map;
  }, [schedule]);

  // Split into pending vs answered
  const pending = useMemo(() => {
    if (!myInterviews) return [];
    return myInterviews
      .filter((q) => !q.answer_text)
      .sort((a, b) => {
        const ra = scheduleMap[a.schedule_id]?.race_number || 0;
        const rb = scheduleMap[b.schedule_id]?.race_number || 0;
        if (ra !== rb) return rb - ra; // newest race first
        return a.question_type === 'pre_race' ? -1 : 1;
      });
  }, [myInterviews, scheduleMap]);

  const answered = useMemo(() => {
    if (!myInterviews) return [];
    return myInterviews
      .filter((q) => q.answer_text)
      .sort((a, b) => {
        const ra = scheduleMap[a.schedule_id]?.race_number || 0;
        const rb = scheduleMap[b.schedule_id]?.race_number || 0;
        if (ra !== rb) return rb - ra;
        return a.question_type === 'pre_race' ? -1 : 1;
      });
  }, [myInterviews, scheduleMap]);

  const handleSubmit = async (questionId) => {
    const text = answers[questionId]?.trim();
    if (!text) { setError('Write something before submitting!'); return; }

    setSubmitting((prev) => ({ ...prev, [questionId]: true }));
    setError('');
    try {
      await submitInterviewAnswer(questionId, text);
      setJustSubmitted((prev) => ({ ...prev, [questionId]: true }));
      setAnswers((prev) => ({ ...prev, [questionId]: '' }));
      // Brief celebration before refresh
      setTimeout(() => {
        refresh();
        setJustSubmitted((prev) => ({ ...prev, [questionId]: false }));
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit. Try again.');
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const isLoading = driversLoading || scheduleLoading || interviewsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <Mic className="w-8 h-8 text-[#d00000] animate-pulse mx-auto mb-4" />
          <p className="text-[#6c6d6f]">Entering media room...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <p className="text-[#cc0000] text-lg mb-4">Driver not found</p>
          <Link to="/interviews" className="text-[#d00000] hover:underline">
            Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/interviews"
          className="inline-flex items-center gap-2 text-[#6c6d6f] hover:text-[#d00000] transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interviews
        </Link>

        {/* Driver Header */}
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#f0f0f0] border-2 border-[#d00000] flex items-center justify-center flex-shrink-0">
              <span className="text-[#131313] font-bold text-2xl">#{driver.car_number}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#131313]">{driver.name}</h1>
              {driver.nickname && (
                <p className="text-[#d00000] text-lg">"{driver.nickname}"</p>
              )}
              <p className="text-[#6c6d6f] text-sm mt-1 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Media Room
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#f0f0f0] border border-[#e63946] rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#cc0000] flex-shrink-0 mt-0.5" />
            <p className="text-[#cc0000]">{error}</p>
          </div>
        )}

        {/* ═══════════ PENDING QUESTIONS ═══════════ */}
        {pending.length > 0 ? (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[#131313] mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d00000]" />
              Your Questions ({pending.length})
            </h2>
            <p className="text-[#6c6d6f] text-sm mb-5">
              Answer these — your responses will be published for the league to see.
            </p>

            <div className="space-y-5">
              {pending.map((q) => {
                const race = scheduleMap[q.schedule_id];
                const colors = TYPE_COLORS[q.question_type];
                const isSubmitting = submitting[q.id];
                const wasJustSubmitted = justSubmitted[q.id];

                return (
                  <div
                    key={q.id}
                    className={`bg-white border rounded-xl p-6 transition-all ${
                      wasJustSubmitted
                        ? 'border-[#2ec4b6] shadow-lg shadow-[#2ec4b6]/10'
                        : `${colors.border}`
                    }`}
                  >
                    {/* Badge row */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`${colors.bg} text-[#131313] text-xs font-bold px-2.5 py-1 rounded`}>
                        {TYPE_LABELS[q.question_type]}
                      </span>
                      <span className="text-[#6c6d6f] text-sm">
                        Race {race?.race_number}: {race?.track_name}
                      </span>
                    </div>

                    {/* The question */}
                    <p className="text-[#131313] text-xl font-medium leading-relaxed mb-5">
                      "{q.question_text}"
                    </p>

                    {wasJustSubmitted ? (
                      <div className="flex items-center gap-3 py-3">
                        <CheckCircle className="w-6 h-6 text-[#008564]" />
                        <span className="text-[#008564] font-semibold text-lg">Answer submitted!</span>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={answers[q.id] || ''}
                          onChange={(e) => {
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
                            setError('');
                          }}
                          placeholder="Speak your mind... talk trash, hype it up, keep it real."
                          rows="4"
                          className="w-full px-4 py-3 bg-[#f5f5f5] border border-[#e0e0e0] text-[#131313] placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#d00000] transition-colors resize-none text-base mb-4"
                        />
                        <button
                          onClick={() => handleSubmit(q.id)}
                          disabled={isSubmitting || !answers[q.id]?.trim()}
                          className="flex items-center gap-2 px-8 py-3 bg-[#d00000] text-[#0a0a0f] font-bold rounded-lg hover:bg-[#e59b1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
                        >
                          <Send className="w-4 h-4" />
                          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e0e0e0] rounded-xl p-8 text-center mb-10">
            <CheckCircle className="w-10 h-10 text-[#008564] mx-auto mb-3" />
            <p className="text-[#131313] text-lg font-medium">You're all caught up!</p>
            <p className="text-[#6c6d6f] text-sm mt-1">
              No pending questions. Check back before the next race.
            </p>
          </div>
        )}

        {/* Previous answers — just a count confirmation, no content shown */}
        {answered.length > 0 && (
          <div className="bg-white border border-[#e0e0e0] rounded-xl p-6 text-center">
            <MessageSquare className="w-8 h-8 text-[#008564] mx-auto mb-2" />
            <p className="text-[#131313] font-medium">
              You've submitted {answered.length} interview{answered.length !== 1 ? 's' : ''} this season.
            </p>
            <p className="text-[#6c6d6f] text-sm mt-1">
              Your answers will appear in generated news stories on the News page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
