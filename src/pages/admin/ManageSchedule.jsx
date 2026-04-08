import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function ManageSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    stageNumber: '',
    raceNumber: '',
    trackName: '',
    raceDate: '',
    series: '',
    status: 'upcoming',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduleRes, stagesRes] = await Promise.all([
        supabase.from('schedule').select('*').order('race_date'),
        supabase.from('stages').select('*').order('stage_number'),
      ]);

      if (scheduleRes.error) throw scheduleRes.error;
      if (stagesRes.error) throw stagesRes.error;

      setSchedule(scheduleRes.data || []);
      setStages(stagesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      stageNumber: '',
      raceNumber: '',
      trackName: '',
      raceDate: '',
      series: '',
      status: 'upcoming',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.stageNumber || !formData.trackName || !formData.raceDate) {
      setError('Stage, track name, and race date are required');
      return;
    }

    try {
      // Find the stage ID
      const stage = stages.find((s) => s.stage_number === parseInt(formData.stageNumber));
      if (!stage) {
        setError('Invalid stage selected');
        return;
      }

      if (editingId) {
        // Update existing schedule entry
        const { error: updateError } = await supabase
          .from('schedule')
          .update({
            stage_number: parseInt(formData.stageNumber),
            race_number: parseInt(formData.raceNumber) || 1,
            track_name: formData.trackName,
            race_date: formData.raceDate,
            series: formData.series || '',
            status: formData.status,
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
        setSuccess('Schedule entry updated successfully');
      } else {
        // Add new schedule entry
        const { error: insertError } = await supabase.from('schedule').insert({
          season_id: stage.season_id,
          stage_number: parseInt(formData.stageNumber),
          race_number: parseInt(formData.raceNumber) || 1,
          track_name: formData.trackName,
          race_date: formData.raceDate,
          series: formData.series || '',
          status: formData.status,
        });

        if (insertError) throw insertError;
        setSuccess('Schedule entry added successfully');
      }

      fetchData();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving schedule entry:', err);
      setError(err.message || 'Failed to save schedule entry');
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      stageNumber: entry.stage_number,
      raceNumber: entry.race_number,
      trackName: entry.track_name,
      raceDate: entry.race_date,
      series: entry.series || '',
      status: entry.status,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule entry?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('schedule')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSuccess('Schedule entry deleted successfully');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err.message || 'Failed to delete schedule entry');
    }
  };

  const getStageInfo = (stageNumber) => {
    const stage = stages.find((s) => s.stage_number === stageNumber);
    return stage?.name || `Stage ${stageNumber}`;
  };

  return (
    <div className="p-8 bg-[#0a0a0f] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Schedule</h1>
            <p className="text-[#8a8a9a]">View and edit the league race schedule</p>
          </div>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#e59b1a] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Race
          </button>
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

        {/* Form */}
        {showForm && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Schedule Entry' : 'Add Race to Schedule'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Stage <span className="text-[#e63946]">*</span>
                </label>
                <select
                  value={formData.stageNumber}
                  onChange={(e) => setFormData({ ...formData, stageNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                >
                  <option value="">Select stage...</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.stage_number}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Race Number <span className="text-[#e63946]">*</span>
                </label>
                <input
                  type="number"
                  value={formData.raceNumber}
                  onChange={(e) => setFormData({ ...formData, raceNumber: e.target.value })}
                  placeholder="1-12"
                  min="1"
                  max="12"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Track Name <span className="text-[#e63946]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.trackName}
                  onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                  placeholder="Daytona"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Race Date <span className="text-[#e63946]">*</span>
                </label>
                <input
                  type="date"
                  value={formData.raceDate}
                  onChange={(e) => setFormData({ ...formData, raceDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Series</label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  placeholder="NASCAR Cup"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="md:col-span-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] transition-colors"
                >
                  {editingId ? 'Update Entry' : 'Add Entry'}
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

        {/* Schedule Table */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#f5a623] mx-auto mb-4" />
            <p className="text-[#8a8a9a]">Loading schedule...</p>
          </div>
        ) : (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
            {schedule.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[#8a8a9a]">No scheduled races. Add one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a2e] border-b border-[#2a2a3e]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Race #
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Track
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Series
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-[#8a8a9a]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">
                          {getStageInfo(entry.stage_number)}
                        </td>
                        <td className="px-6 py-4 text-[#8a8a9a]">{entry.race_number}</td>
                        <td className="px-6 py-4 text-white">{entry.track_name}</td>
                        <td className="px-6 py-4 text-[#8a8a9a]">
                          {new Date(entry.race_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-[#8a8a9a]">{entry.series || '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              entry.status === 'completed'
                                ? 'bg-[#2ec4b6] text-white'
                                : entry.status === 'upcoming'
                                  ? 'bg-[#f5a623] text-[#0a0a0f]'
                                  : 'bg-[#e63946] text-white'
                            }`}
                          >
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-2 text-[#f5a623] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 text-[#e63946] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
