import React from 'react';
import { Link } from 'react-router-dom';
import { Flag, CheckCircle, Clock } from 'lucide-react';
import { useSchedule } from '../hooks/useSupabase';
import TrackIcon from '../components/TrackIcon';

export default function Schedule() {
  const { data: schedule, loading } = useSchedule();

  // Group races by stage_number
  const stage1 = schedule?.filter((race) => race.stage_number === 1) || [];
  const stage2 = schedule?.filter((race) => race.stage_number === 2) || [];
  const stage3 = schedule?.filter((race) => race.stage_number === 3) || [];

  // Find next upcoming race (first upcoming race in chronological order)
  const nextRace = schedule
    ?.filter((race) => race.status === 'upcoming')
    .sort((a, b) => new Date(a.race_date) - new Date(b.race_date))[0];

  const RaceCard = ({ race, isNext }) => (
    <div
      className={`bg-[#14141f] border-2 rounded-lg p-6 hover:bg-[#1a1a2e] transition ${
        isNext ? 'border-[#f5a623]' : 'border-[#2a2a3e]'
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <TrackIcon track={race.track_name} size={56} showLabel />
        <div className="flex-1 min-w-0">
          <div className="text-[#8a8a9a] text-xs uppercase font-bold mb-1">Race #{race.race_number}</div>
          <h3 className="text-2xl font-bold text-white truncate">{race.track_name}</h3>
        </div>
        {race.status === 'completed' ? (
          <CheckCircle className="text-[#2ec4b6] flex-shrink-0" size={24} />
        ) : isNext ? (
          <Flag className="text-[#f5a623] flex-shrink-0" size={24} />
        ) : (
          <Clock className="text-[#8a8a9a] flex-shrink-0" size={24} />
        )}
      </div>

      <div className="mb-4 pb-4 border-b border-[#2a2a3e]">
        <div className="text-[#8a8a9a] text-sm mb-2">
          {new Date(race.race_date).toLocaleDateString('en-US', {
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

  if (loading) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f5a623] mb-4"></div>
          <p className="text-[#8a8a9a] text-lg">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">SCHEDULE</h1>
          <p className="text-[#8a8a9a] text-lg">
            {schedule?.length || 0} Races
            {schedule && schedule.length > 0 && ` - ${Math.max(...schedule.map(r => r.stage_number || 0))} Stages`}
          </p>
        </div>

        {/* Next Race Highlight */}
        {nextRace && (
          <div className="bg-gradient-to-r from-[#14141f] to-[#1a1a2e] border-2 border-[#f5a623] rounded-lg p-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Flag className="text-[#f5a623]" size={32} />
              <h2 className="text-3xl font-bold text-[#f5a623]">NEXT RACE</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <TrackIcon track={nextRace.track_name} size={72} showLabel />
                <div>
                  <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Track</div>
                  <div className="text-3xl font-bold text-white">{nextRace.track_name}</div>
                </div>
              </div>
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Date</div>
                <div className="text-3xl font-bold text-[#f5a623]">
                  {new Date(nextRace.race_date).toLocaleDateString('en-US', {
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

        {/* Stage 1 */}
        {stage1.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Stage 1</h2>
            <p className="text-[#8a8a9a] mb-8">{stage1.length} races</p>
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
        )}

        {/* Stage 2 */}
        {stage2.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Stage 2</h2>
            <p className="text-[#8a8a9a] mb-8">{stage2.length} races</p>
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
        )}

        {/* Stage 3 */}
        {stage3.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">Stage 3</h2>
            <p className="text-[#8a8a9a] mb-8">{stage3.length} races</p>
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
        )}

        {/* Schedule Stats */}
        {schedule && schedule.length > 0 && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Season Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Total Races</div>
                <div className="text-3xl font-bold text-white">{schedule.length}</div>
              </div>
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Stages</div>
                <div className="text-3xl font-bold text-[#f5a623]">
                  {Math.max(...schedule.map(r => r.stage_number || 0))}
                </div>
              </div>
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">Unique Tracks</div>
                <div className="text-3xl font-bold text-[#2ec4b6]">
                  {new Set(schedule.map(r => r.track_name)).size}
                </div>
              </div>
              <div>
                <div className="text-[#8a8a9a] text-sm uppercase font-bold mb-2">
                  Completed
                </div>
                <div className="text-3xl font-bold text-[#e63946]">
                  {schedule.filter((r) => r.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
