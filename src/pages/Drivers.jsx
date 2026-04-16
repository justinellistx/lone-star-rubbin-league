import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpDown } from 'lucide-react';
import { useComputedStandings } from '../hooks/useSupabase';

export default function Drivers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const { standings, loading } = useComputedStandings();

  const displayDrivers = standings || [];

  const filteredDrivers = useMemo(() => {
    let result = displayDrivers.filter(
      (driver) =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.number.toString().includes(searchQuery)
    );

    if (sortBy === 'points') {
      result.sort((a, b) => b.points - a.points);
    } else if (sortBy === 'wins') {
      result.sort((a, b) => b.wins - a.wins);
    } else if (sortBy === 'avgFinish') {
      result.sort((a, b) => a.avgFinish - b.avgFinish);
    }

    return result;
  }, [displayDrivers, searchQuery, sortBy]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">DRIVERS</h1>
          <p className="text-[#8a8a9a] text-lg">2026 Season Roster</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a]">Loading drivers...</p>
          </div>
        ) : (
          <>
            {/* Search & Sort Controls */}
            <div className="mb-12 flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8a8a9a]"
            />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14141f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[#f5a623] transition"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#14141f] border border-[#2a2a3e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#f5a623] transition appearance-none cursor-pointer pr-10"
            >
              <option value="points">Sort by Points</option>
              <option value="wins">Sort by Wins</option>
              <option value="avgFinish">Sort by Avg Finish</option>
            </select>
            <ArrowUpDown
              size={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8a8a9a] pointer-events-none"
            />
          </div>
        </div>

        {/* Driver Grid */}
        {filteredDrivers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDrivers.map((driver) => (
              <Link
                key={driver.id}
                to={`/drivers/${driver.id}`}
                className="group bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden hover:border-[#f5a623] hover:bg-[#1a1a2e] transition"
              >
                {/* Card Header with Number */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#14141f] px-6 py-8 text-center border-b border-[#2a2a3e]">
                  <div className="text-[#f5a623] text-sm font-bold uppercase mb-2">
                    #{driver.number}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#f5a623] transition">
                    {driver.name}
                  </h3>
                  <p className="text-[#8a8a9a] text-sm mt-2">{driver.team}</p>
                </div>

                {/* Card Stats */}
                <div className="px-6 py-6">
                  {/* Points */}
                  <div className="mb-4 pb-4 border-b border-[#2a2a3e]">
                    <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-2">Points</div>
                    <div className="text-[#f5a623] font-bold text-2xl">{driver.points}</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-1">Wins</div>
                      <div className="text-white font-bold text-lg">{driver.wins}</div>
                    </div>
                    <div>
                      <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-1">
                        Avg Finish
                      </div>
                      <div className="text-[#2ec4b6] font-bold text-lg">
                        {(driver.avgFinish || 0).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Profile Link */}
                <div className="px-6 py-4 bg-[#0a0a0f] border-t border-[#2a2a3e]">
                  <div className="text-center text-[#f5a623] font-bold text-sm group-hover:text-white transition">
                    View Profile →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a]">No drivers found matching your search.</p>
          </div>
        )}

            {/* Summary Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Total Drivers</div>
                <div className="text-3xl font-bold text-white">{filteredDrivers.length}</div>
              </div>

              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Total Wins</div>
                <div className="text-3xl font-bold text-[#f5a623]">
                  {filteredDrivers.reduce((sum, d) => sum + d.wins, 0)}
                </div>
              </div>

              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Combined Points</div>
                <div className="text-3xl font-bold text-[#2ec4b6]">
                  {filteredDrivers.reduce((sum, d) => sum + d.points, 0)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
