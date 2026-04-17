import React from 'react';
import { Calendar, Award, Zap, TrendingUp } from 'lucide-react';
import { useRaceResultsByRace } from '../hooks/useSupabase';

export default function Timeline() {
  const { data: races, loading } = useRaceResultsByRace();

  const generateTimelineEntries = () => {
    if (!races || races.length === 0) return [];

    return races.map((race, idx) => {
      const results = race.results || [];
      const winner = results.length > 0 ? results[0] : null;

      let title = `${race.track || 'Race'} ${idx + 1}`;
      let description = '';
      let stat = '';
      let icon = 'award';
      let accentColor = '#d00000';

      if (winner) {
        title = `${winner.name} Wins at ${race.track || 'Race ' + (idx + 1)}`;

        // Generate notable stat
        const secondPlace = results.length > 1 ? results[1] : null;
        const thirdPlace = results.length > 2 ? results[2] : null;

        // Check for close finish
        if (secondPlace && secondPlace.position === 2) {
          const gap = Math.abs((winner.finish || 0) - (secondPlace.finish || 0));
          if (gap < 3) {
            description = `${winner.name} takes the checkered flag at ${race.track || 'the track'} in a nail-biting finish. A commanding drive secures the victory. ${secondPlace.name} finishes P2.`;
            stat = `${winner.name}: P1 | Close finish`;
            accentColor = '#cc0000';
          }
        }

        // Check for dominant win
        if (!description && results.length > 3) {
          const topFiveCount = results.filter((r, i) => i < 5).length;
          description = `${winner.name} takes a dominant victory at ${race.track || 'the track'}. A commanding performance puts them in the championship mix. The field is still competitive behind them.`;
          stat = `${winner.name}: P1 win | Dominant`;
          accentColor = '#008564';
          icon = 'zap';
        }

        if (!description) {
          description = `${winner.name} takes the checkered flag at ${race.track || 'the track'}. A strong drive secures the victory and valuable championship points. ${thirdPlace ? secondPlace.name + ' P2' : 'Solid podium finishes'} round out the top three.`;
          stat = `${winner.name}: Victory at ${race.track || 'the track'}`;
          icon = 'award';
        }
      } else {
        description = `Race at ${race.track || 'the track'} completed.`;
        stat = 'Race complete';
      }

      return {
        id: idx + 1,
        date: race.date ? new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Race ${idx + 1}`,
        title,
        description,
        stat,
        icon,
        accentColor,
      };
    });
  };

  const getIcon = (iconType) => {
    const iconProps = { size: 20 };
    switch (iconType) {
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'award':
        return <Award {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      case 'trending':
        return <TrendingUp {...iconProps} />;
      default:
        return <Calendar {...iconProps} />;
    }
  };

  const timelineEntries = generateTimelineEntries();

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <p style={{ color: '#6c6d6f' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 md:px-8" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#d00000' }}>
          Season Timeline
        </h1>
        <p className="text-lg" style={{ color: '#6c6d6f' }}>
          Key moments from the Lone Star Rubbin' League 2026 season
        </p>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        {/* Center Line - Hidden on Mobile */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-32 bottom-0 w-1 h-full" style={{ backgroundColor: '#e0e0e0' }} />

        {/* Timeline Items */}
        <div className="space-y-12 md:space-y-0">
          {timelineEntries.map((entry, index) => {
            const isEven = index % 2 === 0;
            const accentColor = entry.accentColor || '#d00000';

            return (
              <div key={entry.id} className="relative">
                {/* Timeline Dot */}
                <div
                  className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-6 w-6 h-6 rounded-full border-4 items-center justify-center z-10"
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderColor: accentColor,
                    top: '3rem',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>

                {/* Card */}
                <div className={`md:flex ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-stretch`}>
                  {/* Content Area */}
                  <div className="md:w-1/2 flex items-center">
                    <div
                      className="w-full p-6 rounded-lg"
                      style={{
                        backgroundColor: 'white',
                        borderColor: '#e0e0e0',
                        borderWidth: 1,
                      }}
                    >
                      {/* Date Badge */}
                      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(208, 0, 0, 0.1)' }}>
                        <Calendar size={14} style={{ color: '#d00000' }} />
                        <span className="text-sm font-semibold" style={{ color: '#d00000' }}>
                          {entry.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-3" style={{ color: accentColor }}>
                        {entry.title}
                      </h3>

                      {/* Description */}
                      <p className="mb-4" style={{ color: '#6c6d6f', lineHeight: '1.6' }}>
                        {entry.description}
                      </p>

                      {/* Stat Highlight */}
                      <div
                        className="p-3 rounded border-l-4"
                        style={{
                          backgroundColor: 'rgba(208, 0, 0, 0.05)',
                          borderLeftColor: accentColor,
                        }}
                      >
                        <p className="text-sm font-semibold" style={{ color: accentColor }}>
                          {entry.stat}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Icon Area - Mobile at top, desktop on side */}
                  <div className="md:w-1/2 flex items-center justify-center md:justify-start md:justify-end">
                    <div
                      className="p-4 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `rgba(${accentColor === '#d00000' ? '208, 0, 0' : accentColor === '#008564' ? '0, 133, 100' : '204, 0, 0'}, 0.1)`,
                        borderColor: accentColor,
                        borderWidth: 2,
                        width: 'fit-content',
                      }}
                    >
                      <div style={{ color: accentColor }}>
                        {getIcon(entry.icon)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Message */}
        <div className="mt-16 p-6 rounded-lg text-center" style={{ backgroundColor: 'white', borderColor: '#e0e0e0', borderWidth: 1 }}>
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#d00000' }}>
            Stage 1 Championship Coming Soon
          </h3>
          <p style={{ color: '#6c6d6f' }}>
            5 races remaining. Bristol, Martinsville (2), North Wilkesboro, and Las Vegas (2) set to close out the opening stage.
          </p>
        </div>
      </div>
    </div>
  );
}
