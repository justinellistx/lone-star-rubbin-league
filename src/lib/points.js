/**
 * NASCAR-style points calculation engine for iRacing league
 */

/**
 * Get points for a finishing position
 * 1st=40, 2nd=35, 3rd=34, 4th=33, 5th=32... down to 40th=1
 * @param {number} position - Finishing position (1-based)
 * @returns {number} Points awarded
 */
export function getPositionPoints(position) {
  if (position < 1 || position > 40) {
    return 0;
  }

  if (position === 1) return 40;
  if (position === 2) return 35;
  if (position <= 40) {
    return 34 - (position - 3);
  }

  return 0;
}

/**
 * Calculate bonus points for a race result (among league/human drivers only)
 * Each bonus is worth 2 points. Lowest incidents ties split 1 point each.
 * @param {Object} result - Single race result
 * @param {Array} allResults - All league member results from the race
 * @returns {Object} Bonuses: {pole, fastestLap, mostLapsLed, lowestIncidents}
 */
export function calculateBonuses(result, allResults) {
  const bonuses = {
    pole: 0,
    fastestLap: 0,
    mostLapsLed: 0,
    lowestIncidents: 0,
  };

  if (!allResults || allResults.length === 0) {
    return bonuses;
  }

  // Pole position bonus (2 points) - best starting position among league members
  const poleWinner = allResults.reduce((best, r) => {
    return (r.startPos || 99) < (best.startPos || 99) ? r : best;
  });
  if (poleWinner.custId === result.custId) {
    bonuses.pole = 2;
  }

  // Fastest lap bonus (2 points) - best lap time among league members
  const fastestLapWinner = allResults.reduce((best, r) => {
    if (!best.fastestLapTime || !r.fastestLapTime) return best;
    return parseFloat(r.fastestLapTime) < parseFloat(best.fastestLapTime) ? r : best;
  });
  if (fastestLapWinner.custId === result.custId) {
    bonuses.fastestLap = 2;
  }

  // Most laps led bonus (2 points) - only if someone led at least 1 lap
  const maxLapsLed = Math.max(...allResults.map((r) => r.lapsLed || 0));
  if (maxLapsLed > 0) {
    const mostLapsLedWinner = allResults.reduce((best, r) => {
      return (r.lapsLed || 0) > (best.lapsLed || 0) ? r : best;
    });
    if (mostLapsLedWinner.custId === result.custId) {
      bonuses.mostLapsLed = 2;
    }
  }

  // Lowest incidents bonus (2 points) - split 1-1 if tied
  const minIncidents = Math.min(...allResults.map((r) => r.incidents || 0));
  const tiedForLowest = allResults.filter((r) => (r.incidents || 0) === minIncidents);
  if ((result.incidents || 0) === minIncidents) {
    bonuses.lowestIncidents = tiedForLowest.length > 1 ? 1 : 2;
  }

  return bonuses;
}

/**
 * Calculate incident-based penalty
 * 0-20 incidents = 0 penalty
 * 21-30 incidents = -1
 * 31-40 incidents = -2
 * 41+ incidents = -3
 * Only the highest applicable tier applies (not cumulative)
 * @param {number} incidents - Number of incidents
 * @returns {number} Penalty (negative number)
 */
export function calculateIncidentPenalty(incidents) {
  if (incidents <= 20) {
    return 0;
  }

  if (incidents <= 30) {
    return -1;
  }

  if (incidents <= 40) {
    return -2;
  }

  return -3;
}

/**
 * Calculate stage standings from race results
 * Drops worst N races and sums remaining points
 * @param {Array} raceResults - Array of race result objects per driver [{custId, name, finPos, incidents, ...}]
 * @param {number} dropsAllowed - Number of worst races to drop (default: 3)
 * @returns {Array} Sorted standings [{custId, name, points, racePoints, bestRaces, droppedRaces}]
 */
export function calculateStageStandings(raceResults, dropsAllowed = 3) {
  // Group results by driver
  const driverMap = {};

  raceResults.forEach((result) => {
    if (!driverMap[result.custId]) {
      driverMap[result.custId] = {
        custId: result.custId,
        name: result.name,
        races: [],
      };
    }
    driverMap[result.custId].races.push(result);
  });

  // Calculate points for each driver
  const standings = Object.values(driverMap)
    .map((driver) => {
      const racePoints = driver.races.map((race) => {
        const positionPts = getPositionPoints(race.finPos);
        const bonusPts = race.bonuses || 0;
        const incidentPts = calculateIncidentPenalty(race.incidents || 0);
        return {
          race,
          total: positionPts + bonusPts + incidentPts,
          breakdown: {
            position: positionPts,
            bonus: bonusPts,
            incidents: incidentPts,
          },
        };
      });

      // Sort by points (ascending) to identify worst races
      const sorted = [...racePoints].sort((a, b) => a.total - b.total);

      // Drop worst races
      const dropped = sorted.slice(0, dropsAllowed);
      const best = sorted.slice(dropsAllowed);

      const totalPoints = best.reduce((sum, r) => sum + r.total, 0);

      return {
        custId: driver.custId,
        name: driver.name,
        points: totalPoints,
        racePoints: racePoints.map((r) => r.total),
        bestRaces: best.length,
        droppedRaces: dropped.length,
      };
    })
    .sort((a, b) => b.points - a.points);

  return standings;
}

/**
 * Calculate end-of-stage bonuses (+3 points each)
 * Awarded to stage champion contenders after all 12 races:
 * - Most total laps led across the stage
 * - Lowest total incident points across the stage
 * - Most fastest lap awards across the stage
 * @param {Array} raceResults - All race results for the stage
 * @returns {Object} Stage bonus leaders: {mostLapsLed, lowestIncidents, mostFastestLaps}
 */
export function calculateStageBonuses(raceResults) {
  const driverMap = {};

  raceResults.forEach((result) => {
    if (!driverMap[result.custId]) {
      driverMap[result.custId] = {
        custId: result.custId,
        name: result.name,
        totalLapsLed: 0,
        totalIncidents: 0,
        fastestLapAwards: 0,
        racesEntered: 0,
      };
    }

    const d = driverMap[result.custId];
    d.totalLapsLed += result.lapsLed || 0;
    d.totalIncidents += result.incidents || 0;
    d.racesEntered += 1;

    if (result.hadFastestLap) {
      d.fastestLapAwards += 1;
    }
  });

  const drivers = Object.values(driverMap);

  // Most laps led
  const mostLapsLed = drivers.reduce((best, d) =>
    d.totalLapsLed > (best.totalLapsLed || 0) ? d : best
  );

  // Lowest incidents
  const lowestIncidents = drivers.reduce((best, d) =>
    d.totalIncidents < (best.totalIncidents || Infinity) ? d : best
  );

  // Most fastest lap awards
  const mostFastestLaps = drivers.reduce((best, d) =>
    d.fastestLapAwards > (best.fastestLapAwards || 0) ? d : best
  );

  return {
    mostLapsLed: { name: mostLapsLed.name, value: mostLapsLed.totalLapsLed, bonus: 3 },
    lowestIncidents: { name: lowestIncidents.name, value: lowestIncidents.totalIncidents, bonus: 3 },
    mostFastestLaps: { name: mostFastestLaps.name, value: mostFastestLaps.fastestLapAwards, bonus: 3 },
    allDrivers: drivers,
  };
}

/**
 * Calculate team standings from driver standings
 * Sums best N finishes per team
 * @param {Array} driverStandings - Driver standings array
 * @param {Object} teams - Map of custId -> teamId
 * @param {number} bestFinishes - Number of best driver finishes to count (default: 9)
 * @returns {Array} Team standings sorted by points
 */
export function calculateTeamStandings(driverStandings, teams, bestFinishes = 9) {
  const teamMap = {};

  // Group drivers by team
  driverStandings.forEach((driver) => {
    const teamId = teams[driver.custId];
    if (!teamId) return;

    if (!teamMap[teamId]) {
      teamMap[teamId] = {
        teamId,
        drivers: [],
        driverPoints: [],
      };
    }

    teamMap[teamId].drivers.push(driver);
    teamMap[teamId].driverPoints.push({
      name: driver.name,
      points: driver.points,
    });
  });

  // Calculate team totals
  const standings = Object.values(teamMap)
    .map((team) => {
      // Sort driver points descending
      const sorted = [...team.driverPoints].sort((a, b) => b.points - a.points);

      // Take best N
      const best = sorted.slice(0, bestFinishes);
      const totalPoints = best.reduce((sum, d) => sum + d.points, 0);

      return {
        teamId: team.teamId,
        drivers: team.drivers.map((d) => ({ custId: d.custId, name: d.name })),
        driverCount: team.drivers.length,
        points: totalPoints,
        bestFinishesUsed: best.length,
        countedDrivers: best.map((d) => d.name),
      };
    })
    .sort((a, b) => b.points - a.points);

  return standings;
}
