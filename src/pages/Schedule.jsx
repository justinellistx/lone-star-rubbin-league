import React from 'react';
import { Link } from 'react-router-dom';
import { Flag, CheckCircle, Clock, Youtube } from 'lucide-react';
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
      className={`bg-white border-2 rounded-lg p-6 hover:bg-[#f7f7f7] transition ${
        isNext ? 'border-[#003DA5]' : 'border-[#e0e0e0]'
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <TrackIcon track={race.track_name} size={56} showLabel />
        <div className="flex-1 min-w-0">
          <div className="text-[#6c6d6f] text-xs uppercase font-bold mb-1">Race #{race.race_number}</div>
          <h3 className="text-2xl font-bold text-[#1a1a2e] truncate">{race.track_name}</h3>
        </div>
        {race.status === 'completed' ? (
          <CheckCircle className="text-[#008564] flex-shrink-0" size={24} />
        ) : isNext ? (
          <Flag className="text-[#003DA5] flex-shrink-0" size={24} />
        ) : (
          <Clock className="text-[#6c6d6f] flex-shrink-0" size={24} />
        )}
      </div>

      <div className="mb-4 pb-4 border-b border-[#e0e0e0]">
        <div className="text-[#6c6d6f] text-sm mb-2">
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
          <div className="text-[#6c6d6f] text-xs uppercase font-bold mb-1">Series</div>
          <div className="text-[#1a1a2e] font-bold">{race.series}</div>
        </div>
        <div className="text-right">
          <div
            className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase ${
              race.status === 'completed'
                ? 'bg-[#008564] text-[#1a1a2e]'
                : isNext
                  ? 'bg-[#003DA5] text-[#1a1a2e]'
                  : 'bg-[#e0e0e0] text-[#6c6d6f]'
            }`}
          >
            {race.status === 'completed' ? 'Completed' : isNext ? 'Next' : 'Upcoming'}
          </div>
        </div>
      </div>

      {race.status === 'completed' && (
        <div className="mt-4 flex gap-2">
          <Link
            to="/results"
            className="flex-1 block text-center bg-[#ffffff] border border-[#e0e0e0] text-[#003DA5] px-4 py-2 rounded text-sm font-bold hover:border-[#003DA5] transition"
          >
            View Results
          </Link>
          {race.youtube_url && (
            <a
              href={race.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-[#ffffff] border border-[#e0e0e0] text-[#ff0000] px-4 py-2 rounded text-sm font-bold hover:border-[#ff0000] transition"
              title="Watch Highlights"
            >
              <Youtube size={14} /> Highlights
            </a>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#ffffff] min-h-screen py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003DA5] mb-4"></div>
          <p className="text-[#6c6d6f] text-lg">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ffffff] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-[#1a1a2e] mb-2">SCHEDULE</h1>
          <p className="text-[#6c6d6f] text-lg">
            {schedule?.length || 0} Races
            {schedule && schedule.length > 0 && ` - ${Math.max(...schedule.map(r => r.stage_number || 0))} Stages`}
          </p>
        </div>

        {/* Next Race Highlight */}
        {nextRace && (
          <div className="bg-gradient-to-r from-white to-[#ffffff] border-2 border-[#003DA5] rounded-lg p-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Flag className="text-[#003DA5]" size={32} />
              <h2 className="text-3xl font-bold text-[#003DA5]">NEXT RACE</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <TrackIcon track={nextRace.track_name} size={72} showLabel />
                <div>
                  <div className="text-[#6c6d6f] text-sm uppercase font-bold mb-2">Track</div>
                  <div className="text-3xl font-bold text-[#1a1a2e]">{nextRace.track_name}</div>
                </div>
              </div>
              <div>
                <div className="text-[#6c6d6f] text-sm uppercase font-bold mb-2">Date</div>
                <div className="text-3xl font-bold text-[#003DA5]">
                  {new Date(nextRace.race_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-[#6c6d6f] text-sm uppercase font-bold mb-2">Series</div>
                <div className="text-3xl font-bold text-[#008564]">{nextRace.series}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 1 */}
        {stage1.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-[#1a1a2e] mb-2">Stage 1</h2>
            <p className="text-[#6c6d6f] mb-8">{stage1.length} races</p>
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
            <h2 className="text-3xl font-bold text-[#1a1a2e] mb-2">Stage 2</h2>
            <p className="text-[#6c6d6f] mb-8">{stage2.length} races</p>
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
            <h2 className="text-3xl font-bold text-[#1a1a2e] mb-2">Stage 3</h2>
            <p className="text-[#6c6d6f] mb-8">{stage3.length} races</p>
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
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-8">
            <h3 className="text-2xl font-bold text-[#1a1a2e] mb-6">Season Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-[#6c6d6f] text-sm uppercase font-bold mb-2">Total Races</div>
                <div className="text-3xl font-bold text-[#1a1a2e]">{schedule.length}</div>
              </div>
              <div>
                <div className="text-[#6c6d6f] text-sm uppercase font-bold mb-2">Stages</div>
                <div className="text-3xl font-bold text-[#003DA5]">
                  {Math.max(...schedule.map(r => r.stage_number || 0))}
                </div>
              </div>
              <div>
                <div className="text-[#6c6d6f] text-sm uppercase font-bold mb-2">Unique Tracks</div>
                <div className="text-3xl font-bold text-[#008564]">
                  {new Set(schedule.map(r => r.track_name)).size}
                </div>
              </div>
              <div>
                <div className="text-[#6c6d6f] text-sm uppercase font-bold mb-2">
                  Completed
                </div>
                <div className="text-3xl font-bold text-[#c8102e]">
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
