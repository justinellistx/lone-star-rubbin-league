import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    carNumber: '',
    custId: '',
    teamId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversRes, teamsRes] = await Promise.all([
        supabase.from('drivers').select('*').order('name'),
        supabase.from('teams').select('*'),
      ]);

      if (driversRes.error) throw driversRes.error;
      if (teamsRes.error) throw teamsRes.error;

      setDrivers(driversRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      carNumber: '',
      custId: '',
      teamId: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.custId) {
      setError('Name and iRacing ID are required');
      return;
    }

    try {
      if (editingId) {
        // Update existing driver
        const { error: updateError } = await supabase
          .from('drivers')
          .update({
            name: formData.name,
            car_number: formData.carNumber ? parseInt(formData.carNumber) : null,
            cust_id: parseInt(formData.custId),
            team_id: formData.teamId || null,
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
        setSuccess('Driver updated successfully');
      } else {
        // Add new driver
        const { error: insertError } = await supabase.from('drivers').insert({
          name: formData.name,
          car_number: formData.carNumber ? parseInt(formData.carNumber) : null,
          cust_id: parseInt(formData.custId),
          team_id: formData.teamId || null,
          active: true,
        });

        if (insertError) throw insertError;
        setSuccess('Driver added successfully');
      }

      fetchData();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving driver:', err);
      setError(err.message || 'Failed to save driver');
    }
  };

  const handleEdit = (driver) => {
    setFormData({
      name: driver.name,
      carNumber: driver.car_number || '',
      custId: driver.cust_id || '',
      teamId: driver.team_id || '',
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSuccess('Driver deleted successfully');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting driver:', err);
      setError(err.message || 'Failed to delete driver');
    }
  };

  const toggleActive = async (driver) => {
    try {
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ active: !driver.active })
        .eq('id', driver.id);

      if (updateError) throw updateError;
      fetchData();
    } catch (err) {
      console.error('Error toggling driver:', err);
      setError('Failed to update driver');
    }
  };

  const getTeamName = (teamId) => {
    return teams.find((t) => t.id === teamId)?.name || 'Unassigned';
  };

  return (
    <div className="p-8 bg-[#0a0a0f] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Drivers</h1>
            <p className="text-[#8a8a9a]">Add, edit, or remove drivers from the league</p>
          </div>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#e59b1a] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Driver
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
              {editingId ? 'Edit Driver' : 'Add New Driver'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Driver Name <span className="text-[#e63946]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Car Number
                </label>
                <input
                  type="number"
                  value={formData.carNumber}
                  onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
                  placeholder="42"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  iRacing Cust ID <span className="text-[#e63946]">*</span>
                </label>
                <input
                  type="number"
                  value={formData.custId}
                  onChange={(e) => setFormData({ ...formData, custId: e.target.value })}
                  placeholder="12345"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Team Assignment
                </label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                >
                  <option value="">Unassigned</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] transition-colors"
                >
                  {editingId ? 'Update Driver' : 'Add Driver'}
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

        {/* Drivers Table */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#f5a623] mx-auto mb-4" />
            <p className="text-[#8a8a9a]">Loading drivers...</p>
          </div>
        ) : (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
            {drivers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[#8a8a9a]">No drivers found. Add one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a2e] border-b border-[#2a2a3e]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Car #
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        iRacing ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Team
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
                    {drivers.map((driver) => (
                      <tr
                        key={driver.id}
                        className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">{driver.name}</td>
                        <td className="px-6 py-4 text-[#8a8a9a]">{driver.car_number || '-'}</td>
                        <td className="px-6 py-4 text-[#8a8a9a]">{driver.cust_id || '-'}</td>
                        <td className="px-6 py-4 text-[#8a8a9a]">
                          {getTeamName(driver.team_id)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(driver)}
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              driver.active
                                ? 'bg-[#2ec4b6] text-white'
                                : 'bg-[#8a8a9a] text-white'
                            }`}
                          >
                            {driver.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(driver)}
                            className="p-2 text-[#f5a623] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                            title="Edit driver"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(driver.id)}
                            className="p-2 text-[#e63946] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                            title="Delete driver"
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
