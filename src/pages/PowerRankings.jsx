import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useComputedStandings } from '../hooks/useSupabase';

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
  const { standings, loading } = useComputedStandings();

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <p style={{ color: '#8a8a9a' }}>Loading...</p>
      </div>
    );
  }

  const generateBlurb = (driver) => {
    const wins = driver.wins || 0;
    const points = driver.points || 0;
    const avgFinish = driver.avgFinish || 0;

    if (wins >= 2) {
      return `${driver.name} leads the championship with ${wins} wins and ${points} points. The consistency is impressive, with an average finish of ${avgFinish.toFixed(2)}.`;
    }
    if (avgFinish < 10) {
      return `${driver.name} is a podium threat every week with an impressive ${avgFinish.toFixed(2)} average finish. Currently sitting at ${points} points.`;
    }
    if (wins === 1) {
      return `${driver.name} has one win this season and is right in the mix with ${points} points. An average finish of ${avgFinish.toFixed(2)} shows steady performance.`;
    }
    return `${driver.name} is building momentum with ${points} points and ${driver.racesEntered} races entered. The average finish of ${avgFinish.toFixed(2)} shows room for growth.`;
  };

  const getHotStreak = (driver) => {
    if (!driver.raceByRace || driver.raceByRace.length < 3) {
      return 'Building consistency';
    }
    const last3 = driver.raceByRace.slice(-3);
    const last3Avg = last3.reduce((sum, r) => sum + (r.finish || 0), 0) / 3;
    if (last3Avg < 10) return '3 strong races';
    if (last3Avg > 20) return 'Inconsistent form';
    return 'Steady progress';
  };

  const getKeyStats = (driver) => {
    let last3Avg = 0;
    if (driver.raceByRace && driver.raceByRace.length > 0) {
      const last3 = driver.raceByRace.slice(-3);
      last3Avg = last3.reduce((sum, r) => sum + (r.finish || 0), 0) / last3.length;
    }
    return {
      last3Avg: last3Avg,
      seasonAvg: driver.avgFinish || 0,
    };
  };

  const rankings = standings.map((driver, idx) => ({
    rank: idx + 1,
    prev: idx + 1,
    ...driver,
  }));

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#f5a623' }}>
          Power Rankings
        </h1>
        <p className="text-sm mb-8" style={{ color: '#8a8a9a' }}>
          Current Standings | {standings.length} drivers
        </p>

        <div className="space-y-6">
          {rankings.map((driver) => {
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
                          #{driver.number} • {driver.nickname || 'Driver'}
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
                      {generateBlurb(driver)}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div>
                        <p style={{ color: '#2ec4b6' }} className="font-bold">
                          Recent Form
                        </p>
                        <p style={{ color: '#8a8a9a' }}>
                          {getHotStreak(driver)}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#2ec4b6' }} className="font-bold">
                          Last 3 Avg
                        </p>
                        <p style={{ color: '#8a8a9a' }}>
                          {getKeyStats(driver).last3Avg.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#2ec4b6' }} className="font-bold">
                          Season Avg
                        </p>
                        <p style={{ color: '#8a8a9a' }}>
                          {getKeyStats(driver).seasonAvg.toFixed(2)}
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
