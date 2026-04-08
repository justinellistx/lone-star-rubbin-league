import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Flag, Users } from 'lucide-react';
import { useNews, useStandings, useSchedule } from '../hooks/useSupabase';

const DEMO_DRIVERS = [
  { id: 'nik', name: 'Nik Green2', number: 88, team: 'Nik+Jordan', points: 205 },
  { id: 'nate', name: 'Nathan Becker', number: 21, team: 'Justin+Nate', points: 203 },
  { id: 'justin', name: 'Justin Ellis4', number: 5, team: 'Justin+Nate', points: 193 },
  { id: 'blaine', name: 'Blaine Karnes', number: 25, team: 'Blaine+Terry', points: 187 },
  { id: 'jordan', name: 'Jordan Stancil', number: 15, team: 'Nik+Jordan', points: 142 },
];

const DEMO_RACES = [
  {
    id: 'race-7',
    track: 'Martinsville',
    date: '2026-04-03',
    winner: 'Nathan Becker',
    series: 'Hosted All Cars',
    totalLaps: 150,
    totalDrivers: 28,
  },
];

const DEMO_SCHEDULE = [
  { track: 'Bristol', date: '2026-04-09', series: 'Hosted All Cars', status: 'upcoming' },
  { track: 'Richmond', date: '2026-04-16', series: 'Hosted All Cars', status: 'upcoming' },
  { track: 'Talladega', date: '2026-04-23', series: 'Hosted All Cars', status: 'upcoming' },
];

export default function Home() {
  const { data: news, loading: newsLoading } = useNews(5);
  const { data: standings, loading: standingsLoading } = useStandings(null);
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);

  const displayNews = newsLoading ? [] : news || DEMO_NEWS();
  const displayStandings = standingsLoading ? DEMO_DRIVERS : standings || DEMO_DRIVERS;
  const displaySchedule = scheduleLoading ? DEMO_SCHEDULE : schedule || DEMO_SCHEDULE;

  const nextRace = displaySchedule.find((r) => r.status === 'upcoming');
  const topStandings = displayStandings.slice(0, 5);

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

          {DEMO_RACES.length > 0 && (
            <div className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase tracking-wide mb-2">
                    Track
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {DEMO_RACES[0].track}
                  </div>
                </div>
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase tracking-wide mb-2">
                    Winner
                  </div>
                  <div className="text-2xl font-bold text-[#f5a623]">
                    {DEMO_RACES[0].winner}
                  </div>
                </div>
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase tracking-wide mb-2">
                    Series
                  </div>
                  <div className="text-2xl font-bold text-[#2ec4b6]">
                    {DEMO_RACES[0].series}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="border-t border-[#2a2a3e] pt-4">
                  <div className="text-[#8a8a9a]">Total Laps</div>
                  <div className="text-white font-bold">{DEMO_RACES[0].totalLaps}</div>
                </div>
                <div className="border-t border-[#2a2a3e] pt-4">
                  <div className="text-[#8a8a9a]">Total Drivers</div>
                  <div className="text-white font-bold">{DEMO_RACES[0].totalDrivers}</div>
                </div>
                <div className="border-t border-[#2a2a3e] pt-4">
                  <div className="text-[#8a8a9a]">Race</div>
                  <div className="text-white font-bold">7 of 12</div>
                </div>
              </div>
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
          </div>
        </div>
      </section>

      {/* News & Highlights */}
      <section className="py-12 px-4 md:px-8 bg-[#14141f] border-y border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">News & Highlights</h2>

          {displayNews && displayNews.length > 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DEMO_NEWS().map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#f5a623] transition"
                >
                  <div className="text-sm text-[#f5a623] uppercase font-bold mb-2">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-[#8a8a9a] mb-4">{item.content}</p>
                  <div className="text-xs text-[#8a8a9a]">{item.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Race Callout */}
      {nextRace && (
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
                  <div className="text-3xl font-bold text-white">{nextRace.track}</div>
                </div>
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase mb-2">Date</div>
                  <div className="text-3xl font-bold text-[#2ec4b6]">
                    {new Date(nextRace.date).toLocaleDateString('en-US', {
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
      )}

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

function DEMO_NEWS() {
  return [
    {
      id: 'news-1',
      title: 'Becker Wrecker Takes Martinsville in Thriller',
      content:
        'Nathan Becker held off Ryan Ramsey and Nik Green2 in a wild short-track battle at Martinsville to claim his third win of Stage 1. Nik led 76 laps and set the fastest lap, but Becker\'s 63 laps out front sealed it. The win pulls Becker within 2 points of the overall lead.',
      category: 'Race Report',
      date: 'Apr 3, 2026',
    },
    {
      id: 'news-2',
      title: 'Adventure Man Surges to Points Lead',
      content:
        'After a rough start at Daytona (24th) and Atlanta (18th), Nik Green2 has been on an absolute tear — back-to-back wins at Las Vegas and Darlington, plus a podium at Martinsville. He now leads the standings by just 2 points over Nathan Becker with 5 races left in Stage 1.',
      category: 'Standings',
      date: 'Apr 3, 2026',
    },
    {
      id: 'news-3',
      title: 'J-Easy: The Best Driver Without a Win?',
      content:
        'Justin Ellis4 sits P3 in points with 193, four top-5 finishes, and 118 laps led — but zero wins through 7 races. He\'s led the most laps in three different races only to be passed late. At Las Vegas he led 63 laps but settled for 3rd. The monkey\'s gotta come off his back eventually.',
      category: 'Feature',
      date: 'Apr 1, 2026',
    },
    {
      id: 'news-4',
      title: 'Thunder Boy Breaks Through at Martinsville',
      content:
        'Ryan Ramsey scored his best finish of Stage 1 with a P2 at Martinsville, his first top-5 of the season. The result is a shot of confidence for the Ryan+Sam+Ronald squad after some tough early outings. Ramsey also holds the lowest total incidents in the league through 7 races.',
      category: 'Race Report',
      date: 'Apr 3, 2026',
    },
    {
      id: 'news-5',
      title: 'Stage 1 Title Race Heats Up — 5 Races to Go',
      content:
        'Just 18 points separate the top 4 drivers heading into the second half of Stage 1. Nik Green2 (205), Nathan Becker (203), Justin Ellis4 (193), and Blaine Karnes (187) are all in striking distance. Bristol is up next — expect some rubbin\'.',
      category: 'Preview',
      date: 'Apr 7, 2026',
    },
  ];
}
