import React from 'react';
import { Calendar, Award, Zap, TrendingUp } from 'lucide-react';

const TIMELINE_ENTRIES = [
  {
    id: 1,
    date: 'Feb 12',
    title: 'Season Opener at Daytona',
    description: 'The Lone Star Rubbin\' League kicks off Stage 1 with NASCAR Trucks at Daytona. Blaine Karnes takes the best league finish at P15, gaining 9 spots from his P24 start.',
    stat: 'Blaine: P15 (+9 positions)',
    icon: 'calendar',
  },
  {
    id: 2,
    date: 'Feb 26',
    title: 'J-Dawg\'s Upset Victory',
    description: 'Jordan Stancil storms from P20 to take the checkered flag at Atlanta — the first win of the 2026 season. A wild race sees 42 incidents for the winner alone.',
    stat: 'Jordan: P20 → 1st Place',
    icon: 'award',
    accentColor: '#e63946',
  },
  {
    id: 3,
    date: 'Mar 5',
    title: 'Becker Wrecker Dominates COTA',
    description: 'Nathan Becker leads 34 of 35 laps from pole to flag at COTA. A dominant road course performance earns him the Fastest Lap, Most Laps Led, and Pole bonuses.',
    stat: 'Nathan: 34/35 laps led',
    icon: 'zap',
    accentColor: '#2ec4b6',
  },
  {
    id: 4,
    date: 'Mar 12',
    title: 'Becker Goes Back-to-Back',
    description: 'Nathan Becker wins again at Phoenix from pole, but Nik Green2 steals the show by leading 144 of 150 laps and settling for P2. Justin Ellis4 records a perfect 0-incident race.',
    stat: 'Nik: 144/150 laps | Justin: 0 incidents',
    icon: 'trending',
    accentColor: '#f5a623',
  },
  {
    id: 5,
    date: 'Mar 19',
    title: 'Adventure Man Arrives',
    description: 'Nik Green2 takes his first career win at Las Vegas from pole. Justin Ellis4 leads 63 laps but finishes P3. Four drivers record 0 incidents — a season best for clean racing.',
    stat: 'Nik\'s first W | 4 drivers: 0 incidents',
    icon: 'award',
    accentColor: '#2ec4b6',
  },
  {
    id: 6,
    date: 'Mar 26',
    title: 'Nik Goes Back-to-Back at Darlington',
    description: 'Nik Green2 wins again at the Lady in Black, setting the fastest lap. Nathan Becker leads 47 laps from pole but fades to P13 with 40 incidents. Terry Domino misses his first race (DNR).',
    stat: 'Nik: 2 wins | Nathan: 47 laps led',
    icon: 'zap',
    accentColor: '#f5a623',
  },
  {
    id: 7,
    date: 'Apr 3',
    title: 'Becker\'s Martinsville Masterclass',
    description: 'Nathan Becker claims his third win at Martinsville. Ryan Ramsey scores his best finish (P2). Ronald Ramsey makes his league debut, starting from pole. The top 3 in points are separated by just 12 points.',
    stat: 'Nathan: 3 wins | Ryan: Best finish P2',
    icon: 'award',
    accentColor: '#e63946',
  },
  {
    id: 8,
    date: 'Apr 7',
    title: 'Stage 1 Midpoint — 5 to Go',
    description: 'With 7 of 12 races complete, Nik Green2 leads by just 2 points over Nathan Becker. Four drivers are within 18 points. Bristol is next. Who will be Stage 1 Champion?',
    stat: 'Nik leads by 2 pts | 4 drivers within 18 pts',
    icon: 'trending',
    accentColor: '#2ec4b6',
  },
];

export default function Timeline() {
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

  return (
    <div className="min-h-screen py-16 px-4 md:px-8" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#f5a623' }}>
          Season Timeline
        </h1>
        <p className="text-lg" style={{ color: '#8a8a9a' }}>
          Key moments from the Lone Star Rubbin' League 2026 season
        </p>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        {/* Center Line - Hidden on Mobile */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-32 bottom-0 w-1 h-full" style={{ backgroundColor: '#2a2a3e' }} />

        {/* Timeline Items */}
        <div className="space-y-12 md:space-y-0">
          {TIMELINE_ENTRIES.map((entry, index) => {
            const isEven = index % 2 === 0;
            const accentColor = entry.accentColor || '#f5a623';

            return (
              <div key={entry.id} className="relative">
                {/* Timeline Dot */}
                <div
                  className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-6 w-6 h-6 rounded-full border-4 items-center justify-center z-10"
                  style={{
                    backgroundColor: '#0a0a0f',
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
                        backgroundColor: '#14141f',
                        borderColor: '#2a2a3e',
                        borderWidth: 1,
                      }}
                    >
                      {/* Date Badge */}
                      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(245, 166, 35, 0.1)' }}>
                        <Calendar size={14} style={{ color: '#f5a623' }} />
                        <span className="text-sm font-semibold" style={{ color: '#f5a623' }}>
                          {entry.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-3" style={{ color: accentColor }}>
                        {entry.title}
                      </h3>

                      {/* Description */}
                      <p className="mb-4" style={{ color: '#8a8a9a', lineHeight: '1.6' }}>
                        {entry.description}
                      </p>

                      {/* Stat Highlight */}
                      <div
                        className="p-3 rounded border-l-4"
                        style={{
                          backgroundColor: 'rgba(245, 166, 35, 0.05)',
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
                        backgroundColor: `rgba(${accentColor === '#f5a623' ? '245, 166, 35' : accentColor === '#2ec4b6' ? '46, 196, 182' : '230, 57, 70'}, 0.1)`,
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
        <div className="mt-16 p-6 rounded-lg text-center" style={{ backgroundColor: '#14141f', borderColor: '#2a2a3e', borderWidth: 1 }}>
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#f5a623' }}>
            Stage 1 Championship Coming Soon
          </h3>
          <p style={{ color: '#8a8a9a' }}>
            5 races remaining. Bristol, Martinsville (2), North Wilkesboro, and Las Vegas (2) set to close out the opening stage.
          </p>
        </div>
      </div>
    </div>
  );
}
