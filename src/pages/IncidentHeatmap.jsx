import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useAllRaceResults, useDrivers } from '../hooks/useSupabase';

export default function IncidentHeatmap() {
  const [view, setView] = useState('track'); // 'track' or 'driver'

  // Fetch data from Supabase
  const { data: raceResults, loading: resultsLoading } = useAllRaceResults();
  const { data: driversData, loading: driversLoading } = useDrivers();

  // Build trackIncidents dynamically from race results
  const trackIncidents = useMemo(() => {
    if (!raceResults || raceResults.length === 0) return {};

    const incidentsByTrack = {};

    raceResults.forEach(result => {
      const track = result.races?.track_name || 'Unknown';
      const driverName = result.drivers?.name || 'Unknown';
      const incidents = result.incidents || 0;

      if (!incidentsByTrack[track]) {
        incidentsByTrack[track] = {};
      }
      incidentsByTrack[track][driverName.toLowerCase()] = incidents;
    });

    return incidentsByTrack;
  }, [raceResults]);

  // Build allDrivers list from drivers data
  const allDrivers = useMemo(() => {
    if (!driversData || driversData.length === 0) return [];
    return driversData.map(driver => driver.name).sort();
  }, [driversData]);

  // Prepare track view data
  const trackViewData = useMemo(() => {
    return Object.entries(trackIncidents).map(([track, drivers]) => {
      const incidentArray = Object.values(drivers);
      const totalIncidents = incidentArray.reduce((sum, val) => sum + val, 0);
      const avgIncidents = (totalIncidents / incidentArray.length).toFixed(1);

      // Find cleanest (lowest incidents) and dirtiest (highest incidents)
      const driverEntries = Object.entries(drivers);
      const cleanest = driverEntries.reduce(
        (min, [driver, count]) => {
          const displayName = driver.charAt(0).toUpperCase() + driver.slice(1);
          return count < min.count ? { driver: displayName, count } : min;
        },
        { driver: '', count: Infinity }
      );
      const dirtiest = driverEntries.reduce(
        (max, [driver, count]) => {
          const displayName = driver.charAt(0).toUpperCase() + driver.slice(1);
          return count > max.count ? { driver: displayName, count } : max;
        },
        { driver: '', count: -1 }
      );

      return {
        track,
        total: totalIncidents,
        average: parseFloat(avgIncidents),
        drivers,
        cleanest,
        dirtiest,
      };
    });
  }, [trackIncidents]);

  // Prepare driver view data (heatmap matrix)
  const driverViewData = useMemo(() => {
    return allDrivers.map(driver => {
      const row = {
        driver,
      };
      Object.keys(trackIncidents).forEach(track => {
        row[track] = trackIncidents[track][driver.toLowerCase()] || 0;
      });
      return row;
    });
  }, [allDrivers, trackIncidents]);

  // Get color based on incident count
  const getIncidentColor = (count, max) => {
    const ratio = count / max;
    if (ratio === 0) return 'bg-green-900 text-green-100 border-green-700';
    if (ratio < 0.33) return 'bg-teal-800 text-teal-100 border-teal-600';
    if (ratio < 0.66) return 'bg-yellow-700 text-yellow-100 border-yellow-600';
    return 'bg-red-800 text-red-100 border-red-600';
  };

  const getTrackBarColor = (average, allAverages) => {
    const max = Math.max(...allAverages);
    const ratio = average / max;
    if (ratio < 0.33) return '#2ec4b6'; // teal
    if (ratio < 0.66) return '#f5a623'; // gold
    return '#e63946'; // red
  };

  const allAverages = trackViewData.map(t => t.average);
  const maxIncidents = useMemo(() => {
    const allIncidents = Object.values(trackIncidents).flatMap(t => Object.values(t));
    return allIncidents.length > 0 ? Math.max(...allIncidents) : 0;
  }, [trackIncidents]);

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0a0a0f] border border-[#2a2a3e] rounded p-3">
          <p className="text-white font-bold mb-2">{data.track}</p>
          <p className="text-[#2ec4b6] text-sm">Total: {data.total}</p>
          <p className="text-[#f5a623] text-sm">Avg: {data.average}</p>
          <p className="text-green-400 text-xs mt-2">Cleanest: {data.cleanest.driver} ({data.cleanest.count})</p>
          <p className="text-red-400 text-xs">Dirtiest: {data.dirtiest.driver} ({data.dirtiest.count})</p>
        </div>
      );
    }
    return null;
  };

  // Show loading state
  if (resultsLoading || driversLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#14141f] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#2a2a3e] border-t-[#f5a623] rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-[#8a8a9a] text-lg">Loading incident data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!raceResults || raceResults.length === 0 || allDrivers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#14141f] p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-2 text-white">INCIDENT HEATMAP</h1>
          <p className="text-[#8a8a9a] text-lg">Track incidents by location and driver</p>
        </div>
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8 text-center">
          <p className="text-[#8a8a9a]">No incident data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#14141f] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-black mb-2 text-white">INCIDENT HEATMAP</h1>
        <p className="text-[#8a8a9a] text-lg">Track incidents by location and driver</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setView('track')}
          className={`px-6 py-3 font-bold uppercase tracking-widest rounded transition-all duration-300 ${
            view === 'track'
              ? 'bg-[#f5a623] text-black shadow-lg shadow-[#f5a623]/50'
              : 'bg-[#14141f] text-[#8a8a9a] border border-[#2a2a3e] hover:border-[#f5a623] hover:text-white'
          }`}
        >
          By Track
        </button>
        <button
          onClick={() => setView('driver')}
          className={`px-6 py-3 font-bold uppercase tracking-widest rounded transition-all duration-300 ${
            view === 'driver'
              ? 'bg-[#2ec4b6] text-black shadow-lg shadow-[#2ec4b6]/50'
              : 'bg-[#14141f] text-[#8a8a9a] border border-[#2a2a3e] hover:border-[#2ec4b6] hover:text-white'
          }`}
        >
          By Driver
        </button>
      </div>

      {/* TRACK VIEW */}
      {view === 'track' && (
        <div className="space-y-8">
          {/* Bar Chart */}
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8">
            <h2 className="text-2xl font-black text-white mb-6">League Incidents by Track</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={trackViewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="track" stroke="#8a8a9a" />
                <YAxis stroke="#8a8a9a" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#f5a623" radius={[8, 8, 0, 0]}>
                  {trackViewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTrackBarColor(entry.average, allAverages)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Track Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trackViewData.map((trackData, idx) => {
              const ratio = trackData.average / Math.max(...allAverages);
              let colorClass = 'from-green-900 to-green-700 border-green-600';
              if (ratio > 0.66) colorClass = 'from-red-900 to-red-700 border-red-600';
              else if (ratio > 0.33) colorClass = 'from-yellow-900 to-yellow-700 border-yellow-600';
              else if (ratio > 0) colorClass = 'from-teal-900 to-teal-700 border-teal-600';

              return (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${colorClass} border rounded-lg p-6 shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black text-white">{trackData.track}</h3>
                    <span className="text-4xl font-black text-yellow-300">{trackData.total}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/20">
                    <div>
                      <p className="text-xs uppercase font-bold text-white/70 tracking-widest mb-1">
                        Avg per Driver
                      </p>
                      <p className="text-2xl font-black text-white">{trackData.average}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold text-white/70 tracking-widest mb-1">
                        Total Drivers
                      </p>
                      <p className="text-2xl font-black text-white">{Object.keys(trackData.drivers).length}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-green-200">Cleanest:</span>
                      <span className="text-sm font-black text-white">
                        {trackData.cleanest.driver} ({trackData.cleanest.count})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-red-200">Dirtiest:</span>
                      <span className="text-sm font-black text-white">
                        {trackData.dirtiest.driver} ({trackData.dirtiest.count})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRIVER VIEW - HEATMAP MATRIX */}
      {view === 'driver' && (
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8 overflow-x-auto">
          <h2 className="text-2xl font-black text-white mb-6">Driver Incidents by Track</h2>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[#0a0a0f] border border-[#2a2a3e] px-4 py-3 text-left text-xs uppercase font-black text-[#8a8a9a] tracking-widest">
                  Driver
                </th>
                {Object.keys(trackIncidents).map(track => (
                  <th
                    key={track}
                    className="bg-[#0a0a0f] border border-[#2a2a3e] px-3 py-3 text-center text-xs uppercase font-black text-[#8a8a9a] tracking-widest"
                  >
                    {track}
                  </th>
                ))}
                <th className="bg-[#0a0a0f] border border-[#2a2a3e] px-4 py-3 text-center text-xs uppercase font-black text-[#f5a623] tracking-widest">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {driverViewData.map((driverRow, dIdx) => {
                const totalIncidents = Object.keys(trackIncidents).reduce(
                  (sum, track) => sum + (driverRow[track] || 0),
                  0
                );

                return (
                  <tr key={dIdx} className="hover:bg-[#1a1a25] transition-colors">
                    <td className="border border-[#2a2a3e] px-4 py-3 font-bold text-white whitespace-nowrap sticky left-0 bg-[#14141f]">
                      {driverRow.driver}
                    </td>
                    {Object.keys(trackIncidents).map(track => {
                      const incidents = driverRow[track] || 0;
                      const colorClass = getIncidentColor(incidents, maxIncidents);

                      return (
                        <td
                          key={`${dIdx}-${track}`}
                          className={`border border-[#2a2a3e] px-3 py-3 text-center font-black rounded transition-all duration-200 hover:scale-105 ${colorClass}`}
                        >
                          {incidents}
                        </td>
                      );
                    })}
                    <td className="border border-[#2a2a3e] px-4 py-3 text-center font-black text-[#f5a623] bg-[#0a0a0f]">
                      {totalIncidents}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-[#2a2a3e]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-900 border border-green-700 rounded"></div>
              <span className="text-sm text-[#8a8a9a]">Clean (0-33%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-800 border border-teal-600 rounded"></div>
              <span className="text-sm text-[#8a8a9a]">Low (33-66%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-700 border border-yellow-600 rounded"></div>
              <span className="text-sm text-[#8a8a9a]">Medium (66-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-800 border border-red-600 rounded"></div>
              <span className="text-sm text-[#8a8a9a]">Dirty (Peak incidents)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
