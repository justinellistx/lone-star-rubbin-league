import { useState, useEffect, useMemo } from 'react';
import { useAllRaceResults, useTeams } from './useSupabase';

// ─── Payout Tier Definitions ──────────────────────────────────

const CROWN_JEWEL = [
  40000, 24000, 18000, 14000, 12000, 9000, 8000, 7000, 6000, 5000,
  4600, 4200, 3800, 3500, 3200, 3000, 2800, 2600, 2500, 2400,
  2300, 2200, 2100, 2000, 1900, 1800, 1700, 1600, 1500, 1400,
];

const MAJOR = [
  18750, 12500, 10000, 8125, 6875, 5000, 4500, 4000, 3500, 3125,
  2800, 2600, 2400, 2200, 2000, 1800, 1700, 1600, 1500, 1400,
  1300, 1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800,
];

const STANDARD = [
  12000, 9000, 7000, 6000, 5000, 4000, 3600, 3300, 3000, 2700,
  2500, 2300, 2100, 2000, 1900, 1800, 1700, 1600, 1550, 1500,
  1450, 1400, 1350, 1300, 1250, 1200, 1150, 1100, 1050, 1000,
];

const FINALE = [
  75000, 42000, 30000, 24000, 18000, 12000, 10000, 8000, 7000, 6000,
  5500, 5000, 4500, 4000, 3800, 3600, 3400, 3200, 3000, 2800,
  2600, 2400, 2200, 2000, 1900, 1800, 1700, 1600, 1500, 1400,
];

// Map race_number → tier
const RACE_TIER_MAP = {
  1: 'crown',    // Daytona 500
  2: 'major',    // Atlanta
  3: 'standard', // COTA
  4: 'standard', // Phoenix
  5: 'major',    // Las Vegas
  6: 'standard', // Darlington (Spring)
  7: 'major',    // Martinsville
  8: 'major',    // Bristol
  9: 'major',    // Kansas
  10: 'major',   // Talladega
  11: 'standard',// Texas
  12: 'standard',// Watkins Glen
  13: 'crown',   // Coca-Cola 600 (Charlotte)
  14: 'major',   // Nashville
  15: 'major',   // Michigan
  16: 'standard',// Pocono
  17: 'major',   // San Diego Street Race
  18: 'standard',// Sonoma
  19: 'standard',// Chicagoland
  20: 'major',   // Atlanta 2
  21: 'major',   // North Wilkesboro
  22: 'crown',   // Indianapolis (Brickyard 400)
  23: 'standard',// Iowa
  24: 'standard',// Richmond
  25: 'standard',// New Hampshire
  26: 'major',   // Daytona (Regular Season Finale)
  27: 'crown',   // Darlington (Southern 500)
  28: 'major',   // Gateway
  29: 'major',   // Bristol (Night Race)
  30: 'major',   // Kansas
  31: 'major',   // Las Vegas
  32: 'major',   // Charlotte Roval
  33: 'major',   // Phoenix
  34: 'major',   // Talladega
  35: 'major',   // Martinsville
  36: 'finale',  // Homestead-Miami (Championship)
};

const TIER_PAYOUTS = {
  crown: CROWN_JEWEL,
  major: MAJOR,
  standard: STANDARD,
  finale: FINALE,
};

const TIER_LABELS = {
  crown: 'Crown Jewel',
  major: 'Major',
  standard: 'Standard',
  finale: 'Finale',
};

const TIER_PURSE = {
  crown: 200000,
  major: 125000,
  standard: 100000,
  finale: 300000,
};

const BONUS_AMOUNTS = {
  pole: 2000,
  mostLapsLed: 2000,
  fastestLap: 2000,
  cleanRace: 3000,
};

// ─── Race name lookup (for display) ───────────────────────────

const RACE_NAMES = {
  1: 'Daytona 500',
  2: 'Atlanta',
  3: 'COTA',
  4: 'Phoenix',
  5: 'Las Vegas',
  6: 'Darlington',
  7: 'Martinsville',
  8: 'Bristol',
  9: 'Kansas',
  10: 'Talladega',
  11: 'Texas',
  12: 'Watkins Glen',
  13: 'Coca-Cola 600',
  14: 'Nashville',
  15: 'Michigan',
  16: 'Pocono',
  17: 'San Diego',
  18: 'Sonoma',
  19: 'Chicagoland',
  20: 'Atlanta 2',
  21: 'N. Wilkesboro',
  22: 'Brickyard 400',
  23: 'Iowa',
  24: 'Richmond',
  25: 'New Hampshire',
  26: 'Daytona 2',
  27: 'Southern 500',
  28: 'Gateway',
  29: 'Bristol Night',
  30: 'Kansas 2',
  31: 'Las Vegas 2',
  32: 'Charlotte Roval',
  33: 'Phoenix 2',
  34: 'Talladega 2',
  35: 'Martinsville 2',
  36: 'Homestead',
};

/**
 * Master payout hook — computes all earnings from race results.
 */
export function usePayouts() {
  const { data: allResults, loading: rLoading, error: rError } = useAllRaceResults();
  const { data: teams, loading: tLoading, error: tError } = useTeams();

  const payouts = useMemo(() => {
    if (!allResults || allResults.length === 0) return null;

    // Group results by race
    const raceGroups = {};
    allResults.forEach((r) => {
      const raceNum = r.races?.race_number;
      if (!raceNum) return;
      if (!raceGroups[raceNum]) raceGroups[raceNum] = [];
      raceGroups[raceNum].push(r);
    });

    // Per-driver earnings accumulator
    const driverEarnings = {}; // keyed by driver_id

    // Per-race payout details (for breakdown view)
    const racePayouts = [];

    Object.entries(raceGroups).forEach(([raceNumStr, results]) => {
      const raceNum = parseInt(raceNumStr, 10);
      const tier = RACE_TIER_MAP[raceNum] || 'standard';
      const payoutTable = TIER_PAYOUTS[tier];
      const trackName = results[0]?.races?.track_name || RACE_NAMES[raceNum] || `Race ${raceNum}`;

      // Sort by finish_position for payout assignment
      const sorted = [...results].sort((a, b) => a.finish_position - b.finish_position);

      // Determine bonus winners for this race
      // Pole: start_position === 1
      const poleWinner = sorted.find((r) => r.start_position === 1);

      // Most laps led (highest laps_led > 0)
      const mostLapsLedDriver = sorted.reduce(
        (best, r) => (!best || (r.laps_led || 0) > (best.laps_led || 0) ? r : best),
        null
      );
      const mostLapsLedWinner = mostLapsLedDriver && (mostLapsLedDriver.laps_led || 0) > 0
        ? mostLapsLedDriver
        : null;

      // Fastest lap (lowest fastest_lap_time > 0)
      const fastestLapDriver = sorted.reduce(
        (best, r) => {
          if (!r.fastest_lap_time || r.fastest_lap_time <= 0) return best;
          if (!best || r.fastest_lap_time < best.fastest_lap_time) return r;
          return best;
        },
        null
      );

      // Clean race (lowest incidents)
      const cleanRaceDriver = sorted.reduce(
        (best, r) => {
          const inc = r.incidents ?? Infinity;
          if (!best || inc < (best.incidents ?? Infinity)) return r;
          return best;
        },
        null
      );

      const raceDetail = {
        raceNumber: raceNum,
        trackName,
        displayName: RACE_NAMES[raceNum] || trackName,
        tier,
        tierLabel: TIER_LABELS[tier],
        purse: TIER_PURSE[tier],
        drivers: [],
        bonuses: {
          pole: poleWinner
            ? { driverId: poleWinner.driver_id, name: poleWinner.drivers?.name, amount: BONUS_AMOUNTS.pole }
            : null,
          mostLapsLed: mostLapsLedWinner
            ? { driverId: mostLapsLedWinner.driver_id, name: mostLapsLedWinner.drivers?.name, laps: mostLapsLedWinner.laps_led, amount: BONUS_AMOUNTS.mostLapsLed }
            : null,
          fastestLap: fastestLapDriver
            ? { driverId: fastestLapDriver.driver_id, name: fastestLapDriver.drivers?.name, time: fastestLapDriver.fastest_lap_time, amount: BONUS_AMOUNTS.fastestLap }
            : null,
          cleanRace: cleanRaceDriver
            ? { driverId: cleanRaceDriver.driver_id, name: cleanRaceDriver.drivers?.name, incidents: cleanRaceDriver.incidents, amount: BONUS_AMOUNTS.cleanRace }
            : null,
        },
      };

      // Assign position payouts
      sorted.forEach((r) => {
        const pos = r.finish_position;
        const positionPayout = pos >= 1 && pos <= 30 ? payoutTable[pos - 1] : 0;

        // Calculate bonuses for this driver in this race
        let bonusTotal = 0;
        const bonusDetails = [];

        if (poleWinner && r.driver_id === poleWinner.driver_id) {
          bonusTotal += BONUS_AMOUNTS.pole;
          bonusDetails.push({ type: 'Pole Position', amount: BONUS_AMOUNTS.pole });
        }
        if (mostLapsLedWinner && r.driver_id === mostLapsLedWinner.driver_id) {
          bonusTotal += BONUS_AMOUNTS.mostLapsLed;
          bonusDetails.push({ type: 'Most Laps Led', amount: BONUS_AMOUNTS.mostLapsLed });
        }
        if (fastestLapDriver && r.driver_id === fastestLapDriver.driver_id) {
          bonusTotal += BONUS_AMOUNTS.fastestLap;
          bonusDetails.push({ type: 'Fastest Lap', amount: BONUS_AMOUNTS.fastestLap });
        }
        if (cleanRaceDriver && r.driver_id === cleanRaceDriver.driver_id) {
          bonusTotal += BONUS_AMOUNTS.cleanRace;
          bonusDetails.push({ type: 'Clean Race', amount: BONUS_AMOUNTS.cleanRace });
        }

        const totalRaceEarnings = positionPayout + bonusTotal;

        raceDetail.drivers.push({
          driverId: r.driver_id,
          name: r.drivers?.name || 'Unknown',
          carNumber: r.drivers?.car_number || r.car_number,
          teamId: r.drivers?.team_id,
          finishPosition: pos,
          startPosition: r.start_position,
          lapsLed: r.laps_led || 0,
          incidents: r.incidents || 0,
          positionPayout,
          bonusTotal,
          bonusDetails,
          totalRaceEarnings,
        });

        // Accumulate into driver totals
        if (!driverEarnings[r.driver_id]) {
          driverEarnings[r.driver_id] = {
            driverId: r.driver_id,
            name: r.drivers?.name || 'Unknown',
            carNumber: r.drivers?.car_number || r.car_number,
            teamId: r.drivers?.team_id,
            totalEarnings: 0,
            positionEarnings: 0,
            bonusEarnings: 0,
            racesCompleted: 0,
            wins: 0,
            poles: 0,
            bonusCounts: { pole: 0, mostLapsLed: 0, fastestLap: 0, cleanRace: 0 },
            raceBreakdown: [],
          };
        }
        const de = driverEarnings[r.driver_id];
        de.totalEarnings += totalRaceEarnings;
        de.positionEarnings += positionPayout;
        de.bonusEarnings += bonusTotal;
        de.racesCompleted += 1;
        if (pos === 1) de.wins += 1;
        if (r.start_position === 1) de.poles += 1;
        bonusDetails.forEach((b) => {
          if (b.type === 'Pole Position') de.bonusCounts.pole += 1;
          if (b.type === 'Most Laps Led') de.bonusCounts.mostLapsLed += 1;
          if (b.type === 'Fastest Lap') de.bonusCounts.fastestLap += 1;
          if (b.type === 'Clean Race') de.bonusCounts.cleanRace += 1;
        });
        de.raceBreakdown.push({
          raceNumber: raceNum,
          trackName: raceDetail.displayName,
          tier,
          finishPosition: pos,
          positionPayout,
          bonusTotal,
          bonusDetails,
          totalRaceEarnings,
        });
      });

      racePayouts.push(raceDetail);
    });

    // Sort race payouts by race number
    racePayouts.sort((a, b) => a.raceNumber - b.raceNumber);

    // Build sorted driver leaderboard
    const driverLeaderboard = Object.values(driverEarnings)
      .sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Build team leaderboard from teams data
    let teamLeaderboard = [];
    if (teams && teams.length > 0) {
      teamLeaderboard = teams.map((team) => {
        const teamDriverIds = team.drivers.map((d) => d.id);
        const teamDriverEarnings = teamDriverIds
          .map((id) => driverEarnings[id])
          .filter(Boolean);

        const totalEarnings = teamDriverEarnings.reduce((sum, de) => sum + de.totalEarnings, 0);
        const positionEarnings = teamDriverEarnings.reduce((sum, de) => sum + de.positionEarnings, 0);
        const bonusEarnings = teamDriverEarnings.reduce((sum, de) => sum + de.bonusEarnings, 0);
        const totalWins = teamDriverEarnings.reduce((sum, de) => sum + de.wins, 0);

        return {
          teamId: team.id,
          teamName: team.name,
          drivers: teamDriverEarnings,
          driverCount: teamDriverEarnings.length,
          totalEarnings,
          positionEarnings,
          bonusEarnings,
          totalWins,
        };
      }).filter((t) => t.driverCount > 0).sort((a, b) => b.totalEarnings - a.totalEarnings);
    }

    return {
      driverLeaderboard,
      teamLeaderboard,
      racePayouts,
      tierLabels: TIER_LABELS,
      tierPurses: TIER_PURSE,
      bonusAmounts: BONUS_AMOUNTS,
      raceNames: RACE_NAMES,
      raceTierMap: RACE_TIER_MAP,
    };
  }, [allResults, teams]);

  return {
    payouts,
    loading: rLoading || tLoading,
    error: rError || tError,
  };
}
