/**
 * Story Generator — builds ESPN-style articles from interview answers + race data.
 *
 * Generates two types:
 *   1. Pre-Race Preview: combines pre-race interview answers with standings context
 *   2. Post-Race Recap: combines post-race interview answers with actual race results
 *
 * Standings use drop-adjusted points (worst 3 races dropped per stage).
 */

const DROPS_ALLOWED = 3;

// ── Helpers ──

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function driverDisplay(driver) {
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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pull a punchy snippet from a driver's answer — first sentence or first ~120 chars.
 */
function pullQuote(answer) {
  const firstSentence = answer.split(/(?<=[.!?])\s+/)[0];
  if (firstSentence.length <= 120) return firstSentence;
  return firstSentence.slice(0, 117).replace(/\s+\S*$/, '') + '...';
}

/**
 * Build drop-adjusted standings from raw race_results rows.
 * Each driver's worst N races (by total_points) are dropped.
 */
function buildStandingsWithDrops(results) {
  const driverTotals = {};

  results.forEach((r) => {
    const key = r.driver_id;
    if (!driverTotals[key]) {
      driverTotals[key] = {
        name: r.drivers?.name,
        car_number: r.drivers?.car_number,
        nickname: r.drivers?.nickname,
        racePoints: [],
        wins: 0,
        best_finish: 99,
        races_run: 0,
      };
    }
    driverTotals[key].racePoints.push(r.total_points || 0);
    driverTotals[key].races_run += 1;
    if (r.finish_position === 1) driverTotals[key].wins += 1;
    if (r.finish_position < driverTotals[key].best_finish) {
      driverTotals[key].best_finish = r.finish_position;
    }
  });

  return Object.values(driverTotals)
    .map((d) => {
      // Sort points ascending, drop worst N
      const sorted = [...d.racePoints].sort((a, b) => a - b);
      const kept = sorted.slice(Math.min(DROPS_ALLOWED, Math.max(0, sorted.length - 1)));
      const season_points = kept.reduce((s, p) => s + p, 0);
      const raw_points = sorted.reduce((s, p) => s + p, 0);
      return { ...d, season_points, raw_points };
    })
    .sort((a, b) => b.season_points - a.season_points);
}

// ── Lede templates ──

const PRE_RACE_LEDES = [
  (track, raceNum) =>
    `The Lone Star Rubbin' League heads to ${track} for Race ${raceNum}, and if the pre-race chatter is any indication, somebody's getting their feathers ruffled tonight.`,
  (track, raceNum) =>
    `${track} is up next, and the drivers aren't holding back. Race ${raceNum} hasn't even started and the trash talk is already flying across the Lone Star Rubbin' League garage.`,
  (track, raceNum) =>
    `The gloves are off heading into Race ${raceNum} at ${track}. We caught up with the Lone Star Rubbin' League drivers, and let's just say — nobody's here to make friends this week.`,
  (track, raceNum) =>
    `Race ${raceNum} at ${track} is shaping up to be a war. The drivers had plenty to say in media availability, and the tension is real.`,
];

const PRE_RACE_CLOSINGS = [
  (track) =>
    `The green flag drops at ${track} tonight. With this much confidence — and this many scores to settle — buckle up.`,
  (track) =>
    `When the lights go green at ${track}, all the talk stops and the bumpers start talking. One thing's clear: nobody's backing down.`,
  (track) =>
    `${track} has a way of exposing who's real and who's just talking. Tonight, we find out.`,
  (track) =>
    `Bold words from the garage. But ${track} doesn't care about predictions — it just takes. The green flag will sort the pretenders from the contenders.`,
];

const POST_RACE_LEDES = [
  (track, raceNum, winnerName) =>
    `${track} just served up another classic, and ${winnerName} walked away with the hardware. But the real story might be what happened behind the leader. The Lone Star Rubbin' League paddock was buzzing after Race ${raceNum}.`,
  (track, raceNum, winnerName) =>
    `The checkered flag has fallen at ${track}, and Race ${raceNum} delivered everything — contact, controversy, and ${winnerName} standing in victory lane. Here's what the drivers had to say.`,
  (track, raceNum, winnerName) =>
    `Race ${raceNum} at ${track} is in the books and it left a mark — on the sheet metal and the standings. ${winnerName} took the win, but the fallout is just getting started.`,
  (track, raceNum, winnerName) =>
    `Another week, another war. ${track} chewed up the field in Race ${raceNum}, and when the dust settled, it was ${winnerName} celebrating. The rest of the garage? Not so happy.`,
];

const POST_RACE_CLOSINGS = [
  (nextTrack) =>
    nextTrack
      ? `The league heads to ${nextTrack} next, where tonight's grudges will be fresh and the payback will be loaded. This is far from over.`
      : `Another chapter written in blood and sheet metal. The season rolls on.`,
  (nextTrack) =>
    nextTrack
      ? `Up next: ${nextTrack}. If tonight is any indication, somebody's bringing a receipt and a vendetta.`
      : `The points picture shifts again. One thing's for certain — this league doesn't do boring.`,
  (nextTrack) =>
    nextTrack
      ? `${nextTrack} is next on the calendar. After tonight, expect short memories and long bumpers.`
      : `The standings tighten, the tempers flare, and the season marches on. Stay tuned.`,
];

// Narrative intros for weaving quotes into prose
const CONFIDENCE_INTROS = [
  (name) => `${name} isn't lacking confidence`,
  (name) => `${name} came in hot with the bulletin board material`,
  (name) => `Don't tell ${name} they can't win this thing`,
  (name) => `${name} is feeling dangerous`,
];

const RIVALRY_INTROS = [
  (name) => `Meanwhile, ${name} seems to have a chip on their shoulder`,
  (name) => `${name} is clearly not over last week`,
  (name) => `There's an edge to ${name}'s words this week`,
  (name) => `${name} had something to get off their chest`,
];

const NEUTRAL_INTROS = [
  (name) => `${name} is taking a measured approach`,
  (name) => `${name} kept it real when asked about their mindset`,
  (name) => `Over in the ${name} camp, the tone was more calculated`,
  (name) => `${name} is playing the long game`,
];

const WINNER_INTROS = [
  (name) => `Race winner ${name} was all smiles afterward`,
  (name) => `${name} earned the right to gloat, and didn't hold back`,
  (name) => `It was ${name}'s night, and they knew it`,
  (name) => `Standing in victory lane, ${name} let it sink in`,
];

const FRUSTRATION_INTROS = [
  (name) => `It was a different mood for ${name}`,
  (name) => `${name} wasn't sugarcoating anything`,
  (name) => `You could hear the frustration in ${name}'s voice`,
  (name) => `${name} is ready to forget this one and move on`,
];

const CHARGE_INTROS = [
  (name) => `${name} might not have won, but they drove like they wanted to`,
  (name) => `${name} quietly put together one of the best drives of the night`,
  (name) => `Don't sleep on ${name} — they're coming`,
  (name) => `${name} carved through the field and has every reason to feel good`,
];


// ── Pre-Race Preview Generator ──

export function generatePreRacePreview({ track, raceNumber, interviews, standings }) {
  const answered = interviews.filter((q) => q.answer_text);
  if (answered.length === 0) return null;

  // Build standings lookup
  const standingsMap = {};
  standings.forEach((s, i) => {
    standingsMap[s.car_number] = { ...s, position: i + 1 };
  });

  const lede = pickRandom(PRE_RACE_LEDES)(track, raceNumber);

  // Standings context paragraph — with drop-adjusted points
  const leader = standings[0];
  const second = standings[1];
  const third = standings[2];
  const gap = leader ? leader.season_points - (second?.season_points || 0) : 0;

  let standingsContext = '';
  if (leader && second) {
    standingsContext = `The championship picture heading into ${track}: ${driverFull(leader)} sits on top with ${leader.season_points} points`;
    if (leader.wins > 0) standingsContext += ` and ${leader.wins} win${leader.wins > 1 ? 's' : ''}`;
    standingsContext += `. ${driverFull(second)} is ${gap === 0 ? 'tied' : `${gap} point${gap !== 1 ? 's' : ''} back`}`;
    if (second.wins > 0) standingsContext += ` with ${second.wins} win${second.wins > 1 ? 's' : ''} of their own`;
    standingsContext += `.`;
    if (third) {
      const gap3 = leader.season_points - third.season_points;
      standingsContext += ` ${driverFull(third)} lurks ${gap3} points off the lead — close enough to strike.`;
    }
    standingsContext += ` With ${DROPS_ALLOWED} drop weeks in play, the math gets interesting for everyone.`;
  }

  // Build narrative sections with woven quotes
  const shuffled = shuffle(answered);
  const introSets = [CONFIDENCE_INTROS, RIVALRY_INTROS, NEUTRAL_INTROS];
  const sections = [];

  shuffled.forEach((q, i) => {
    const driver = q.driver;
    const standing = standingsMap[driver.car_number];
    const pos = standing ? ordinal(standing.position) : null;
    const displayName = driverFull(driver);
    const snippet = pullQuote(q.answer_text);

    // Rotate through intro styles for variety
    const introSet = introSets[i % introSets.length];
    const introFn = pickRandom(introSet);

    let paragraph = '';

    if (i === 0) {
      // Lead driver quote — set the tone
      paragraph = `${introFn(displayName)}.`;
      if (pos) paragraph += ` Sitting ${pos} in the standings,`;
      paragraph += ` they were asked about ${track} and didn't mince words: "${snippet}"`;
      if (q.answer_text.length > snippet.length) {
        paragraph += `\n\nThe full quote from ${driverDisplay(driver)}: "${q.answer_text}"`;
      }
    } else if (i === shuffled.length - 1 && shuffled.length > 2) {
      // Last driver — dramatic closer before the sign-off
      paragraph = `And then there's ${displayName}.`;
      if (pos) paragraph += ` ${pos} in points and`;
      paragraph += ` clearly not content with where they are: "${q.answer_text}"`;
    } else {
      paragraph = `${introFn(displayName)}.`;
      if (pos && i <= 3) paragraph += ` Currently ${pos} in the championship,`;
      paragraph += ` "${snippet}"`;
      // Weave in more of the answer if it's juicy
      if (q.answer_text.length > 100) {
        paragraph += `\n\n${driverDisplay(driver)} went on: "${q.answer_text}"`;
      } else if (q.answer_text !== snippet) {
        paragraph += `\n\nFull quote: "${q.answer_text}" — ${driverDisplay(driver)}`;
      }
    }

    sections.push(paragraph);
  });

  const closing = pickRandom(PRE_RACE_CLOSINGS)(track);

  // Assemble article
  const body = [lede, '', standingsContext, '', sections.join('\n\n'), '', closing].join('\n');

  const titleOptions = [
    `${track} Preview: "Nobody's Here to Make Friends"`,
    `Lone Star Rubbin' League ${track} Preview: Drivers Sound Off Before Race ${raceNumber}`,
    `Race ${raceNumber} Preview: ${track} Is About to Get Loud`,
    `"Watch Your Mirrors" — ${answered.length} Drivers Talk ${track}`,
    `${track} Media Day: Confidence, Trash Talk, and Unfinished Business`,
    `Pre-Race Breakdown: Who's Hunting and Who's Running at ${track}`,
  ];
  const title = pickRandom(titleOptions);
  const subtitle = `${answered.length} drivers weigh in ahead of Race ${raceNumber} at ${track}`;

  return { title, subtitle, body, category: 'news' };
}


// ── Post-Race Recap Generator ──

export function generatePostRaceRecap({ track, raceNumber, interviews, standings, raceResults, nextTrack }) {
  const answered = interviews.filter((q) => q.answer_text);
  if (answered.length === 0) return null;

  // Find winner
  const winner = raceResults?.find((r) => r.finish_position === 1);
  const winnerName = winner ? driverFull(winner) : 'the field';

  const lede = pickRandom(POST_RACE_LEDES)(track, raceNumber, winnerName);

  // Results context — top 5 + notable stats
  let resultsContext = '';
  if (raceResults && raceResults.length > 0) {
    const top5 = raceResults.slice(0, 5);
    const rundown = top5.map((r) => `${ordinal(r.finish_position)} ${driverFull(r)}`).join(', ');
    resultsContext = `Official finishing order up front: ${rundown}.`;

    // Most laps led
    const mostLapsLed = raceResults.reduce((best, r) => (r.laps_led > (best?.laps_led || 0) ? r : best), null);
    if (mostLapsLed && mostLapsLed.laps_led > 0) {
      if (mostLapsLed.finish_position === 1) {
        resultsContext += ` ${driverFull(mostLapsLed)} led ${mostLapsLed.laps_led} laps and was never seriously challenged.`;
      } else {
        resultsContext += ` ${driverFull(mostLapsLed)} led the most laps with ${mostLapsLed.laps_led} but couldn't close the deal — that's going to sting.`;
      }
    }

    // Biggest mover
    const biggestGainer = raceResults.reduce((best, r) => {
      const gained = (r.start_position || 99) - r.finish_position;
      return gained > ((best?.start_position || 99) - (best?.finish_position || 0)) ? r : best;
    }, null);
    if (biggestGainer) {
      const gained = (biggestGainer.start_position || 0) - biggestGainer.finish_position;
      if (gained >= 5) {
        resultsContext += ` ${driverFull(biggestGainer)} was the hard charger of the night, ripping from ${ordinal(biggestGainer.start_position)} to ${ordinal(biggestGainer.finish_position)}.`;
      }
    }

    // High incidents
    const highIncidents = raceResults.filter((r) => r.incidents >= 20);
    if (highIncidents.length > 0) {
      const names = highIncidents.map((r) => driverDisplay(r)).join(' and ');
      resultsContext += ` It was a rough night on the incident front for ${names}.`;
    }
  }

  // Build narrative quote sections — ordered by finish for story flow
  const sortedAnswered = [...answered].sort((a, b) => {
    const aResult = raceResults?.find((r) => r.car_number === a.driver.car_number);
    const bResult = raceResults?.find((r) => r.car_number === b.driver.car_number);
    return (aResult?.finish_position || 99) - (bResult?.finish_position || 99);
  });

  const sections = [];
  sortedAnswered.forEach((q, i) => {
    const driver = q.driver;
    const result = raceResults?.find((r) => r.car_number === driver.car_number);
    const displayName = driverFull(driver);
    const snippet = pullQuote(q.answer_text);

    let paragraph = '';

    if (result) {
      const pos = ordinal(result.finish_position);
      const started = ordinal(result.start_position);
      const gained = (result.start_position || 0) - result.finish_position;

      if (result.finish_position === 1) {
        // Winner
        const intro = pickRandom(WINNER_INTROS)(displayName);
        paragraph = `${intro}.`;
        if (result.laps_led > 0) paragraph += ` After leading ${result.laps_led} laps,`;
        paragraph += ` "${q.answer_text}"`;
      } else if (result.finish_position <= 3) {
        // Podium
        paragraph = `${displayName} brought it home ${pos} after starting ${started} — a solid run.`;
        paragraph += ` "${snippet}"`;
        if (q.answer_text.length > snippet.length) {
          paragraph += `\n\n${driverDisplay(driver)} continued: "${q.answer_text}"`;
        }
      } else if (gained >= 5) {
        // Big charge
        const intro = pickRandom(CHARGE_INTROS)(displayName);
        paragraph = `${intro}. From ${started} to ${pos} is no joke. "${q.answer_text}"`;
      } else if (result.finish_position > result.start_position + 3) {
        // Lost spots
        const intro = pickRandom(FRUSTRATION_INTROS)(displayName);
        paragraph = `${intro}. Started ${started}, finished ${pos}. "${snippet}"`;
        if (q.answer_text !== snippet) {
          paragraph += `\n\nThe full take from ${driverDisplay(driver)}: "${q.answer_text}"`;
        }
      } else if (result.incidents >= 20) {
        // Rough night
        paragraph = `${displayName} had one of the rougher nights — ${pos} with ${result.incidents} incidents.`;
        paragraph += ` "${q.answer_text}"`;
      } else {
        // Mid-pack
        paragraph = `${displayName} came home ${pos}. Not the headline, but still part of the story.`;
        paragraph += ` "${snippet}"`;
        if (q.answer_text.length > 80 && q.answer_text !== snippet) {
          paragraph += `\n\n"${q.answer_text}" — ${driverDisplay(driver)}`;
        }
      }
    } else {
      paragraph = `${displayName} reflected on their race: "${q.answer_text}"`;
    }

    sections.push(paragraph);
  });

  // Standings shift — using drop-adjusted points
  let standingsShift = '';
  if (standings && standings.length >= 2) {
    const leader = standings[0];
    const second = standings[1];
    const gap = leader.season_points - second.season_points;
    standingsShift = `After tonight, ${driverFull(leader)} leads the championship with ${leader.season_points} points`;
    if (gap === 0) {
      standingsShift += `, tied with ${driverFull(second)} at the top. This is anyone's title.`;
    } else {
      standingsShift += `, ${gap} ahead of ${driverFull(second)}.`;
    }
    if (standings[2]) {
      const gap3 = leader.season_points - standings[2].season_points;
      standingsShift += ` ${driverFull(standings[2])} is ${gap3} back and still very much in the hunt.`;
    }
    standingsShift += ` Remember: ${DROPS_ALLOWED} drop weeks make this a marathon, not a sprint.`;
  }

  const closing = pickRandom(POST_RACE_CLOSINGS)(nextTrack);

  const body = [
    lede,
    '',
    resultsContext,
    '',
    sections.join('\n\n'),
    '',
    standingsShift,
    '',
    closing,
  ].join('\n');

  // Pick a dramatic title — sometimes pull from an actual quote
  const firstSnippet = answered[0]?.answer_text?.split(/[.!?]/)[0];
  const titleOptions = [
    `${track} Recap: Tempers, Trophies, and Consequences`,
    firstSnippet ? `"${firstSnippet}" — ${track} Post-Race Fallout` : `Race ${raceNumber} Fallout: ${track} Leaves Its Mark`,
    `Race ${raceNumber} Recap: ${winner ? `${driverDisplay(winner)} Wins, ` : ''}Garage Sounds Off`,
    `${track} Race Report: Who's Up, Who's Down, Who's Mad`,
    `After ${track}: The Winners, The Wrecked, and The Words`,
  ];
  const title = pickRandom(titleOptions);
  const subtitle = `Post-race reactions and analysis from Race ${raceNumber} at ${track}`;

  return { title, subtitle, body, category: 'recap' };
}
