/**
 * Story Generator — builds ESPN-style articles from interview answers + race data.
 *
 * Generates two types:
 *   1. Pre-Race Preview: combines pre-race interview answers with standings context
 *   2. Post-Race Recap: combines post-race interview answers with actual race results
 */

// ── Helpers ──

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function driverDisplay(driver) {
  // Use nickname if available, otherwise first name
  if (driver.nickname) return driver.nickname;
  return driver.name.split(' ')[0];
}

function driverFull(driver) {
  return `#${driver.car_number} ${driver.name}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Lede templates for pre-race previews
const PRE_RACE_LEDES = [
  (track, raceNum) =>
    `The Lone Star Rubbin' League heads to ${track} for Race ${raceNum}, and the drivers have plenty to say heading into what promises to be a pivotal night of racing.`,
  (track, raceNum) =>
    `${track} awaits. Race ${raceNum} is on the horizon and tension is building across the Lone Star Rubbin' League garage. We caught up with the drivers to get their takes heading into race night.`,
  (track, raceNum) =>
    `With ${track} on deck for Race ${raceNum}, the Lone Star Rubbin' League paddock is buzzing. Rivalries are simmering, momentum is shifting, and the drivers are ready to talk.`,
];

// Transition phrases between driver quotes
const TRANSITIONS = [
  'Meanwhile,',
  'On the other side of the garage,',
  'Over in the',
  'Looking further down the standings,',
  'Adding to the drama,',
  'Not to be outdone,',
  'Elsewhere in the paddock,',
];

// Closing templates
const PRE_RACE_CLOSINGS = [
  (track) =>
    `The green flag drops at ${track} tonight. With this much confidence — and this many scores to settle — it's anyone's race.`,
  (track) =>
    `When the lights go green at ${track}, all the talk stops and the racing begins. One thing's for sure: nobody's backing down.`,
  (track) =>
    `${track} has a way of rewriting the script. With this field, expect the unexpected.`,
];

// Post-race lede templates
const POST_RACE_LEDES = [
  (track, raceNum, winnerName) =>
    `The dust has settled at ${track} after Race ${raceNum}, and ${winnerName} is the one celebrating. Here's what the drivers had to say after an eventful night.`,
  (track, raceNum, winnerName) =>
    `Race ${raceNum} at ${track} is in the books. ${winnerName} took the checkered flag, but there are stories up and down the field tonight.`,
  (track, raceNum, winnerName) =>
    `${track} delivered. Race ${raceNum} had everything — drama, contact, and a finish that's going to be talked about all week. The drivers opened up about their nights.`,
];

const POST_RACE_CLOSINGS = [
  (nextTrack) =>
    nextTrack
      ? `The league heads to ${nextTrack} next, where the storylines from tonight will only get louder.`
      : `Another chapter written. The season rolls on.`,
  (nextTrack) =>
    nextTrack
      ? `Up next: ${nextTrack}. If tonight is any indication, the rest of this season is going to be something special.`
      : `The points picture shifts again. This season is far from over.`,
];

// ── Pre-Race Preview Generator ──

export function generatePreRacePreview({ track, raceNumber, interviews, standings }) {
  // interviews: array of { driver: { name, car_number, nickname }, question_text, answer_text }
  // standings: array of { name, car_number, nickname, season_points, wins, best_finish, position }

  const answered = interviews.filter((q) => q.answer_text);
  if (answered.length === 0) return null;

  // Build standings lookup
  const standingsMap = {};
  standings.forEach((s, i) => {
    standingsMap[s.car_number] = { ...s, position: i + 1 };
  });

  // Pick a random lede
  const lede = PRE_RACE_LEDES[Math.floor(Math.random() * PRE_RACE_LEDES.length)](track, raceNumber);

  // Build standings context paragraph
  const leader = standings[0];
  const second = standings[1];
  const gap = leader ? leader.season_points - (second?.season_points || 0) : 0;
  let standingsContext = '';
  if (leader && second) {
    standingsContext = `Heading into ${track}, ${driverFull(leader)} leads the standings with ${leader.season_points} points`;
    if (leader.wins > 0) standingsContext += ` and ${leader.wins} win${leader.wins > 1 ? 's' : ''}`;
    standingsContext += `. ${driverFull(second)} sits just ${gap} point${gap !== 1 ? 's' : ''} back`;
    if (second.wins > 0) standingsContext += ` with ${second.wins} win${second.wins > 1 ? 's' : ''} of their own`;
    standingsContext += `. The battle at the top is heating up.`;
  }

  // Build quote sections — shuffle for variety
  const shuffled = shuffle(answered);
  const transitions = shuffle(TRANSITIONS);
  const quoteSections = [];

  shuffled.forEach((q, i) => {
    const driver = q.driver;
    const standing = standingsMap[driver.car_number];
    const pos = standing ? ordinal(standing.position) : null;

    let intro = '';
    if (i === 0) {
      // First driver — no transition needed
      intro = `${driverFull(driver)}`;
      if (pos) intro += `, currently ${pos} in points,`;
      intro += ` was asked: "${q.question_text}"`;
    } else {
      const transition = transitions[i % transitions.length];
      intro = `${transition} ${driverFull(driver)}`;
      if (pos && i <= 3) intro += ` (${pos} in points)`;
      intro += ` had this to say when asked "${q.question_text.toLowerCase().replace(/\?$/, '')}":`;
    }

    quoteSections.push(`${intro}\n\n"${q.answer_text}" — ${driver.nickname || driver.name}`);
  });

  // Pick closing
  const closing = PRE_RACE_CLOSINGS[Math.floor(Math.random() * PRE_RACE_CLOSINGS.length)](track);

  // Assemble article
  const body = [lede, '', standingsContext, '', ...quoteSections.join('\n\n').split('\n'), '', closing].join('\n');

  // Generate title
  const titleOptions = [
    `${track} Preview: Drivers Sound Off Ahead of Race ${raceNumber}`,
    `"No One's Backing Down" — Lone Star Rubbin' League ${track} Preview`,
    `Race ${raceNumber} Preview: The Drivers Talk ${track}`,
    `Heading to ${track}: ${answered.length} Drivers, ${answered.length} Agendas`,
    `${track} Media Day: Confidence, Rivalries, and Unfinished Business`,
  ];
  const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];

  const subtitle = `${answered.length} drivers weigh in ahead of Race ${raceNumber} at ${track}`;

  return { title, subtitle, body, category: 'news' };
}

// ── Post-Race Recap Generator ──

export function generatePostRaceRecap({ track, raceNumber, interviews, standings, raceResults, nextTrack }) {
  // raceResults: array of { name, car_number, nickname, finish_position, start_position, incidents, laps_led, total_points }
  // interviews: array of answered post-race interviews

  const answered = interviews.filter((q) => q.answer_text);
  if (answered.length === 0) return null;

  // Find winner from race results
  const winner = raceResults?.find((r) => r.finish_position === 1);
  const winnerName = winner ? driverFull(winner) : 'the field';

  const lede = POST_RACE_LEDES[Math.floor(Math.random() * POST_RACE_LEDES.length)](track, raceNumber, winnerName);

  // Results context — top 5 rundown
  let resultsContext = '';
  if (raceResults && raceResults.length > 0) {
    const top5 = raceResults.slice(0, 5);
    const rundown = top5.map((r) => `${ordinal(r.finish_position)} ${driverFull(r)}`).join(', ');
    resultsContext = `The finishing order: ${rundown}.`;

    // Add notable stats
    const mostLapsLed = raceResults.reduce((best, r) => (r.laps_led > (best?.laps_led || 0) ? r : best), null);
    if (mostLapsLed && mostLapsLed.laps_led > 0) {
      resultsContext += ` ${driverFull(mostLapsLed)} led the most laps with ${mostLapsLed.laps_led}.`;
    }

    const highIncidents = raceResults.filter((r) => r.incidents >= 20);
    if (highIncidents.length > 0) {
      const names = highIncidents.map((r) => driverDisplay(r)).join(' and ');
      resultsContext += ` It was a rough night for ${names} on the incident front.`;
    }
  }

  // Build quote sections — order by finish position for narrative flow
  const sortedAnswered = [...answered].sort((a, b) => {
    const aResult = raceResults?.find((r) => r.car_number === a.driver.car_number);
    const bResult = raceResults?.find((r) => r.car_number === b.driver.car_number);
    return (aResult?.finish_position || 99) - (bResult?.finish_position || 99);
  });

  const quoteSections = [];
  sortedAnswered.forEach((q, i) => {
    const driver = q.driver;
    const result = raceResults?.find((r) => r.car_number === driver.car_number);

    let intro = '';
    if (result) {
      const pos = ordinal(result.finish_position);
      const started = ordinal(result.start_position);
      if (result.finish_position === 1) {
        intro = `Race winner ${driverFull(driver)}`;
        if (result.laps_led > 0) intro += `, who led ${result.laps_led} laps,`;
        intro += ` was all smiles:`;
      } else if (result.finish_position <= 3) {
        intro = `${driverFull(driver)}, who finished a solid ${pos} after starting ${started}:`;
      } else if (result.finish_position < result.start_position) {
        intro = `${driverFull(driver)} fell from ${started} to ${pos} and wasn't hiding their frustration:`;
      } else if (result.finish_position > result.start_position + 3) {
        intro = `${driverFull(driver)} charged from ${started} to ${pos} and was feeling good about it:`;
      } else {
        intro = `${driverFull(driver)}, who finished ${pos}:`;
      }
    } else {
      intro = `${driverFull(driver)} reflected on their race:`;
    }

    quoteSections.push(`${intro}\n\n"${q.answer_text}" — ${driver.nickname || driver.name}`);
  });

  // Standings shift
  let standingsShift = '';
  if (standings && standings.length >= 2) {
    const leader = standings[0];
    const second = standings[1];
    const gap = leader.season_points - second.season_points;
    standingsShift = `After tonight, ${driverFull(leader)} leads the championship with ${leader.season_points} points, ${gap} ahead of ${driverFull(second)}.`;
  }

  const closing = POST_RACE_CLOSINGS[Math.floor(Math.random() * POST_RACE_CLOSINGS.length)](nextTrack);

  const body = [
    lede,
    '',
    resultsContext,
    '',
    ...quoteSections.join('\n\n').split('\n'),
    '',
    standingsShift,
    '',
    closing,
  ].join('\n');

  const titleOptions = [
    `${track} Recap: Drivers React After Race ${raceNumber}`,
    `"${answered[0]?.answer_text?.split('.')[0] || 'What a Night'}" — ${track} Post-Race`,
    `Race ${raceNumber} Reactions: The ${track} Breakdown`,
    `After ${track}: ${winner ? `${driverDisplay(winner)} Wins, ` : ''}Drivers Sound Off`,
  ];
  const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
  const subtitle = `Post-race interviews and analysis from Race ${raceNumber} at ${track}`;

  return { title, subtitle, body, category: 'recap' };
}
