import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Upload,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRaces: 0,
    totalDrivers: 0,
    currentStage: 'Loading...',
  });
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch total races
        const { count: raceCount } = await supabase
          .from('races')
          .select('*', { count: 'exact', head: true });

        // Fetch total drivers
        const { count: driverCount } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);

        // Fetch current active stage
        const { data: stages } = await supabase
          .from('stages')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        // Fetch recent race uploads
        const { data: races } = await supabase
          .from('races')
          .select('id, race_number, track_name, race_date, status')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalRaces: raceCount || 0,
          totalDrivers: driverCount || 0,
          currentStage: stages?.name || 'No active stage',
        });

        setRecentUploads(races || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      icon: Upload,
      label: 'Upload Race',
      description: 'Upload iRacing CSV results',
      path: '/admin/upload-race',
      color: 'bg-[#2ec4b6]',
    },
    {
      icon: Users,
      label: 'Manage Drivers',
      description: 'Add, edit, or remove drivers',
      path: '/admin/drivers',
      color: 'bg-[#f5a623]',
    },
    {
      icon: Calendar,
      label: 'Edit Schedule',
      description: 'Manage race dates and tracks',
      path: '/admin/schedule',
      color: 'bg-[#e63946]',
    },
    {
      icon: FileText,
      label: 'Write News',
      description: 'Publish league news & highlights',
      path: '/admin/news',
      color: 'bg-[#a8dadc]',
    },
  ];

  return (
    <div className="p-8 bg-[#0a0a0f] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-[#8a8a9a]">
            Welcome back! Here's what's happening with your league.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#e63946] rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#e63946] flex-shrink-0 mt-0.5" />
            <p className="text-[#e63946]">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8a8a9a] text-sm font-medium">Total Races</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalRaces}</p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg">
                <Activity className="w-8 h-8 text-[#f5a623]" />
              </div>
            </div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8a8a9a] text-sm font-medium">Active Drivers</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalDrivers}</p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg">
                <Users className="w-8 h-8 text-[#2ec4b6]" />
              </div>
            </div>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8a8a9a] text-sm font-medium">Current Stage</p>
                <p className="text-2xl font-bold text-white mt-2 truncate">
                  {stats.currentStage}
                </p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg">
                <TrendingUp className="w-8 h-8 text-[#e63946]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#f5a623] hover:bg-[#1a1a2e] transition-all group"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-left">{action.label}</h3>
                  <p className="text-[#8a8a9a] text-sm mt-1 text-left">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Uploads */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Uploads</h2>
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#8a8a9a]">Loading...</div>
            ) : recentUploads.length === 0 ? (
              <div className="p-8 text-center text-[#8a8a9a]">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No races uploaded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#2a2a3e] bg-[#1a1a2e]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Race
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Track
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUploads.map((race) => (
                      <tr
                        key={race.id}
                        className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">
                          Race {race.race_number}
                        </td>
                        <td className="px-6 py-4 text-[#8a8a9a]">{race.track_name}</td>
                        <td className="px-6 py-4 text-[#8a8a9a]">
                          {new Date(race.race_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              race.status === 'completed'
                                ? 'bg-[#2ec4b6] text-white'
                                : race.status === 'scheduled'
                                  ? 'bg-[#f5a623] text-[#0a0a0f]'
                                  : 'bg-[#8a8a9a] text-white'
                            }`}
                          >
                            {race.status.charAt(0).toUpperCase() + race.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
