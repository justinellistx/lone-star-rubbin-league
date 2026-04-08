import React from 'react';
import { Trophy, Zap, Shield, Flame, Medal, TrendingUp, AlertCircle, Wrench } from 'lucide-react';

const RACES = [
  { num: 1, track: 'Daytona', date: 'Feb 12', results: [
    { id: 'blaine', name: 'Blaine Karnes', start: 24, fin: 15, inc: 8 },
    { id: 'ryan', name: 'Ryan Ramsey', start: 25, fin: 18, inc: 8 },
    { id: 'justin', name: 'Justin Ellis4', start: 27, fin: 19, inc: 8 },
    { id: 'nik', name: 'Nik Green2', start: 29, fin: 24, inc: 20 },
    { id: 'terry', name: 'Terry Domino', start: 26, fin: 26, inc: 6 },
    { id: 'jordan', name: 'Jordan Stancil', start: 30, fin: 27, inc: 8 },
    { id: 'nate', name: 'Nathan Becker', start: 28, fin: 30, inc: 16 },
  ]},
  { num: 2, track: 'Atlanta', date: 'Feb 26', results: [
    { id: 'jordan', name: 'Jordan Stancil', start: 20, fin: 1, inc: 42 },
    { id: 'terry', name: 'Terry Domino', start: 8, fin: 2, inc: 33 },
    { id: 'nate', name: 'Nathan Becker', start: 14, fin: 13, inc: 34 },
    { id: 'blaine', name: 'Blaine Karnes', start: 17, fin: 17, inc: 30 },
    { id: 'nik', name: 'Nik Green2', start: 7, fin: 18, inc: 22 },
    { id: 'justin', name: 'Justin Ellis4', start: 9, fin: 20, inc: 18 },
    { id: 'ryan', name: 'Ryan Ramsey', start: 3, fin: 30, inc: 24 },
  ]},
  { num: 3, track: 'COTA', date: 'Mar 5', results: [
    { id: 'nate', name: 'Nathan Becker', start: 1, fin: 1, inc: 17 },
    { id: 'justin', name: 'Justin Ellis4', start: 27, fin: 22, inc: 17 },
    { id: 'ryan', name: 'Ryan Ramsey', start: 25, fin: 23, inc: 8 },
    { id: 'nik', name: 'Nik Green2', start: 6, fin: 24, inc: 25 },
    { id: 'blaine', name: 'Blaine Karnes', start: 24, fin: 25, inc: 43 },
    { id: 'jordan', name: 'Jordan Stancil', start: 26, fin: 26, inc: 46 },
    { id: 'terry', name: 'Terry Domino', start: 28, fin: 27, inc: 45 },
  ]},
  { num: 4, track: 'Phoenix', date: 'Mar 12', results: [
    { id: 'nate', name: 'Nathan Becker', start: 1, fin: 1, inc: 12 },
    { id: 'nik', name: 'Nik Green2', start: 2, fin: 2, inc: 12 },
    { id: 'jordan', name: 'Jordan Stancil', start: 5, fin: 3, inc: 4 },
    { id: 'justin', name: 'Justin Ellis4', start: 4, fin: 4, inc: 0 },
    { id: 'blaine', name: 'Blaine Karnes', start: 6, fin: 5, inc: 4 },
    { id: 'ryan', name: 'Ryan Ramsey', start: 3, fin: 23, inc: 12 },
    { id: 'sam', name: 'Sam Kunnemann', start: 9, fin: 24, inc: 20 },
    { id: 'terry', name: 'Terry Domino', start: 8, fin: 25, inc: 10 },
  ]},
  { num: 5, track: 'Las Vegas', date: 'Mar 19', results: [
    { id: 'nik', name: 'Nik Green2', start: 1, fin: 1, inc: 6 },
    { id: 'blaine', name: 'Blaine Karnes', start: 10, fin: 2, inc: 4 },
    { id: 'justin', name: 'Justin Ellis4', start: 5, fin: 3, inc: 0 },
    { id: 'jordan', name: 'Jordan Stancil', start: 6, fin: 4, inc: 0 },
    { id: 'nate', name: 'Nathan Becker', start: 4, fin: 19, inc: 11 },
    { id: 'sam', name: 'Sam Kunnemann', start: 7, fin: 22, inc: 10 },
    { id: 'terry', name: 'Terry Domino', start: 3, fin: 24, inc: 6 },
    { id: 'ryan', name: 'Ryan Ramsey', start: 2, fin: 25, inc: 4 },
  ]},
  { num: 6, track: 'Darlington', date: 'Mar 26', results: [
    { id: 'nik', name: 'Nik Green2', start: 2, fin: 1, inc: 10 },
    { id: 'justin', name: 'Justin Ellis4', start: 4, fin: 2, inc: 30 },
    { id: 'blaine', name: 'Blaine Karnes', start: 10, fin: 3, inc: 20 },
    { id: 'nate', name: 'Nathan Becker', start: 1, fin: 13, inc: 40 },
    { id: 'jordan', name: 'Jordan Stancil', start: 28, fin: 16, inc: 38 },
    { id: 'ryan', name: 'Ryan Ramsey', start: 3, fin: 18, inc: 12 },
    { id: 'sam', name: 'Sam Kunnemann', start: 14, fin: 25, inc: 42 },
  ]},
  { num: 7, track: 'Martinsville', date: 'Apr 3', results: [
    { id: 'nate', name: 'Nathan Becker', start: 3, fin: 1, inc: 10 },
    { id: 'ryan', name: 'Ryan Ramsey', start: 7, fin: 2, inc: 4 },
    { id: 'nik', name: 'Nik Green2', start: 2, fin: 3, inc: 4 },
    { id: 'justin', name: 'Justin Ellis4', start: 4, fin: 4, inc: 10 },
    { id: 'blaine', name: 'Blaine Karnes', start: 5, fin: 5, inc: 18 },
    { id: 'terry', name: 'Terry Domino', start: 6, fin: 12, inc: 32 },
    { id: 'sam', name: 'Sam Kunnemann', start: 8, fin: 24, inc: 52 },
    { id: 'ronald', name: 'Ronald Ramsey', start: 1, fin: 26, inc: 46 },
  ]},
];

export default function Awards() {
  // Calculate per-race awards
  const getRaceAwards = (race) => {
    const results = race.results;

    // Hard Charger - most positions gained
    const hardCharger = results.reduce((prev, curr) => {
      const currGain = curr.start - curr.fin;
      const prevGain = prev.start - prev.fin;
      return currGain > prevGain ? curr : prev;
    });

    // Tough Luck - most positions lost
    const toughLuck = results.reduce((prev, curr) => {
      const currLoss = curr.fin - curr.start;
      const prevLoss = prev.fin - prev.start;
      return currLoss > prevLoss ? curr : prev;
    });

    // Clean Machine - lowest incidents
    const cleanMachine = results.reduce((prev, curr) =>
      curr.inc < prev.inc ? curr : prev
    );

    // Wrecking Ball - highest incidents
    const wreckingBall = results.reduce((prev, curr) =>
      curr.inc > prev.inc ? curr : prev
    );

    return {
      hardCharger: { ...hardCharger, gain: hardCharger.start - hardCharger.fin },
      toughLuck: { ...toughLuck, loss: toughLuck.fin - toughLuck.start },
      cleanMachine: { ...cleanMachine, isClean: cleanMachine.inc === 0 },
      wreckingBall,
    };
  };

  // Calculate season-long awards
  const calculateSeasonAwards = () => {
    const allResults = RACES.flatMap(race =>
      race.results.map(r => ({ ...r, race: race.num, track: race.track }))
    );

    // Build driver records
    const driverRecords = {};
    allResults.forEach(result => {
      if (!driverRecords[result.id]) {
        driverRecords[result.id] = {
          id: result.id,
          name: result.name,
          races: [],
          totalIncidents: 0,
        };
      }
      driverRecords[result.id].races.push(result);
      driverRecords[result.id].totalIncidents += result.inc;
    });

    // Iron Man - 7 consecutive races (all 7 races)
    const ironManCandidates = Object.values(driverRecords).filter(d => d.races.length === 7);
    const ironManWinner = ironManCandidates.length > 0 ? ironManCandidates[0] : null;

    // Consistency King - lowest std dev in finishes (4+ races)
    const consistencyCandidates = Object.values(driverRecords).filter(d => d.races.length >= 4);
    let consistencyKing = null;
    let lowestStdDev = Infinity;

    consistencyCandidates.forEach(driver => {
      const finishes = driver.races.map(r => r.fin);
      const mean = finishes.reduce((a, b) => a + b, 0) / finishes.length;
      const variance = finishes.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / finishes.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < lowestStdDev) {
        lowestStdDev = stdDev;
        consistencyKing = { driver, stdDev };
      }
    });

    // Comeback King - best single-race improvement
    let comebackKing = null;
    let bestGain = -Infinity;

    Object.values(driverRecords).forEach(driver => {
      driver.races.forEach(race => {
        const gain = race.start - race.fin;
        if (gain > bestGain) {
          bestGain = gain;
          comebackKing = { driver: race, gain };
        }
      });
    });

    // Incident Magnet - highest total incidents
    let incidentMagnet = null;
    let maxIncidents = -1;

    Object.values(driverRecords).forEach(driver => {
      if (driver.totalIncidents > maxIncidents) {
        maxIncidents = driver.totalIncidents;
        incidentMagnet = { name: driver.name, total: driver.totalIncidents };
      }
    });

    return {
      ironMan: ironManWinner,
      consistencyKing: consistencyKing?.driver,
      comebackKing,
      incidentMagnet,
    };
  };

  const seasonAwards = calculateSeasonAwards();
  const raceAwards = RACES.map(race => ({
    race,
    awards: getRaceAwards(race),
  }));

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
                  All {seasonAwards.ironMan.races.length} races completed
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
                  {seasonAwards.comebackKing.driver.name}
                </p>
                <p className="text-sm" style={{ color: '#8a8a9a' }}>
                  +{seasonAwards.comebackKing.gain} positions at {seasonAwards.comebackKing.driver.track}
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
                  {seasonAwards.incidentMagnet.total} total incidents
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {raceAwards.map(({ race, awards }) => (
            <div
              key={race.num}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: '#14141f', borderColor: '#2a2a3e', borderWidth: 1 }}
            >
              {/* Race Header */}
              <div className="p-6" style={{ backgroundColor: '#2a2a3e' }}>
                <h3 className="text-2xl font-bold mb-1" style={{ color: '#f5a623' }}>
                  Race {race.num}: {race.track}
                </h3>
                <p style={{ color: '#8a8a9a' }}>{race.date}</p>
              </div>

              {/* Awards Grid */}
              <div className="p-6 space-y-4">
                {/* Hard Charger */}
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

                {/* Tough Luck */}
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

                {/* Clean Machine */}
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
                    <span style={{ color: '#8a8a9a' }}>{awards.cleanMachine.inc} incidents</span>
                  </div>
                </div>

                {/* Wrecking Ball */}
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
                    <span style={{ color: '#8a8a9a' }}>{awards.wreckingBall.inc} incidents</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
