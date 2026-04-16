import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { generatePreRacePreview, generatePostRaceRecap } from '../../lib/storyGenerator';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  EyeOff,
  Mic,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Newspaper,
} from 'lucide-react';

// Pre-built question bank for quick assignment
const QUESTION_BANK = {
  pre_race: [
    "How are you feeling about {track} this week?",
    "Who do you think will be your biggest competition at {track}?",
    "What's your strategy going into the race?",
    "Is there any unfinished business from last race?",
    "What would a win at {track} mean for your season?",
    "Do you feel any pressure with the points standings right now?",
    "Are you more focused on winning or playing it safe this week?",
    "Which driver are you keeping an eye on?",
    "How do you plan to handle the first few laps?",
    "What's the one thing you need to avoid this weekend?",
    "Can you turn around your recent results at {track}?",
    "Are you coming into this race with any chip on your shoulder?",
    "How important is stage strategy at this track?",
    "Is there a rivalry heating up that fans should watch for?",
    "What have you learned from your last few races?",
  ],
  post_race: [
    "Walk us through your race. How did it go out there?",
    "Are you satisfied with where you finished?",
    "Was there a moment that changed the race for you?",
    "Did the race play out the way you expected?",
    "What happened on that restart?",
    "Is there anything you'd do differently?",
    "How do you feel about your points position now?",
    "Any thoughts on the incident during the race?",
    "What's the mood in the team right now?",
    "Looking ahead to next week, what's the plan?",
    "Did you accomplish what you set out to do today?",
    "Were you happy with the car or did you have to fight it?",
    "Any message for the fans after that performance?",
    "How would you rate your season so far after today?",
    "Is this the turning point you've been looking for?",
  ],
};

export default function ManageInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    scheduleId: '',
    driverId: '',
    questionType: 'pre_race',
    questionText: '',
    published: true,
  });

  // Bulk assignment
  const [showBulk, setShowBulk] = useState(false);
  const [bulkScheduleId, setBulkScheduleId] = useState('');
  const [bulkType, setBulkType] = useState('pre_race');
  const [bulkQuestions, setBulkQuestions] = useState({});

  // Filter
  const [filterRace, setFilterRace] = useState('all');

  // Collapsed race groups
  const [collapsedRaces, setCollapsedRaces] = useState(new Set());

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [interviewsRes, driversRes, scheduleRes] = await Promise.all([
        supabase
          .from('interview_questions')
          .select('*, drivers ( id, name, car_number, nickname )')
          .order('created_at', { ascending: false }),
        supabase
          .from('drivers')
          .select('*')
          .eq('active', true)
          .order('car_number', { ascending: true }),
        supabase
          .from('schedule')
          .select('*')
          .order('race_number', { ascending: true }),
      ]);

      if (interviewsRes.error) throw interviewsRes.error;
      if (driversRes.error) throw driversRes.error;
      if (scheduleRes.error) throw scheduleRes.error;

      setInterviews(interviewsRes.data || []);
      setDrivers(driversRes.data || []);
      setSchedule(scheduleRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const scheduleMap = useMemo(() => {
    const map = {};
    schedule.forEach((s) => { map[s.id] = s; });
    return map;
  }, [schedule]);

  // Upcoming + recent completed races for the dropdown
  const relevantRaces = useMemo(() => {
    return schedule.filter(
      (s) => s.status === 'upcoming' || s.status === 'completed'
    );
  }, [schedule]);

  // Group interviews by race
  const groupedInterviews = useMemo(() => {
    let filtered = interviews;
    if (filterRace !== 'all') {
      filtered = filtered.filter((q) => q.schedule_id === filterRace);
    }
    const groups = {};
    filtered.forEach((q) => {
      const key = q.schedule_id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    return groups;
  }, [interviews, filterRace]);

  const sortedRaceIds = useMemo(() => {
    return Object.keys(groupedInterviews).sort((a, b) => {
      const ra = scheduleMap[a]?.race_number || 0;
      const rb = scheduleMap[b]?.race_number || 0;
      return rb - ra;
    });
  }, [groupedInterviews, scheduleMap]);

  const resetForm = () => {
    setFormData({
      scheduleId: '',
      driverId: '',
      questionType: 'pre_race',
      questionText: '',
      published: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.scheduleId || !formData.driverId || !formData.questionText) {
      setError('Race, driver, and question are required');
      return;
    }

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('interview_questions')
          .update({
            schedule_id: formData.scheduleId,
            driver_id: formData.driverId,
            question_type: formData.questionType,
            question_text: formData.questionText,
            published: formData.published,
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
        setSuccess('Question updated');
      } else {
        const { error: insertError } = await supabase.from('interview_questions').insert({
          schedule_id: formData.scheduleId,
          driver_id: formData.driverId,
          question_type: formData.questionType,
          question_text: formData.questionText,
          published: formData.published,
        });

        if (insertError) throw insertError;
        setSuccess('Question created');
      }

      fetchAll();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.message || 'Failed to save question');
    }
  };

  const handleEdit = (q) => {
    setFormData({
      scheduleId: q.schedule_id,
      driverId: q.driver_id,
      questionType: q.question_type,
      questionText: q.question_text,
      published: q.published,
    });
    setEditingId(q.id);
    setShowForm(true);
    setShowBulk(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this interview question?')) return;
    try {
      const { error: deleteError } = await supabase
        .from('interview_questions')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setSuccess('Question deleted');
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err.message || 'Failed to delete');
    }
  };

  const togglePublished = async (q) => {
    try {
      const { error: updateError } = await supabase
        .from('interview_questions')
        .update({ published: !q.published })
        .eq('id', q.id);
      if (updateError) throw updateError;
      fetchAll();
    } catch (err) {
      console.error('Error toggling published:', err);
      setError('Failed to update');
    }
  };

  // ── Bulk assign ──
  const handleOpenBulk = () => {
    setShowBulk(true);
    setShowForm(false);
    setBulkQuestions({});
  };

  const randomizeQuestion = (driverId, trackName) => {
    const pool = QUESTION_BANK[bulkType];
    const q = pool[Math.floor(Math.random() * pool.length)].replace('{track}', trackName);
    setBulkQuestions((prev) => ({ ...prev, [driverId]: q }));
  };

  const randomizeAllQuestions = () => {
    const race = scheduleMap[bulkScheduleId];
    const trackName = race?.track_name || 'the track';
    const pool = [...QUESTION_BANK[bulkType]];
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const newQuestions = {};
    drivers.forEach((d, idx) => {
      newQuestions[d.id] = pool[idx % pool.length].replace('{track}', trackName);
    });
    setBulkQuestions(newQuestions);
  };

  const handleBulkSubmit = async () => {
    setError('');
    setSuccess('');

    if (!bulkScheduleId) { setError('Select a race first'); return; }

    const rows = drivers
      .filter((d) => bulkQuestions[d.id]?.trim())
      .map((d) => ({
        schedule_id: bulkScheduleId,
        driver_id: d.id,
        question_type: bulkType,
        question_text: bulkQuestions[d.id].trim(),
        published: true,
      }));

    if (rows.length === 0) { setError('No questions to assign'); return; }

    try {
      const { error: insertError } = await supabase
        .from('interview_questions')
        .upsert(rows, { onConflict: 'schedule_id,driver_id,question_type' });

      if (insertError) throw insertError;
      setSuccess(`Assigned ${rows.length} ${bulkType === 'pre_race' ? 'pre-race' : 'post-race'} questions`);
      fetchAll();
      setShowBulk(false);
      setBulkQuestions({});
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error bulk assigning:', err);
      setError(err.message || 'Failed to assign questions');
    }
  };

  const toggleRaceCollapse = (raceId) => {
    setCollapsedRaces((prev) => {
      const next = new Set(prev);
      if (next.has(raceId)) next.delete(raceId);
      else next.add(raceId);
      return next;
    });
  };

  // ── Story Generation ──
  const [generating, setGenerating] = useState(false);

  const handleGenerateStory = async (raceId, type) => {
    setError('');
    setSuccess('');
    setGenerating(true);

    try {
      const race = scheduleMap[raceId];
      if (!race) throw new Error('Race not found');

      // Get interviews for this race + type
      const raceInterviews = interviews
        .filter((q) => q.schedule_id === raceId && q.question_type === type && q.answer_text)
        .map((q) => ({
          driver: {
            name: q.drivers?.name,
            car_number: q.drivers?.car_number,
            nickname: q.drivers?.nickname,
          },
          question_text: q.question_text,
          answer_text: q.answer_text,
        }));

      if (raceInterviews.length === 0) {
        setError(`No answered ${type === 'pre_race' ? 'pre-race' : 'post-race'} interviews for this race yet`);
        setGenerating(false);
        return;
      }

      // Fetch standings — no RPC, build from race_results
      let standingsData = null;

      // Fallback: build standings from race_results
      let standings = [];
      if (!standingsData) {
        const { data: results } = await supabase
          .from('race_results')
          .select('driver_id, total_points, finish_position, laps_led, incidents, start_position, drivers ( name, car_number, nickname )');
        if (results) {
          const driverTotals = {};
          results.forEach((r) => {
            const key = r.driver_id;
            if (!driverTotals[key]) {
              driverTotals[key] = {
                name: r.drivers?.name, car_number: r.drivers?.car_number,
                nickname: r.drivers?.nickname, season_points: 0, wins: 0,
                best_finish: 99, races_run: 0,
              };
            }
            driverTotals[key].season_points += r.total_points || 0;
            driverTotals[key].races_run += 1;
            if (r.finish_position === 1) driverTotals[key].wins += 1;
            if (r.finish_position < driverTotals[key].best_finish) driverTotals[key].best_finish = r.finish_position;
          });
          standings = Object.values(driverTotals).sort((a, b) => b.season_points - a.season_points);
        }
      } else {
        standings = standingsData;
      }

      let article;

      if (type === 'pre_race') {
        article = generatePreRacePreview({
          track: race.track_name,
          raceNumber: race.race_number,
          interviews: raceInterviews,
          standings,
        });
      } else {
        // For post-race, also fetch race results
        let raceResults = [];
        if (race.race_id) {
          const { data: rrData } = await supabase
            .from('race_results')
            .select('*, drivers ( name, car_number, nickname )')
            .eq('race_id', race.race_id)
            .order('finish_position', { ascending: true });
          if (rrData) {
            raceResults = rrData.map((r) => ({
              name: r.drivers?.name, car_number: r.drivers?.car_number || r.car_number,
              nickname: r.drivers?.nickname, finish_position: r.finish_position,
              start_position: r.start_position, incidents: r.incidents,
              laps_led: r.laps_led, total_points: r.total_points,
            }));
          }
        }

        // Find next track
        const nextRace = schedule.find(
          (s) => s.race_number === race.race_number + 1
        );

        article = generatePostRaceRecap({
          track: race.track_name,
          raceNumber: race.race_number,
          interviews: raceInterviews,
          standings,
          raceResults,
          nextTrack: nextRace?.track_name || null,
        });
      }

      if (!article) {
        setError('Could not generate article — no answered interviews');
        setGenerating(false);
        return;
      }

      // Insert into news table
      const { error: newsError } = await supabase.from('news').insert({
        title: article.title,
        subtitle: article.subtitle,
        body: article.body,
        category: article.category,
        published: true,
        published_at: new Date().toISOString(),
      });

      if (newsError) throw newsError;

      const label = type === 'pre_race' ? 'Pre-race preview' : 'Post-race recap';
      setSuccess(`${label} published to News! "${article.title}"`);
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      console.error('Error generating story:', err);
      setError(err.message || 'Failed to generate story');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 bg-[#0a0a0f] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Interviews</h1>
            <p className="text-[#8a8a9a]">
              Assign questions to drivers — they'll answer through the site
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenBulk}
              className="flex items-center gap-2 px-4 py-2 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] transition-colors"
            >
              <Users className="w-5 h-5" />
              Bulk Assign
            </button>
            <button
              onClick={() => { showForm ? resetForm() : setShowForm(true); setShowBulk(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#e59b1a] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Single Question
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#e63946] rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#e63946] flex-shrink-0 mt-0.5" />
            <p className="text-[#e63946]">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#2ec4b6] rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#2ec4b6] flex-shrink-0 mt-0.5" />
            <p className="text-[#2ec4b6]">{success}</p>
          </div>
        )}

        {/* ── Single Question Form ── */}
        {showForm && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Question' : 'Add Single Question'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Race <span className="text-[#e63946]">*</span>
                  </label>
                  <select
                    value={formData.scheduleId}
                    onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                  >
                    <option value="">Select race...</option>
                    {relevantRaces.map((r) => (
                      <option key={r.id} value={r.id}>
                        R{r.race_number}: {r.track_name} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Driver <span className="text-[#e63946]">*</span>
                  </label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                  >
                    <option value="">Select driver...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        #{d.car_number} {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Type</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                  >
                    <option value="pre_race">Pre-Race</option>
                    <option value="post_race">Post-Race</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Question <span className="text-[#e63946]">*</span>
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="e.g. How are you feeling about Bristol this week?"
                  rows="3"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] transition-colors"
                >
                  {editingId ? 'Update Question' : 'Create Question'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 bg-[#1a1a2e] text-[#8a8a9a] font-semibold rounded-lg hover:bg-[#2a2a3e] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Bulk Assign Panel ── */}
        {showBulk && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Bulk Assign Questions</h2>
            <p className="text-[#8a8a9a] text-sm mb-6">
              Assign one question per driver for a race. Use the randomize button or write custom questions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Race</label>
                <select
                  value={bulkScheduleId}
                  onChange={(e) => { setBulkScheduleId(e.target.value); setBulkQuestions({}); }}
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                >
                  <option value="">Select race...</option>
                  {relevantRaces.map((r) => (
                    <option key={r.id} value={r.id}>
                      R{r.race_number}: {r.track_name} ({r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Type</label>
                <select
                  value={bulkType}
                  onChange={(e) => { setBulkType(e.target.value); setBulkQuestions({}); }}
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                >
                  <option value="pre_race">Pre-Race</option>
                  <option value="post_race">Post-Race</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={randomizeAllQuestions}
                  disabled={!bulkScheduleId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#a78bfa] text-white font-semibold rounded-lg hover:bg-[#9678e6] transition-colors disabled:opacity-40"
                >
                  <Zap className="w-4 h-4" />
                  Randomize All
                </button>
              </div>
            </div>

            {bulkScheduleId && (
              <div className="space-y-3 mb-6">
                {drivers.map((d) => {
                  const race = scheduleMap[bulkScheduleId];
                  return (
                    <div key={d.id} className="flex items-start gap-3 bg-[#0a0a0f] rounded-lg p-3 border border-[#2a2a3e]">
                      <div className="w-20 flex-shrink-0 pt-2">
                        <span className="text-white font-bold text-sm">#{d.car_number}</span>
                        <p className="text-[#8a8a9a] text-xs truncate">{d.name}</p>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={bulkQuestions[d.id] || ''}
                          onChange={(e) => setBulkQuestions((prev) => ({ ...prev, [d.id]: e.target.value }))}
                          placeholder={`Question for ${d.nickname || d.name}...`}
                          className="w-full px-3 py-2 bg-[#14141f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors text-sm"
                        />
                      </div>
                      <button
                        onClick={() => randomizeQuestion(d.id, race?.track_name || 'the track')}
                        className="flex-shrink-0 p-2 text-[#a78bfa] hover:bg-[#1a1a2e] rounded-lg transition-colors mt-0.5"
                        title="Random question"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleBulkSubmit}
                disabled={!bulkScheduleId}
                className="flex-1 py-2 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] transition-colors disabled:opacity-40"
              >
                Assign {Object.values(bulkQuestions).filter((q) => q?.trim()).length} Questions
              </button>
              <button
                onClick={() => { setShowBulk(false); setBulkQuestions({}); }}
                className="flex-1 py-2 bg-[#1a1a2e] text-[#8a8a9a] font-semibold rounded-lg hover:bg-[#2a2a3e] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterRace}
            onChange={(e) => setFilterRace(e.target.value)}
            className="px-4 py-2 bg-[#14141f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
          >
            <option value="all">All Races ({interviews.length} questions)</option>
            {relevantRaces.map((r) => {
              const count = interviews.filter((q) => q.schedule_id === r.id).length;
              return (
                <option key={r.id} value={r.id}>
                  R{r.race_number}: {r.track_name} ({count} questions)
                </option>
              );
            })}
          </select>
        </div>

        {/* Interview List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#f5a623] mx-auto mb-4" />
            <p className="text-[#8a8a9a]">Loading interviews...</p>
          </div>
        ) : sortedRaceIds.length === 0 ? (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <Mic className="w-12 h-12 text-[#2a2a3e] mx-auto mb-4" />
            <p className="text-[#8a8a9a]">No interview questions yet. Use "Bulk Assign" to get started.</p>
          </div>
        ) : (
          sortedRaceIds.map((raceId) => {
            const race = scheduleMap[raceId];
            const questions = groupedInterviews[raceId];
            const answered = questions.filter((q) => q.answer_text).length;
            const isCollapsed = collapsedRaces.has(raceId);

            return (
              <div key={raceId} className="mb-6">
                <button
                  onClick={() => toggleRaceCollapse(raceId)}
                  className="w-full flex items-center justify-between p-4 bg-[#14141f] border border-[#2a2a3e] rounded-lg hover:border-[#f5a623] transition-colors mb-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">R{race?.race_number}</span>
                    <span className="text-white">{race?.track_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      race?.status === 'upcoming' ? 'bg-[#f5a623] text-[#0a0a0f]' : 'bg-[#2a2a3e] text-[#8a8a9a]'
                    }`}>
                      {race?.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8a8a9a] text-sm">
                      {answered}/{questions.length} answered
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-[#8a8a9a]" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-[#8a8a9a]" />
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div>
                    {/* Generate Story Buttons */}
                    {answered > 0 && (
                      <div className="flex gap-2 ml-4 mb-3">
                        {questions.some((q) => q.question_type === 'pre_race' && q.answer_text) && (
                          <button
                            onClick={() => handleGenerateStory(raceId, 'pre_race')}
                            disabled={generating}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] text-xs font-semibold rounded-lg hover:bg-[#f5a623]/20 transition-colors disabled:opacity-40"
                          >
                            <Newspaper className="w-3.5 h-3.5" />
                            {generating ? 'Generating...' : 'Generate Pre-Race Preview'}
                          </button>
                        )}
                        {questions.some((q) => q.question_type === 'post_race' && q.answer_text) && (
                          <button
                            onClick={() => handleGenerateStory(raceId, 'post_race')}
                            disabled={generating}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#2ec4b6]/10 border border-[#2ec4b6]/30 text-[#2ec4b6] text-xs font-semibold rounded-lg hover:bg-[#2ec4b6]/20 transition-colors disabled:opacity-40"
                          >
                            <Newspaper className="w-3.5 h-3.5" />
                            {generating ? 'Generating...' : 'Generate Post-Race Recap'}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 ml-4">
                    {questions
                      .sort((a, b) => {
                        if (a.question_type !== b.question_type) return a.question_type === 'pre_race' ? -1 : 1;
                        return (a.drivers?.car_number || 0) - (b.drivers?.car_number || 0);
                      })
                      .map((q) => (
                        <div
                          key={q.id}
                          className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-4 hover:border-[#f5a623]/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                  q.question_type === 'pre_race'
                                    ? 'bg-[#f5a623] text-[#0a0a0f]'
                                    : 'bg-[#2ec4b6] text-white'
                                }`}>
                                  {q.question_type === 'pre_race' ? 'PRE' : 'POST'}
                                </span>
                                <span className="text-white font-medium text-sm">
                                  #{q.drivers?.car_number} {q.drivers?.name}
                                </span>
                                {q.answer_text ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-[#2ec4b6]" />
                                ) : (
                                  <span className="text-[#8a8a9a] text-xs">— awaiting</span>
                                )}
                              </div>
                              <p className="text-[#8a8a9a] text-sm italic">Q: {q.question_text}</p>
                              {q.answer_text && (
                                <p className="text-white text-sm mt-1">A: {q.answer_text}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => togglePublished(q)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  q.published
                                    ? 'text-[#2ec4b6] hover:bg-[#1a1a2e]'
                                    : 'text-[#8a8a9a] hover:bg-[#1a1a2e]'
                                }`}
                                title={q.published ? 'Unpublish' : 'Publish'}
                              >
                                {q.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleEdit(q)}
                                className="p-1.5 text-[#f5a623] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(q.id)}
                                className="p-1.5 text-[#e63946] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
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
  );
}
