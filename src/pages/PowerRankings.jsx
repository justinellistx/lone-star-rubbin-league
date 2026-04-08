import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RANKINGS = [
  {
    rank: 1,
    prev: 2,
    id: 'nik',
    name: 'Nik Green2',
    number: 88,
    nickname: 'Adventure Man',
    blurb:
      "Back-to-back wins at Vegas and Darlington, plus a P3 at Martinsville — Adventure Man is the hottest driver in the league right now. Leads the standings by 2 and has the most laps led (301) by a huge margin. The early-season struggles at Daytona and Atlanta feel like ancient history.",
    hotStreak: '3 straight podiums',
    keyStats: { last3Avg: 1.67, seasonAvg: 10.43 },
  },
  {
    rank: 2,
    prev: 1,
    id: 'nate',
    name: 'Nathan Becker',
    number: 21,
    nickname: 'Becker Wrecker',
    blurb:
      "Three wins is the most in the league, but that P19 at Vegas and the 40-incident meltdown at Darlington knocked him off the top spot. When he's on, nobody can touch him — the COTA and Phoenix dominance proved that. Just 2 points back and hungry.",
    hotStreak: 'Won Martinsville',
    keyStats: { last3Avg: 11.0, seasonAvg: 11.14 },
  },
  {
    rank: 3,
    prev: 3,
    id: 'justin',
    name: 'Justin Ellis4',
    number: 5,
    nickname: 'J-Easy',
    blurb:
      'The most consistent driver without a win. Four straight top-5s heading into Martinsville. Led 63 laps at Vegas and still finished P3. J-Easy is overdue for a breakthrough — when it clicks, watch out.',
    hotStreak: '4 straight top-5s (R4-R7)',
    keyStats: { last3Avg: 3.33, seasonAvg: 10.57 },
  },
  {
    rank: 4,
    prev: 4,
    id: 'blaine',
    name: 'Blaine Karnes',
    number: 25,
    nickname: 'Tard',
    blurb:
      'Mr. Reliable. Four top-5s and the best average finish in the league (10.3) — even better than Nik and Justin. Zero laps led though, which means he\'s always the bridesmaid. Needs to find another gear to contend for wins.',
    hotStreak: '4 top-5s in last 4 races',
    keyStats: { last3Avg: 4.33, seasonAvg: 10.29 },
  },
  {
    rank: 5,
    prev: 6,
    id: 'ryan',
    name: 'Ryan Ramsey',
    number: 10,
    nickname: 'Thunder Boy',
    blurb:
      "That P2 at Martinsville was a STATEMENT. Thunder Boy also holds the lowest total incidents in the league (72) and has won two Fastest Lap awards. If the speed keeps translating to finishes, he could be a dark horse for the Stage 1 title.",
    hotStreak: 'P2 at Martinsville',
    keyStats: { last3Avg: 15.0, seasonAvg: 19.86 },
  },
  {
    rank: 6,
    prev: 5,
    id: 'jordan',
    name: 'Jordan Stancil',
    number: 15,
    nickname: 'J-Dawg',
    blurb:
      'The Atlanta win was electric, but missing Martinsville (DNR) hurts in the standings. When he shows up, he\'s fast — P3 at Phoenix, P4 at Vegas. Needs to string together consistent races and avoid the DNR pit.',
    hotStreak: 'DNR at Martinsville',
    keyStats: { last3Avg: 8.0, seasonAvg: 12.83 },
  },
  {
    rank: 7,
    prev: 7,
    id: 'terry',
    name: 'Terry Domino',
    number: 11,
    nickname: 'Domino Slices',
    blurb:
      'That P2 at Atlanta showed Domino Slices has race-winning speed, but the rest of the season has been rough — P24-P27 finishes and a DNR at Darlington. High incidents are the story; if he cleans it up, he could jump back into the mix.',
    hotStreak: 'P12 at Martinsville',
    keyStats: { last3Avg: 20.0, seasonAvg: 19.33 },
  },
  {
    rank: 8,
    prev: 8,
    id: 'sam',
    name: 'Sam Kunnemann',
    number: 64,
    nickname: 'Samon',
    blurb:
      'Only four races in and learning the ropes. The incident counts are high (124 total in 4 races), but Samon is getting seat time and that\'s what matters. A clean race is the next milestone.',
    hotStreak: 'Building experience',
    keyStats: { last3Avg: 23.67, seasonAvg: 23.75 },
  },
  {
    rank: 9,
    prev: 9,
    id: 'ronald',
    name: 'Ronald Ramsey',
    number: 77,
    nickname: 'The Fuzz',
    blurb:
      'Made his league debut at Martinsville starting from POLE — then reality hit with 46 incidents and a P26 finish. The Fuzz has potential (that qualifying speed!), but needs to dial it back and bring the car home in one piece.',
    hotStreak: 'League debut at Martinsville',
    keyStats: { last3Avg: 26.0, seasonAvg: 26.0 },
  },
];

function TrendIndicator({ rank, prev }) {
  if (rank < prev) {
    return (
      <div className="flex items-center gap-1">
        <TrendingUp size={16} style={{ color: '#2ec4b6' }} />
        <span className="text-xs font-bold" style={{ color: '#2ec4b6' }}>
          UP {prev - rank}
        </span>
      </div>
    );
  } else if (rank > prev) {
    return (
      <div className="flex items-center gap-1">
        <TrendingDown size={16} style={{ color: '#e63946' }} />
        <span className="text-xs font-bold" style={{ color: '#e63946' }}>
          DOWN {rank - prev}
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1">
        <Minus size={16} style={{ color: '#8a8a9a' }} />
        <span className="text-xs font-bold" style={{ color: '#8a8a9a' }}>
          SAME
        </span>
      </div>
    );
  }
}

export default function PowerRankings() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#f5a623' }}>
          Power Rankings
        </h1>
        <p className="text-sm mb-8" style={{ color: '#8a8a9a' }}>
          Week 7 | After Martinsville
        </p>

        <div className="space-y-6">
          {RANKINGS.map((driver) => {
            const isChamp = driver.rank === 1;
            const bgColor = isChamp ? '#1a1a24' : '#14141f';
            const borderColor = isChamp ? '#f5a623' : '#2a2a3e';

            return (
              <div
                key={driver.id}
                className={`p-6 rounded-lg border ${isChamp ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  ringColor: isChamp ? '#f5a623' : undefined,
                }}
              >
                <div className="flex items-start gap-6">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl"
                      style={{
                        backgroundColor: isChamp ? '#f5a623' : '#2a2a3e',
                        color: isChamp ? '#000000' : '#f5a623',
                      }}
                    >
                      {driver.rank}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {driver.name}
                        </h3>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: '#2ec4b6' }}
                        >
                          #{driver.number} • {driver.nickname}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <TrendIndicator rank={driver.rank} prev={driver.prev} />
                      </div>
                    </div>

                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: '#8a8a9a' }}
                    >
                      {driver.blurb}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div>
                        <p style={{ color: '#2ec4b6' }} className="font-bold">
                          Hot Streak
                        </p>
                        <p style={{ color: '#8a8a9a' }}>
                          {driver.hotStreak}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#2ec4b6' }} className="font-bold">
                          Last 3 Avg
                        </p>
                        <p style={{ color: '#8a8a9a' }}>
                          {driver.keyStats.last3Avg.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#2ec4b6' }} className="font-bold">
                          Season Avg
                        </p>
                        <p style={{ color: '#8a8a9a' }}>
                          {driver.keyStats.seasonAvg.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mt-12 p-6 rounded-lg border"
          style={{
            backgroundColor: '#14141f',
            borderColor: '#2a2a3e',
          }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: '#f5a623' }}>
            Rankings Notes
          </h2>
          <p style={{ color: '#8a8a9a' }} className="text-sm">
            Power Rankings are updated weekly and reflect driver performance,
            consistency, recent form, and championship implications. These are
            editorial assessments and may differ from the official points
            standings.
          </p>
        </div>
      </div>
    </div>
  );
}
