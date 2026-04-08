import React from 'react';
import { Link } from 'react-router-dom';
import { Flag, CheckCircle, Clock } from 'lucide-react';
import { useSchedule } from '../hooks/useSupabase';

const DEMO_SCHEDULE = [
  // Stage 1: NASCAR Cup Series
  {
    id: 'race-1',
    raceNumber: 1,
    track: 'Daytona',
    date: '2026-02-15',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'completed',
  },
  {
    id: 'race-2',
    raceNumber: 2,
    track: 'Atlanta (Echopark)',
    date: '2026-02-22',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'completed',
  },
  {
    id: 'race-3',
    raceNumber: 3,
    track: 'COTA',
    date: '2026-03-01',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'completed',
  },
  {
    id: 'race-4',
    raceNumber: 4,
    track: 'Phoenix',
    date: '2026-03-08',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'completed',
  },
  {
    id: 'race-5',
    raceNumber: 5,
    track: 'Las Vegas',
    date: '2026-03-15',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'completed',
  },
  {
    id: 'race-6',
    raceNumber: 6,
    track: 'Darlington',
    date: '2026-03-22',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'completed',
  },
  {
    id: 'race-7',
    raceNumber: 7,
    track: 'Martinsville',
    date: '2026-03-29',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'completed',
  },
  {
    id: 'race-8',
    raceNumber: 8,
    track: 'Bristol',
    date: '2026-04-12',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'upcoming',
  },
  {
    id: 'race-9',
    raceNumber: 9,
    track: 'Kansas',
    date: '2026-04-19',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'upcoming',
  },
  {
    id: 'race-10',
    raceNumber: 10,
    track: 'Talladega',
    date: '2026-04-26',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'upcoming',
  },
  {
    id: 'race-11',
    raceNumber: 11,
    track: 'Texas',
    date: '2026-05-03',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'upcoming',
  },
  {
    id: 'race-12',
    raceNumber: 12,
    track: 'Watkins Glen',
    date: '2026-05-10',
    series: 'NASCAR Cup Series',
    stage: 1,
    status: 'upcoming',
  },
  // Stage 2: NASCAR Cup Series
  {
    id: 'race-13',
    raceNumber: 13,
    track: 'Charlotte',
    date: '2026-05-24',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-14',
    raceNumber: 14,
    track: 'Nashville',
    date: '2026-05-31',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-15',
    raceNumber: 15,
    track: 'Michigan',
    date: '2026-06-07',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-16',
    raceNumber: 16,
    track: 'Pocono',
    date: '2026-06-14',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-17',
    raceNumber: 17,
    track: 'San Diego',
    date: '2026-06-21',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-18',
    raceNumber: 18,
    track: 'Sonoma',
    date: '2026-06-28',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-19',
    raceNumber: 19,
    track: 'Chicagoland',
    date: '2026-07-05',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-20',
    raceNumber: 20,
    track: 'Atlanta (Echopark)',
    date: '2026-07-12',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-21',
    raceNumber: 21,
    track: 'North Wilkesboro',
    date: '2026-07-19',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-22',
    raceNumber: 22,
    track: 'Indianapolis',
    date: '2026-07-26',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-23',
    raceNumber: 23,
    track: 'Iowa',
    date: '2026-08-09',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  {
    id: 'race-24',
    raceNumber: 24,
    track: 'Richmond',
    date: '2026-08-15',
    series: 'NASCAR Cup Series',
    stage: 2,
    status: 'upcoming',
  },
  // Stage 3: NASCAR Cup Series
  {
    id: 'race-25',
    raceNumber: 25,
    track: 'New Hampshire',
    date: '2026-08-23',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-26',
    raceNumber: 26,
    track: 'Daytona',
    date: '2026-08-29',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-27',
    raceNumber: 27,
    track: 'Darlington',
    date: '2026-09-06',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-28',
    raceNumber: 28,
    track: 'WWT Raceway',
    date: '2026-09-13',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-29',
    raceNumber: 29,
    track: 'Bristol',
    date: '2026-09-19',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-30',
    raceNumber: 30,
    track: 'Kansas',
    date: '2026-09-27',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-31',
    raceNumber: 31,
    track: 'Las Vegas',
    date: '2026-10-04',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-32',
    raceNumber: 32,
    track: 'Charlotte',
    date: '2026-10-11',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-33',
    raceNumber: 33,
    track: 'Phoenix',
    date: '2026-10-18',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-34',
    raceNumber: 34,
    track: 'Talladega',
    date: '2026-10-25',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-35',
    raceNumber: 35,
    track: 'Martinsville',
    date: '2026-11-01',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
  {
    id: 'race-36',
    raceNumber: 36,
    track: 'Homestead-Miami',
    date: '2026-11-08',
    series: 'NASCAR Cup Series',
    stage: 3,
    status: 'upcoming',
  },
];

export default function Schedule() {
  const { data: schedule, loading } = useSchedule(null);

  const displaySchedule =
    schedule && schedule.length > 0 && schedule[0].stage !== undefined
      ? schedule
      : DEMO_SCHEDULE;

  // Group races by stage
  const stage1 = displaySchedule.filter((race) => race.stage === 1);
  const stage2 = displaySchedule.filter((race) => race.stage === 2);
  const stage3 = displaySchedule.filter((race) => race.stage === 3);

  // Find next upcoming race
  const nextRace = displaySchedule.find((race) => race.status === 'upcoming');

  const RaceCard = ({ race, isNext }) => (
    <div
      className={`bg-[#14141f] border-2 rounded-lg p-6 hover:bg-[#1a1a2e] transition ${
        isNext ? 'border-[#f5a623]' : 'border-[#2a2a3e]'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-1">Race #{race.raceNumber}</div>
          <h3 className="text-2xl font-bold text-white">{race.track}</h3>
        </div>
        {race.status === 'completed' ? (
          <CheckCircle className="text-[#2ec4b6]" size={24} />
        ) : isNext ? (
          <Flag className="text-[#f5a623]" size={24} />
        ) : (
          <Clock className="text-[#8a8a9a]" size={24} />
        )}
      </div>

      <div className="mb-4 pb-4 border-b border-[#2a2a3e]">
        <div className="text-[#8a8a9a] text-sm mb-2">
          {new Date(race.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-1">Series</div>
          <div className="text-white font-bold">{race.series}</div>
        </div>
        <div className="text-right">
          <div
            className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase ${
              race.status === 'completed'
                ? 'bg-[#2ec4b6] text-black'
                : isNext
                  ? 'bg-[#f5a623] text-black'
                  : 'bg-[#2a2a3e] text-[#8a8a9a]'
            }`}
          >
            {race.status === 'completed' ? 'Completed' : isNext ? 'Next' : 'Upcoming'}
          </div>
        </div>
      </div>

      {race.status === 'completed' && (
        <Link
          to="/results"
          className="mt-4 block text-center bg-[#0a0a0f] border border-[#2a2a3e] text-[#f5a623] px-4 py-2 rounded text-sm font-bold hover:border-[#f5a623] transition"
        >
          View Results
        </Link>
      )}
    </div>
  );

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">SCHEDULE</h1>
          <p className="text-[#8a8a9a] text-lg">2026 Season - 36 Races</p>
        </div>

        {/* Next Race Highlight */}
        {nextRace && (
          <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border-2 border-[#f5a623] rounded-lg p-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Flag className="text-[#f5a623]" size={32} />
              <h2 className="text-3xl font-bold text-[#f5a623]">NEXT RACE</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Track</div>
                <div className="text-3xl font-bold text-white">{nextRace.track}</div>
              </div>
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Date</div>
                <div className="text-3xl font-bold text-[#f5a623]">
                  {new Date(nextRace.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Series</div>
                <div className="text-3xl font-bold text-[#2ec4b6]">{nextRace.series}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 1: Truck Series */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-2">Stage 1: Truck Series</h2>
          <p className="text-[#8a8a9a] mb-8">6 races - 12 points per stage bonus</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stage1.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                isNext={nextRace?.id === race.id}
              />
            ))}
          </div>
        </section>

        {/* Stage 2: Xfinity Series */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-2">Stage 2: Xfinity Series</h2>
          <p className="text-[#8a8a9a] mb-8">6 races - 12 points per stage bonus</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stage2.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                isNext={nextRace?.id === race.id}
              />
            ))}
          </div>
        </section>

        {/* Stage 3: Cup Series */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-2">Stage 3: Cup Series</h2>
          <p className="text-[#8a8a9a] mb-8">6 races - Championship Round</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stage3.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                isNext={nextRace?.id === race.id}
              />
            ))}
          </div>
        </section>

        {/* Schedule Stats */}
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Season Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Total Races</div>
              <div className="text-3xl font-bold text-white">36</div>
            </div>
            <div>
              <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Stages</div>
              <div className="text-3xl font-bold text-[#f5a623]">3</div>
            </div>
            <div>
              <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Unique Tracks</div>
              <div className="text-3xl font-bold text-[#2ec4b6]">6</div>
            </div>
            <div>
              <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">
                Completed
              </div>
              <div className="text-3xl font-bold text-[#e63946]">
                {displaySchedule.filter((r) => r.status === 'completed').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
