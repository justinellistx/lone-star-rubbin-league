import React from 'react';
import { Trophy, Zap, Shield, Flame, Medal, TrendingUp, AlertCircle, Wrench, Loader } from 'lucide-react';
import { useRaceResultsByRace, useComputedStandings } from '../hooks/useSupabase';

export default function Awards() {
  const { data: races, loading: racesLoading } = useRaceResultsByRace();
  const { standings } = useComputedStandings();

  // Calculate per-race awards
  const getRaceAwards = (race) => {
    const results = race.results || [];

    if (results.length === 0) {
      return {
        hardCharger: null,
        toughLuck: null,
        cleanMachine: null,
        wreckingBall: null,
      };
    }

    // Hard Charger - most positions gained (startPosition - finishPosition)
    const hardCharger = results.reduce((prev, curr) => {
      const currGain = (curr.startPosition || 0) - (curr.finishPosition || 0);
      const prevGain = (prev.startPosition || 0) - (prev.finishPosition || 0);
      return currGain > prevGain ? curr : prev;
    });

    // Tough Luck - most positions lost (finishPosition - startPosition)
    const toughLuck = results.reduce((prev, curr) => {
      const currLoss = (curr.finishPosition || 0) - (curr.startPosition || 0);
      const prevLoss = (prev.finishPosition || 0) - (prev.startPosition || 0);
      return currLoss > prevLoss ? curr : prev;
    });

    // Clean Machine - fewest incidents
    const cleanMachine = results.reduce((prev, curr) =>
      (curr.incidents || 0) < (prev.incidents || 0) ? curr : prev
    );

    // Wrecking Ball - most incidents
    const wreckingBall = results.reduce((prev, curr) =>
      (curr.incidents || 0) > (prev.incidents || 0) ? curr : prev
    );

    return {
      hardCharger: hardCharger ? {
        ...hardCharger,
        gain: (hardCharger.startPosition || 0) - (hardCharger.finishPosition || 0),
      } : null,
      toughLuck: toughLuck ? {
        ...toughLuck,
        loss: (toughLuck.finishPosition || 0) - (toughLuck.startPosition || 0),
      } : null,
      cleanMachine: cleanMachine ? {
        ...cleanMachine,
        isClean: (cleanMachine.incidents || 0) === 0,
      } : null,
      wreckingBall: wreckingBall || null,
    };
  };

  // Calculate season-long awards
  const calculateSeasonAwards = () => {
    if (!standings || standings.length === 0) {
      return {
        ironMan: null,
        consistencyKing: null,
        comebackKing: null,
        incidentMagnet: null,
      };
    }

    // Iron Man - most races entered
    const ironMan = standings.reduce((prev, curr) =>
      (curr.racesEntered || 0) > (prev.racesEntered || 0) ? curr : prev
    );

    // Consistency King - lowest standard deviation in finishes
    let consistencyKing = null;
    let lowestStdDev = Infinity;

    standings.forEach(driver => {
      if (driver.raceByRace && driver.raceByRace.length >= 4) {
        const finishes = driver.raceByRace.map(r => r.finishPosition || 0);
        const mean = finishes.reduce((a, b) => a + b, 0) / finishes.length;
        const variance = finishes.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / finishes.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < lowestStdDev) {
          lowestStdDev = stdDev;
          consistencyKing = driver;
        }
      }
    });

    // Comeback King - best single-race improvement (startPosition - finishPosition)
    let comebackKing = null;
    let bestGain = -Infinity;

    standings.forEach(driver => {
      if (driver.raceByRace) {
        driver.raceByRace.forEach(race => {
          const gain = (race.startPosition || 0) - (race.finishPosition || 0);
          if (gain > bestGain) {
            bestGain = gain;
            comebackKing = {
              driver: race,
              name: driver.name,
              number: driver.number,
              gain,
            };
          }
        });
      }
    });

    // Incident Magnet - highest total incidents
    const incidentMagnet = standings.reduce((prev, curr) =>
      (curr.totalIncidents || 0) > (prev.totalIncidents || 0) ? curr : prev
    );

    return {
      ironMan,
      consistencyKing,
      comebackKing,
      incidentMagnet: (incidentMagnet.totalIncidents || 0) > 0 ? incidentMagnet : null,
    };
  };

  const seasonAwards = calculateSeasonAwards();
  const raceAwards = (races || []).map(race => ({
    race,
    awards: getRaceAwards(race),
  }));

  // Show loading state
  if (racesLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="flex items-center justify-center" style={{ height: '100vh' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader size={48} style={{ color: '#f5a623' }} className="animate-spin" />
            <p style={{ color: '#8a8a9a' }}>Loading awards data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Season Awards Hero Section */}
      <div className="px-4 py-12 md:px-8 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#f5a623' }}>
          Season Awards
        </h1>
        <p className="text-lg mb-12" style={{ color: '#8a8a9a' }}>
          Elite achievements across the Lone Star Rubbin' League
        </p>

        {/* Season Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Iron Man */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#14141f', borderColor: '#2a2a3e', borderWidth: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <Medal size={24} style={{ color: '#f5a623' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#f5a623' }}>Iron Man</h3>
            </div>
            {seasonAwards.ironMan ? (
              <div>
                <p className="text-2xl font-bold mb-2" style={{ color: '#2ec4b6' }}>
                  {seasonAwards.ironMan.name}
                </p>
                <p className="text-sm" style={{ color: '#8a8a9a' }}>
                  {seasonAwards.ironMan.racesEntered} races completed
                </p>
              </div>
            ) : (
              <p style={{ color: '#8a8a9a' }}>No qualifier</p>
            )}
          </div>

          {/* Consistency King */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#14141f', borderColor: '#2a2a3e', borderWidth: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={24} style={{ color: '#f5a623' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#f5a623' }}>Consistency King</h3>
            </div>
            {seasonAwards.consistencyKing ? (
              <div>
                <p className="text-2xl font-bold mb-2" style={{ color: '#2ec4b6' }}>
                  {seasonAwards.consistencyKing.name}
                </p>
                <p className="text-sm" style={{ color: '#8a8a9a' }}>
                  Lowest variance in finishes
                </p>
              </div>
            ) : (
              <p style={{ color: '#8a8a9a' }}>No qualifier</p>
            )}
          </div>

          {/* Comeback King */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#14141f', borderColor: '#2a2a3e', borderWidth: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <Zap size={24} style={{ color: '#f5a623' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#f5a623' }}>Comeback King</h3>
            </div>
            {seasonAwards.comebackKing ? (
              <div>
                <p className="text-2xl font-bold mb-2" style={{ color: '#2ec4b6' }}>
                  {seasonAwards.comebackKing.name}
                </p>
                <p className="text-sm" style={{ color: '#8a8a9a' }}>
                  +{seasonAwards.comebackKing.gain} positions
                </p>
              </div>
            ) : (
              <p style={{ color: '#8a8a9a' }}>No qualifier</p>
            )}
          </div>

          {/* Incident Magnet */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#14141f', borderColor: '#2a2a3e', borderWidth: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} style={{ color: '#f5a623' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#f5a623' }}>Incident Magnet</h3>
            </div>
            {seasonAwards.incidentMagnet ? (
              <div>
                <p className="text-2xl font-bold mb-2" style={{ color: '#e63946' }}>
                  {seasonAwards.incidentMagnet.name}
                </p>
                <p className="text-sm" style={{ color: '#8a8a9a' }}>
                  {seasonAwards.incidentMagnet.totalIncidents} total incidents
                </p>
              </div>
            ) : (
              <p style={{ color: '#8a8a9a' }}>No qualifier</p>
            )}
          </div>
        </div>

        <div className="h-px" style={{ backgroundColor: '#2a2a3e' }} />
      </div>

      {/* Per-Race Awards */}
      <div className="px-4 py-12 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-12" style={{ color: '#f5a623' }}>
          Per-Race Awards
        </h2>

        {raceAwards.length === 0 ? (
          <p style={{ color: '#8a8a9a' }}>No race data available</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {raceAwards.map(({ race, awards }) => (
              <div
                key={race.raceNumber}
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: '#14141f', borderColor: '#2a2a3e', borderWidth: 1 }}
              >
                {/* Race Header */}
                <div className="p-6" style={{ backgroundColor: '#2a2a3e' }}>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: '#f5a623' }}>
                    Race {race.raceNumber}: {race.track}
                  </h3>
                  <p style={{ color: '#8a8a9a' }}>{race.date}</p>
                </div>

                {/* Awards Grid */}
                <div className="p-6 space-y-4">
                  {/* Hard Charger */}
                  {awards.hardCharger && (
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#2ec4b6' }}>
                        Hard Charger
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full"
                        style={{ backgroundColor: 'rgba(46, 196, 182, 0.1)', borderColor: '#2ec4b6', borderWidth: 1 }}
                      >
                        <Zap size={16} style={{ color: '#2ec4b6' }} />
                        <span style={{ color: '#2ec4b6' }} className="font-semibold">
                          {awards.hardCharger.name}
                        </span>
                        <span style={{ color: '#8a8a9a' }}>+{awards.hardCharger.gain}</span>
                      </div>
                    </div>
                  )}

                  {/* Tough Luck */}
                  {awards.toughLuck && (
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#e63946' }}>
                        Tough Luck
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full"
                        style={{ backgroundColor: 'rgba(230, 57, 70, 0.1)', borderColor: '#e63946', borderWidth: 1 }}
                      >
                        <TrendingUp size={16} style={{ color: '#e63946' }} />
                        <span style={{ color: '#e63946' }} className="font-semibold">
                          {awards.toughLuck.name}
                        </span>
                        <span style={{ color: '#8a8a9a' }}>-{awards.toughLuck.loss}</span>
                      </div>
                    </div>
                  )}

                  {/* Clean Machine */}
                  {awards.cleanMachine && (
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#f5a623' }}>
                        {awards.cleanMachine.isClean ? 'Perfect Race' : 'Clean Machine'}
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full"
                        style={{ backgroundColor: 'rgba(245, 166, 35, 0.1)', borderColor: '#f5a623', borderWidth: 1 }}
                      >
                        <Shield size={16} style={{ color: '#f5a623' }} />
                        <span style={{ color: '#f5a623' }} className="font-semibold">
                          {awards.cleanMachine.name}
                        </span>
                        <span style={{ color: '#8a8a9a' }}>{awards.cleanMachine.incidents} incidents</span>
                      </div>
                    </div>
                  )}

                  {/* Wrecking Ball */}
                  {awards.wreckingBall && (
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#e63946' }}>
                        Wrecking Ball
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full"
                        style={{ backgroundColor: 'rgba(230, 57, 70, 0.1)', borderColor: '#e63946', borderWidth: 1 }}
                      >
                        <Wrench size={16} style={{ color: '#e63946' }} />
                        <span style={{ color: '#e63946' }} className="font-semibold">
                          {awards.wreckingBall.name}
                        </span>
                        <span style={{ color: '#8a8a9a' }}>{awards.wreckingBall.incidents} incidents</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
