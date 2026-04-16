import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flag } from 'lucide-react';
import {
  useComputedStandings,
  useRaceResultsByRace,
  useSchedule,
  useNews,
} from '../hooks/useSupabase';

export default function Home() {
  const { standings, loading: standingsLoading } = useComputedStandings();
  const { data: raceResults, loading: raceLoading } = useRaceResultsByRace();
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);
  const { data: news, loading: newsLoading } = useNews(5);

  // Get the latest completed race
  const latestRace = useMemo(() => {
    if (!raceResults || raceResults.length === 0) return null;
    return raceResults[raceResults.length - 1];
  }, [raceResults]);

  // Get the next 3 upcoming races from schedule
  const upcomingRaces = useMemo(() => {
    if (!schedule) return [];
    return schedule
      .filter((r) => r.status === 'upcoming')
      .slice(0, 3);
  }, [schedule]);

  const nextRace = upcomingRaces[0] || null;
  const topStandings = useMemo(() => {
    return standings ? standings.slice(0, 5) : [];
  }, [standings]);

  // Fallback news if none from DB
  const displayNews = useMemo(() => {
    if (news && news.length > 0) return news;
    if (!latestRace) return [];
    // Generate fallback news from latest race
    const winner = latestRace.results?.[0];
    return [
      {
        id: `generated-${latestRace.id}`,
        title: winner
          ? `${winner.name} Takes Victory at ${latestRace.track}`
          : `Race Completed at ${latestRace.track}`,
        content: `Latest race results from ${latestRace.track} on ${new Date(
          latestRace.date
        ).toLocaleDateString()}. ${latestRace.series} competition.`,
        category: 'Race Report',
        created_at: latestRace.date,
      },
    ];
  }, [news, latestRace]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
              <span className="text-[#f5a623]">LONE STAR</span>
              <br />
              <span className="text-white">RUBBIN' LEAGUE</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#8a8a9a] mb-8">
              2026 Season - Stage 1: NASCAR Cup Series
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded px-6 py-3">
                <div className="text-[#f5a623] font-bold text-lg">36 Races</div>
                <div className="text-[#8a8a9a] text-sm">Full Season</div>
              </div>
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded px-6 py-3">
                <div className="text-[#f5a623] font-bold text-lg">9 Drivers</div>
                <div className="text-[#8a8a9a] text-sm">Competing</div>
              </div>
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded px-6 py-3">
                <div className="text-[#f5a623] font-bold text-lg">4 Teams</div>
                <div className="text-[#8a8a9a] text-sm">In Action</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Results */}
      <section className="py-12 px-4 md:px-8 bg-[#14141f] border-y border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Latest Results</h2>
            <Link
              to="/results"
              className="flex items-center gap-2 text-[#f5a623] hover:text-white transition"
            >
              View All
              <ChevronRight size={20} />
            </Link>
          </div>

          {raceLoading ? (
            <div className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-6">
              <div className="text-[#8a8a9a]">Loading latest race...</div>
            </div>
          ) : latestRace ? (
            <div className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase tracking-wide mb-2">
                    Track
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {latestRace.track}
                  </div>
                </div>
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase tracking-wide mb-2">
                    Winner
                  </div>
                  <div className="text-2xl font-bold text-[#f5a623]">
                    {latestRace.results?.[0]?.name || 'TBD'}
                  </div>
                </div>
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase tracking-wide mb-2">
                    Series
                  </div>
                  <div className="text-2xl font-bold text-[#2ec4b6]">
                    {latestRace.series}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="border-t border-[#2a2a3e] pt-4">
                  <div className="text-[#8a8a9a]">Total Laps</div>
                  <div className="text-white font-bold">{latestRace.totalLaps}</div>
                </div>
                <div className="border-t border-[#2a2a3e] pt-4">
                  <div className="text-[#8a8a9a]">Finishers</div>
                  <div className="text-white font-bold">{latestRace.results?.length || 0}</div>
                </div>
                <div className="border-t border-[#2a2a3e] pt-4">
                  <div className="text-[#8a8a9a]">Race #</div>
                  <div className="text-white font-bold">{latestRace.raceNumber}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-6">
              <div className="text-[#8a8a9a]">No completed races yet</div>
            </div>
          )}
        </div>
      </section>

      {/* Top 5 Standings Mini Table */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Current Standings</h2>
            <Link
              to="/standings"
              className="flex items-center gap-2 text-[#f5a623] hover:text-white transition"
            >
              Full Standings
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden">
            {standingsLoading ? (
              <div className="px-6 py-8 text-[#8a8a9a]">Loading standings...</div>
            ) : topStandings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3e] bg-[#0a0a0f]">
                      <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                        Pos
                      </th>
                      <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                        Driver
                      </th>
                      <th className="px-6 py-4 text-left text-[#8a8a9a] text-xs font-bold uppercase">
                        Team
                      </th>
                      <th className="px-6 py-4 text-right text-[#8a8a9a] text-xs font-bold uppercase">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStandings.map((driver, idx) => (
                      <tr
                        key={driver.id}
                        className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-[#f5a623] text-black rounded font-bold">
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{driver.name}</div>
                          <div className="text-sm text-[#8a8a9a]">#{driver.number}</div>
                        </td>
                        <td className="px-6 py-4 text-[#8a8a9a]">{driver.team}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-[#2ec4b6]">{driver.points}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-[#8a8a9a]">No standings data available</div>
            )}
          </div>
        </div>
      </section>

      {/* News & Highlights */}
      <section className="py-12 px-4 md:px-8 bg-[#14141f] border-y border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">News & Highlights</h2>

          {newsLoading ? (
            <div className="text-[#8a8a9a]">Loading news...</div>
          ) : displayNews && displayNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#f5a623] transition"
                >
                  <div className="text-sm text-[#f5a623] uppercase font-bold mb-2">
                    {item.category || 'News'}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-[#8a8a9a] mb-4">{item.content}</p>
                  <div className="text-xs text-[#8a8a9a]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[#8a8a9a]">No news available</div>
          )}
        </div>
      </section>

      {/* Upcoming Race Callout */}
      {scheduleLoading ? (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border-2 border-[#f5a623] rounded-lg p-8">
              <div className="text-[#8a8a9a]">Loading schedule...</div>
            </div>
          </div>
        </section>
      ) : nextRace ? (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border-2 border-[#f5a623] rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <Flag className="text-[#f5a623]" size={28} />
                <h2 className="text-2xl font-bold text-[#f5a623]">NEXT RACE</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase mb-2">Track</div>
                  <div className="text-3xl font-bold text-white">{nextRace.track_name}</div>
                </div>
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase mb-2">Date</div>
                  <div className="text-3xl font-bold text-[#2ec4b6]">
                    {new Date(nextRace.race_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase mb-2">Series</div>
                  <div className="text-3xl font-bold text-[#e63946]">{nextRace.series}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Stats Ticker */}
      <section className="py-8 px-4 md:px-8 bg-[#0a0a0f] border-y border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-[#f5a623] text-3xl font-bold">36</div>
              <div className="text-[#8a8a9a] text-sm mt-2">Total Races</div>
            </div>
            <div className="text-center">
              <div className="text-[#2ec4b6] text-3xl font-bold">3</div>
              <div className="text-[#8a8a9a] text-sm mt-2">Stages</div>
            </div>
            <div className="text-center">
              <div className="text-[#e63946] text-3xl font-bold">9</div>
              <div className="text-[#8a8a9a] text-sm mt-2">Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-white text-3xl font-bold">4</div>
              <div className="text-[#8a8a9a] text-sm mt-2">Teams</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
