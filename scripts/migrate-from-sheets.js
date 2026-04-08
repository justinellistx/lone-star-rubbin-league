#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Hardcoded drivers
const drivers = [
  'Justin Ellis4',
  'Blaine Karnes',
  'Ryan Ramsey',
  'Nik Green2',
  'Terry Domino',
  'Jordan Stancil',
  'Nathan Becker',
  'Sam Kunnemann',
];

// Teams: [team_name, driver1, driver2]
const teams = [
  ['Justin+Nate', 'Justin Ellis4', 'Nathan Becker'],
  ['Blaine+Terry', 'Blaine Karnes', 'Terry Domino'],
  ['Nik+Jordan', 'Nik Green2', 'Jordan Stancil'],
  ['Ryan+Sam', 'Ryan Ramsey', 'Sam Kunnemann'],
];

// Stage 1 existing races: [track_name, date]
const stage1Races = [
  { track: 'Daytona', date: '2026-02-12' },
  { track: 'EchoPark', date: '2026-02-26' },
  { track: 'CODA', date: '2026-03-05' },
  { track: 'Phoenix', date: '2026-03-12' },
  { track: 'Las Vegas', date: '2026-03-19' },
  { track: 'Darlington', date: '2026-03-26' },
];

// NASCAR points: 1st=40, 2nd=35, 3rd=34, ..., 40th=1
function generatePointsStructure() {
  const points = [];
  for (let position = 1; position <= 40; position++) {
    if (position === 1) {
      points.push({ position, points: 40 });
    } else if (position === 2) {
      points.push({ position, points: 35 });
    } else if (position >= 3 && position <= 40) {
      points.push({ position, points: 36 - position });
    }
  }
  return points;
}

async function migrate() {
  try {
    console.log('Starting migration...\n');

    // 1. Create drivers
    console.log('Seeding drivers...');
    const driverIds = {};
    for (const driverName of drivers) {
      const { data, error } = await supabase
        .from('drivers')
        .insert({ name: driverName })
        .select();
      if (error) throw error;
      driverIds[driverName] = data[0].id;
      console.log(`  ✓ ${driverName}`);
    }

    // 2. Create season
    console.log('\nSeeding season...');
    const { data: seasonData, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        name: '2026 Lone Star Rubbin\'',
        league_id: 11660,
      })
      .select();
    if (seasonError) throw seasonError;
    const seasonId = seasonData[0].id;
    console.log(`  ✓ Season created (ID: ${seasonId})`);

    // 3. Create teams
    console.log('\nSeeding teams...');
    const teamIds = {};
    for (const [teamName, driver1, driver2] of teams) {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          season_id: seasonId,
          name: teamName,
        })
        .select();
      if (teamError) throw teamError;
      const teamId = teamData[0].id;
      teamIds[teamName] = teamId;

      // Add drivers to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          { team_id: teamId, driver_id: driverIds[driver1] },
          { team_id: teamId, driver_id: driverIds[driver2] },
        ]);
      if (memberError) throw memberError;
      console.log(`  ✓ ${teamName}: ${driver1}, ${driver2}`);
    }

    // 4. Create Stage 1
    console.log('\nSeeding Stage 1...');
    const { data: stageData, error: stageError } = await supabase
      .from('stages')
      .insert({
        season_id: seasonId,
        name: 'Stage 1',
        series: 'NASCAR Truck',
        race_count: 12,
        drop_count: 3,
      })
      .select();
    if (stageError) throw stageError;
    const stage1Id = stageData[0].id;
    console.log(`  ✓ Stage 1 created (${stageData[0].race_count} races, ${stageData[0].drop_count} drops)`);

    // 5. Create existing races for Stage 1
    console.log('\nSeeding existing Stage 1 races...');
    for (let i = 0; i < stage1Races.length; i++) {
      const race = stage1Races[i];
      const { data: raceData, error: raceError } = await supabase
        .from('races')
        .insert({
          stage_id: stage1Id,
          race_number: i + 1,
          track: race.track,
          race_date: race.date,
          status: 'completed',
        })
        .select();
      if (raceError) throw raceError;
      console.log(`  ✓ Race ${i + 1}: ${race.track} (${race.date})`);
    }

    // 6. Create remaining races for Stage 1 (races 7-12)
    console.log('\nSeeding remaining Stage 1 races...');
    for (let i = 6; i < 12; i++) {
      const { data: raceData, error: raceError } = await supabase
        .from('races')
        .insert({
          stage_id: stage1Id,
          race_number: i + 1,
          track: `TBD - Race ${i + 1}`,
          status: 'scheduled',
        })
        .select();
      if (raceError) throw raceError;
      console.log(`  ✓ Race ${i + 1}: Scheduled`);
    }

    // 7. Create Stages 2 and 3
    console.log('\nSeeding Stage 2...');
    const { data: stage2Data, error: stage2Error } = await supabase
      .from('stages')
      .insert({
        season_id: seasonId,
        name: 'Stage 2',
        series: 'NASCAR Truck',
        race_count: 12,
        drop_count: 3,
      })
      .select();
    if (stage2Error) throw stage2Error;
    const stage2Id = stage2Data[0].id;
    console.log(`  ✓ Stage 2 created`);

    console.log('\nSeeding Stage 3...');
    const { data: stage3Data, error: stage3Error } = await supabase
      .from('stages')
      .insert({
        season_id: seasonId,
        name: 'Stage 3',
        series: 'NASCAR Truck',
        race_count: 12,
        drop_count: 3,
      })
      .select();
    if (stage3Error) throw stage3Error;
    const stage3Id = stage3Data[0].id;
    console.log(`  ✓ Stage 3 created`);

    // 8. Create races for Stage 2 and 3
    console.log('\nSeeding races for Stage 2 and 3...');
    for (const stageId of [stage2Id, stage3Id]) {
      for (let i = 1; i <= 12; i++) {
        const { error: raceError } = await supabase
          .from('races')
          .insert({
            stage_id: stageId,
            race_number: i,
            track: `TBD - Race ${i}`,
            status: 'scheduled',
          });
        if (raceError) throw raceError;
      }
    }
    console.log(`  ✓ 24 races created (12 each for Stage 2 & 3)`);

    // 9. Create points structure
    console.log('\nSeeding NASCAR points structure...');
    const pointsStructure = generatePointsStructure();
    const { error: pointsError } = await supabase
      .from('points_structures')
      .insert({
        season_id: seasonId,
        name: 'NASCAR Truck',
        points_data: pointsStructure,
      });
    if (pointsError) throw pointsError;
    console.log(`  ✓ Points structure created (1st=40, 2nd=35, ..., 40th=1)`);

    // 10. Create bonus definitions
    console.log('\nSeeding bonus definitions...');
    const bonuses = [
      { name: 'pole', points: 2, description: 'Pole Position' },
      { name: 'fastest_lap', points: 1, description: 'Fastest Lap' },
      { name: 'most_laps_led', points: 2, description: 'Most Laps Led' },
      { name: 'lowest_incidents', points: 2, description: 'Lowest Incidents' },
      { name: 'clean_race', points: 1, description: 'Clean Race (0 incidents)' },
    ];
    const { error: bonusError } = await supabase
      .from('bonus_definitions')
      .insert(
        bonuses.map(b => ({
          season_id: seasonId,
          bonus_type: b.name,
          points: b.points,
          description: b.description,
        }))
      );
    if (bonusError) throw bonusError;
    console.log(`  ✓ ${bonuses.length} bonus definitions created`);

    // 11. Create incident penalty thresholds
    console.log('\nSeeding incident penalty thresholds...');
    const penalties = [
      { min_incidents: 5, max_incidents: 8, penalty_per_incident: 1, description: '5-8 incidents: -1 per incident over 4' },
      { min_incidents: 9, max_incidents: 12, penalty_per_incident: 2, description: '9-12 incidents: -2 per incident over 8' },
      { min_incidents: 13, max_incidents: null, penalty_per_incident: 3, description: '13+ incidents: -3 per incident over 12' },
    ];
    const { error: penaltyError } = await supabase
      .from('incident_penalties')
      .insert(
        penalties.map(p => ({
          season_id: seasonId,
          min_incidents: p.min_incidents,
          max_incidents: p.max_incidents,
          penalty_per_incident: p.penalty_per_incident,
          description: p.description,
        }))
      );
    if (penaltyError) throw penaltyError;
    console.log(`  ✓ ${penalties.length} incident penalty thresholds created`);

    console.log('\n✅ Migration complete!');
    console.log('\nSummary:');
    console.log(`  - ${drivers.length} drivers seeded`);
    console.log(`  - ${teams.length} teams created`);
    console.log(`  - 1 season (2026 Lone Star Rubbin') with 3 stages`);
    console.log(`  - ${stage1Races.length} existing races + ${12 - stage1Races.length} scheduled races in Stage 1`);
    console.log(`  - 24 scheduled races for Stages 2 and 3`);
    console.log(`\nNext step: Upload race results via the admin panel CSV upload`);

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
