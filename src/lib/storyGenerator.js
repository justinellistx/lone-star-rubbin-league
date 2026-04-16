/**
 * Story Generator — builds ESPN-style articles from interview answers + race data.
 *
 * Pulls from ALL site data:
 *   - Driver interviews (pre-race + post-race answers)
 *   - Drop-adjusted standings (worst 3 dropped per stage)
 *   - Pick'em predictions (who the fans picked to win/podium)
 *   - Power rankings context (form, trends, streaks)
 *   - Full race results (positions, incidents, laps led, biggest movers)
 *
 * Two article types:
 *   1. Pre-Race Preview: hype article with predictions, standings battles, driver quotes
 *   2. Post-Race Recap: results-driven narrative with reactions, Pick'em accuracy, standings shifts
 */

const DROPS_ALLOWED = 3;

// ── Helpers ──

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function driverDisplay(driver) {
  if (driver.nickname) return `"${driver.nickname}"`;
  return driver.name?.split(' ')[0] || 'Unknown';
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

/** Pull a punchy snippet — first sentence or ~120 chars */
function pullQuote(answer) {
  if (!answer) return '';
  const firstSentence = answer.split(/(?<=[.!?])\s+/)[0];
  if (firstSentence.length <= 120) return firstSentence;
  return firstSentence.slice(0, 117).replace(/\s+\S*$/, '') + '...';
}

// ── Pick'em Analysis ──

function analyzePickem(picks, drivers) {
  if (!picks || picks.length === 0) return null;

  // Count how many times each driver was picked for P1
  const winPicks = {};
  // Count how many times each driver appears in any top-5 pick
  const top5Picks = {};

  picks.forEach((p) => {
    const driverName = drivers?.[p.picked_driver_id];
    if (!driverName) return;

    if (p.pick_position === 1) {
      winPicks[driverName] = (winPicks[driverName] || 0) + 1;
    }
    top5Picks[driverName] = (top5Picks[driverName] || 0) + 1;
  });

  const totalPickers = new Set(picks.map((p) => p.picker_id)).size;

  // Sort by most picked to win
  const winFavorites = Object.entries(winPicks)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: Math.round((count / totalPickers) * 100) }));

  // Most picked overall (top-5 appearances)
  const fanFavorites = Object.entries(top5Picks)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Who got ZERO picks
  const pickedDriverIds = new Set(picks.map((p) => p.picked_driver_id));
  const snubbed = Object.entries(drivers)
    .filter(([id]) => !pickedDriverIds.has(id))
    .map(([, name]) => name);

  return { winFavorites, fanFavorites, totalPickers, snubbed };
}

// ── Power Rankings / Form Analysis ──

function analyzeDriverForm(allResults, driverId) {
  const races = allResults
    .filter((r) => r.driver_id === driverId)
    .sort((a, b) => a.races.race_number - b.races.race_number);

  if (races.length === 0) return null;

  const last3 = races.slice(-3);
  const last3Avg = last3.length > 0
    ? last3.reduce((s, r) => s + r.finish_position, 0) / last3.length
    : null;
  const last3Pts = last3.reduce((s, r) => s + (r.total_points || 0), 0);

  // Form label
  let form;
  if (last3.length < 2) form = 'unknown';
  else if (last3Avg <= 5) form = 'on_fire';
  else if (last3Avg <= 10) form = 'strong';
  else if (last3Avg <= 18) form = 'steady';
  else form = 'struggling';

  // Trend: first half vs second half
  let trend = 'steady';
  if (races.length >= 4) {
    const mid = Math.floor(races.length / 2);
    const firstAvg = races.slice(0, mid).reduce((s, r) => s + r.finish_position, 0) / mid;
    const secondAvg = races.slice(mid).reduce((s, r) => s + r.finish_position, 0) / (races.length - mid);
    const diff = firstAvg - secondAvg;
    if (diff > 5) trend = 'surging';
    else if (diff > 2) trend = 'trending_up';
    else if (diff < -5) trend = 'falling';
    else if (diff < -2) trend = 'trending_down';
  }

  // Streak
  let streak = 0;
  let streakType = null;
  for (let i = races.length - 1; i >= 0; i--) {
    const isTop5 = races[i].finish_position <= 5;
    if (streakType === null) streakType = isTop5 ? 'top5' : null;
    if (isTop5 && streakType === 'top5') streak++;
    else break;
  }

  const lastRace = races[races.length - 1];

  return {
    form,
    trend,
    last3Avg: last3Avg ? parseFloat(last3Avg.toFixed(1)) : null,
    last3Pts,
    streak: streakType === 'top5' ? streak : 0,
    totalRaces: races.length,
    lastFinish: lastRace?.finish_position,
    lastTrack: lastRace?.races?.track_name,
  };
}

// ── Lede Templates ──

const PRE_RACE_LEDES = [
  (track, raceNum) =>
    `The Lone Star Rubbin' League heads to ${track} for Race ${raceNum}, and if the pre-race chatter is any indication, somebody's getting their feathers ruffled tonight.`,
  (track, raceNum) =>
    `${track} is up next, and the drivers aren't holding back. Race ${raceNum} hasn't even started and the trash talk is already flying across the garage.`,
  (track, raceNum) =>
    `The gloves are off heading into Race ${raceNum} at ${track}. Nobody's here to make friends this week.`,
  (track, raceNum) =>
    `Race ${raceNum} at ${track} is shaping up to be a war. The drivers had plenty to say, and the tension is real.`,
];

const PRE_RACE_CLOSINGS = [
  (track) =>
    `The green flag drops at ${track} tonight. With this much confidence — and this many scores to settle — buckle up.`,
  (track) =>
    `When the lights go green at ${track}, all the talk stops and the bumpers do the talking. Nobody's backing down.`,
  (track) =>
    `${track} has a way of exposing who's real and who's just talking. Tonight, we find out.`,
  (track) =>
    `Bold words from the garage. But ${track} doesn't care about predictions — it just takes. The green flag will sort the pretenders from the contenders.`,
];

const POST_RACE_LEDES = [
  (track, raceNum, winnerName) =>
    `${track} just served up another classic, and ${winnerName} walked away with the hardware. But the real story might be what happened behind the leader.`,
  (track, raceNum, winnerName) =>
    `The checkered flag has fallen at ${track}, and Race ${raceNum} delivered everything — contact, controversy, and ${winnerName} standing in victory lane.`,
  (track, raceNum, winnerName) =>
    `Race ${raceNum} at ${track} is in the books and it left a mark — on the sheet metal and the standings. ${winnerName} took the win, but the fallout is just getting started.`,
  (track, raceNum, winnerName) =>
    `Another week, another war. ${track} chewed up the field in Race ${raceNum}, and when the dust settled, it was ${winnerName} celebrating. The rest? Not so happy.`,
];

const POST_RACE_CLOSINGS = [
  (nextTrack) =>
    nextTrack
      ? `The league heads to ${nextTrack} next, where tonight's grudges will be fresh and the payback loaded. This is far from over.`
      : `Another chapter written in blood and sheet metal. The season rolls on.`,
  (nextTrack) =>
    nextTrack
      ? `Up next: ${nextTrack}. If tonight is any indication, somebody's bringing a receipt and a vendetta.`
      : `The points picture shifts again. One thing's certain — this league doesn't do boring.`,
  (nextTrack) =>
    nextTrack
      ? `${nextTrack} is next on the calendar. After tonight, expect short memories and long bumpers.`
      : `The standings tighten, the tempers flare, and the season marches on. Stay tuned.`,
];

// ── Narrative Intro Templates ──

const CONFIDENCE_INTROS = [
  (name) => `${name} isn't lacking confidence`,
  (name) => `${name} came in hot with the bulletin board material`,
  (name) => `Don't tell ${name} they can't win this thing`,
  (name) => `${name} is feeling dangerous heading into race night`,
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


// ══════════════════════════════════════════════════════════
// ── Pre-Race Preview Generator
// ══════════════════════════════════════════════════════════

export function generatePreRacePreview({
  track,
  raceNumber,
  interviews,
  standings,
  pickem = null,       // { winFavorites, fanFavorites, totalPickers, snubbed }
  driverForms = {},    // { driverId: { form, trend, last3Avg, streak, ... } }
}) {
  const answered = interviews.filter((q) => q.answer_text);
  if (answered.length === 0) return null;

  // Build standings lookup
  const standingsMap = {};
  standings.forEach((s, i) => {
    standingsMap[s.car_number] = { ...s, position: i + 1 };
  });

  const lede = pickRandom(PRE_RACE_LEDES)(track, raceNumber);

  // ── Standings Context ──
  const leader = standings[0];
  const second = standings[1];
  const third = standings[2];
  const gap = leader ? leader.season_points - (second?.season_points || 0) : 0;

  let standingsContext = '';
  if (leader && second) {
    standingsContext = `**The Championship Picture:** ${driverFull(leader)} leads the standings with ${leader.season_points} points`;
    if (leader.wins > 0) standingsContext += ` and ${leader.wins} win${leader.wins > 1 ? 's' : ''}`;
    standingsContext += `. ${driverFull(second)} is ${gap === 0 ? 'tied at the top' : `${gap} point${gap !== 1 ? 's' : ''} back`}`;
    if (second.wins > 0) standingsContext += ` with ${second.wins} win${second.wins > 1 ? 's' : ''} of their own`;
    standingsContext += `.`;
    if (third) {
      const gap3 = leader.season_points - third.season_points;
      standingsContext += ` ${driverFull(third)} lurks just ${gap3} back — close enough to strike.`;
    }
    standingsContext += ` With ${DROPS_ALLOWED} drop weeks in play, the math gets interesting for everyone.`;
  }

  // ── Pick'em Predictions Section ──
  let pickemSection = '';
  if (pickem && pickem.winFavorites.length > 0) {
    const fav = pickem.winFavorites[0];
    pickemSection = `**The Fans Have Spoken:** ${pickem.totalPickers} people submitted their Pick'em predictions for ${track}.`;

    if (fav.pct >= 50) {
      pickemSection += ` ${fav.name} is the overwhelming favorite to win, with ${fav.pct}% of the vote.`;
    } else if (pickem.winFavorites.length >= 2) {
      const second = pickem.winFavorites[1];
      pickemSection += ` ${fav.name} leads the predicted winners (${fav.pct}%), but ${second.name} isn't far behind at ${second.pct}%.`;
      if (pickem.winFavorites.length >= 3) {
        pickemSection += ` ${pickem.winFavorites[2].name} is also getting love.`;
      }
    } else {
      pickemSection += ` ${fav.name} is the fan favorite to take the checkered flag.`;
    }

    // Snubbed drivers — nobody picked them
    if (pickem.snubbed.length > 0 && pickem.snubbed.length <= 3) {
      const snubbedNames = pickem.snubbed.join(' and ');
      pickemSection += ` Notably, ${snubbedNames} didn't appear on a single ballot. Bulletin board material? Maybe.`;
    } else if (pickem.snubbed.length > 3) {
      pickemSection += ` ${pickem.snubbed.length} drivers were completely left off the Pick'em ballots. That's a lot of disrespect floating around the paddock.`;
    }
  }

  // ── Power Rankings / Hot & Cold ──
  let formSection = '';
  const hotDrivers = [];
  const coldDrivers = [];
  const surgingDrivers = [];

  Object.entries(driverForms).forEach(([driverId, form]) => {
    const standing = standings.find((s) => s.id === driverId);
    if (!standing) return;
    const name = `#${standing.car_number} ${standing.name}`;

    if (form.form === 'on_fire') hotDrivers.push({ name, avg: form.last3Avg, streak: form.streak });
    if (form.form === 'struggling') coldDrivers.push({ name, avg: form.last3Avg });
    if (form.trend === 'surging') surgingDrivers.push({ name, trend: form.trend });
  });

  if (hotDrivers.length > 0 || coldDrivers.length > 0) {
    formSection = `**Power Rankings Watch:**`;
    if (hotDrivers.length > 0) {
      const hotNames = hotDrivers.map((d) => {
        let s = d.name;
        if (d.streak >= 3) s += ` (${d.streak}-race top-5 streak)`;
        else s += ` (${d.avg} avg finish, last 3)`;
        return s;
      });
      formSection += ` Running hot: ${hotNames.join(', ')}.`;
    }
    if (coldDrivers.length > 0) {
      const coldNames = coldDrivers.map((d) => `${d.name} (${d.avg} avg finish, last 3)`);
      formSection += ` Struggling: ${coldNames.join(', ')}.`;
    }
    if (surgingDrivers.length > 0) {
      formSection += ` Keep an eye on ${surgingDrivers.map((d) => d.name).join(' and ')} — the power rankings say they're surging.`;
    }
  }

  // ── Driver Quote Sections ──
  const shuffled = shuffle(answered);
  const introSets = [CONFIDENCE_INTROS, RIVALRY_INTROS, NEUTRAL_INTROS];
  const sections = [];

  shuffled.forEach((q, i) => {
    const driver = q.driver;
    const standing = standingsMap[driver.car_number];
    const pos = standing ? ordinal(standing.position) : null;
    const displayName = driverFull(driver);
    const snippet = pullQuote(q.answer_text);
    const driverId = standing?.id;

    // Get this driver's form context
    const form = driverId ? driverForms[driverId] : null;

    // Check if fans picked them
    const pickemMention = pickem?.winFavorites?.find((f) => f.name === driver.name);
    const wasSnubbed = pickem?.snubbed?.includes(driver.name);

    const introSet = introSets[i % introSets.length];
    const introFn = pickRandom(introSet);

    let paragraph = `${introFn(displayName)}.`;

    // Add context: standings position, form, pickem status
    const contextBits = [];
    if (pos) contextBits.push(`${pos} in the standings`);
    if (form?.form === 'on_fire') contextBits.push('riding a hot streak');
    else if (form?.form === 'struggling') contextBits.push('searching for speed lately');
    else if (form?.trend === 'surging') contextBits.push('quietly climbing the power rankings');
    if (form?.streak >= 3) contextBits.push(`${form.streak} straight top-5s`);
    if (pickemMention && pickemMention.pct >= 30) contextBits.push(`the fans' pick to win at ${pickemMention.pct}%`);
    if (wasSnubbed) contextBits.push('completely snubbed in the Pick\'em');

    if (contextBits.length > 0) {
      paragraph += ` ${contextBits.join(', ')}.`;
    }

    // The quote
    paragraph += ` "${snippet}"`;

    // Full answer if there's more to it
    if (q.answer_text.length > snippet.length + 20) {
      paragraph += `\n\n${driverDisplay(driver)} went on: "${q.answer_text}"`;
    } else if (q.answer_text !== snippet) {
      paragraph += `\n\nFull quote: "${q.answer_text}"`;
    }

    sections.push(paragraph);
  });

  const closing = pickRandom(PRE_RACE_CLOSINGS)(track);

  // ── Assemble Article ──
  const bodyParts = [lede, ''];
  if (standingsContext) bodyParts.push(standingsContext, '');
  if (pickemSection) bodyParts.push(pickemSection, '');
  if (formSection) bodyParts.push(formSection, '');
  bodyParts.push(sections.join('\n\n'), '', closing);

  const body = bodyParts.join('\n');

  const titleOptions = [
    `${track} Preview: "Nobody's Here to Make Friends"`,
    `Lone Star Rubbin' League ${track} Preview: Drivers Sound Off Before Race ${raceNumber}`,
    `Race ${raceNumber} Preview: ${track} Is About to Get Loud`,
    `"Watch Your Mirrors" — ${answered.length} Drivers Talk ${track}`,
    `${track} Media Day: Confidence, Trash Talk, and Unfinished Business`,
    pickem?.winFavorites?.[0]
      ? `${track} Preview: Fans Pick ${pickem.winFavorites[0].name} to Win — Do the Drivers Agree?`
      : `Pre-Race Breakdown: Who's Hunting and Who's Running at ${track}`,
  ];
  const title = pickRandom(titleOptions);
  const subtitle = `${answered.length} drivers weigh in ahead of Race ${raceNumber} at ${track} — plus Pick'em predictions and power rankings`;

  return { title, subtitle, body, category: 'news' };
}


// ══════════════════════════════════════════════════════════
// ── Post-Race Recap Generator
// ══════════════════════════════════════════════════════════

export function generatePostRaceRecap({
  track,
  raceNumber,
  interviews,
  standings,
  raceResults,
  nextTrack,
  pickem = null,       // { winFavorites, fanFavorites, totalPickers, snubbed }
  driverForms = {},    // { driverId: { form, trend, last3Avg, streak, ... } }
}) {
  const answered = interviews.filter((q) => q.answer_text);
  if (answered.length === 0) return null;

  // Find winner
  const winner = raceResults?.find((r) => r.finish_position === 1);
  const winnerName = winner ? driverFull(winner) : 'the field';

  const lede = pickRandom(POST_RACE_LEDES)(track, raceNumber, winnerName);

  // ── Results Context ──
  let resultsContext = '';
  if (raceResults && raceResults.length > 0) {
    const top5 = raceResults.slice(0, 5);
    const rundown = top5.map((r) => `${ordinal(r.finish_position)} ${driverFull(r)}`).join(', ');
    resultsContext = `**The Finishing Order:** ${rundown}.`;

    // Most laps led
    const mostLapsLed = raceResults.reduce((best, r) => (r.laps_led > (best?.laps_led || 0) ? r : best), null);
    if (mostLapsLed && mostLapsLed.laps_led > 0) {
      if (mostLapsLed.finish_position === 1) {
        resultsContext += ` ${driverFull(mostLapsLed)} led ${mostLapsLed.laps_led} laps and was never seriously threatened.`;
      } else {
        resultsContext += ` ${driverFull(mostLapsLed)} led the most laps (${mostLapsLed.laps_led}) but couldn't close the deal — that's going to sting.`;
      }
    }

    // Biggest mover
    const biggestGainer = raceResults.reduce((best, r) => {
      const gained = (r.start_position || 99) - r.finish_position;
      const bestGained = (best?.start_position || 99) - (best?.finish_position || 0);
      return gained > bestGained ? r : best;
    }, null);
    if (biggestGainer) {
      const gained = (biggestGainer.start_position || 0) - biggestGainer.finish_position;
      if (gained >= 5) {
        resultsContext += ` **Hard Charger:** ${driverFull(biggestGainer)}, who ripped from ${ordinal(biggestGainer.start_position)} to ${ordinal(biggestGainer.finish_position)} — a ${gained}-spot gain.`;
      }
    }

    // Biggest loser
    const biggestLoser = raceResults.reduce((worst, r) => {
      const lost = r.finish_position - (r.start_position || 0);
      const worstLost = (worst?.finish_position || 0) - (worst?.start_position || 0);
      return lost > worstLost ? r : worst;
    }, null);
    if (biggestLoser) {
      const lost = biggestLoser.finish_position - (biggestLoser.start_position || 0);
      if (lost >= 5) {
        resultsContext += ` On the flip side, ${driverFull(biggestLoser)} fell ${lost} spots from ${ordinal(biggestLoser.start_position)} to ${ordinal(biggestLoser.finish_position)}.`;
      }
    }

    // High incidents
    const highIncidents = raceResults.filter((r) => r.incidents >= 20);
    if (highIncidents.length > 0) {
      const names = highIncidents.map((r) => driverFull(r)).join(' and ');
      resultsContext += ` It was a rough night on the incident front for ${names}.`;
    }
  }

  // ── Pick'em Accuracy Section ──
  let pickemSection = '';
  if (pickem && pickem.winFavorites.length > 0 && winner) {
    const favName = pickem.winFavorites[0].name;
    const winnerPicked = pickem.winFavorites.find((f) => f.name === winner.name);

    if (winnerPicked && winnerPicked === pickem.winFavorites[0]) {
      pickemSection = `**Pick'em Report:** The fans nailed it. ${favName} was the most-picked winner at ${winnerPicked.pct}%, and they delivered.`;
    } else if (winnerPicked) {
      pickemSection = `**Pick'em Report:** Only ${winnerPicked.pct}% of pickers had ${winner.name} winning. The favorite was ${favName} at ${pickem.winFavorites[0].pct}%.`;
      const favResult = raceResults?.find((r) => r.name === favName);
      if (favResult) {
        pickemSection += ` ${favName} finished ${ordinal(favResult.finish_position)} — close, but no cigar.`;
      }
    } else {
      pickemSection = `**Pick'em Report:** Nobody — zero people — picked ${winner.name} to win. The fan favorite was ${favName} at ${pickem.winFavorites[0].pct}%.`;
      const favResult = raceResults?.find((r) => r.name === favName);
      if (favResult) {
        pickemSection += ` ${favName}? ${ordinal(favResult.finish_position)}.`;
      }
      pickemSection += ` The Pick'em ballots are in shambles.`;
    }

    // Check snubbed drivers who actually did well
    if (pickem.snubbed.length > 0 && raceResults) {
      const snubbedWhoPerformed = pickem.snubbed.filter((name) => {
        const result = raceResults.find((r) => r.name === name);
        return result && result.finish_position <= 5;
      });
      if (snubbedWhoPerformed.length > 0) {
        pickemSection += ` Remember how ${snubbedWhoPerformed.join(' and ')} got zero Pick'em love? They finished top 5. Take notes, pickers.`;
      }
    }
  }

  // ── Driver Quote Sections (ordered by finish) ──
  const sortedAnswered = [...answered].sort((a, b) => {
    const aResult = raceResults?.find((r) => r.car_number === a.driver.car_number);
    const bResult = raceResults?.find((r) => r.car_number === b.driver.car_number);
    return (aResult?.finish_position || 99) - (bResult?.finish_position || 99);
  });

  const sections = [];
  sortedAnswered.forEach((q) => {
    const driver = q.driver;
    const result = raceResults?.find((r) => r.car_number === driver.car_number);
    const displayName = driverFull(driver);
    const snippet = pullQuote(q.answer_text);
    const standing = standings.find((s) => s.car_number === driver.car_number);
    const standingPos = standing ? standings.indexOf(standing) + 1 : null;
    const driverId = standing?.id;
    const form = driverId ? driverForms[driverId] : null;

    // Was this driver the Pick'em favorite?
    const wasFavorite = pickem?.winFavorites?.[0]?.name === driver.name;

    let paragraph = '';

    if (result) {
      const pos = ordinal(result.finish_position);
      const started = ordinal(result.start_position);
      const gained = (result.start_position || 0) - result.finish_position;

      if (result.finish_position === 1) {
        // Winner section
        const intro = pickRandom(WINNER_INTROS)(displayName);
        paragraph = `${intro}.`;
        if (result.laps_led > 0) paragraph += ` After leading ${result.laps_led} laps,`;
        if (form?.streak >= 2) paragraph += ` That's ${form.streak + 1} straight top-5 finishes now.`;
        paragraph += ` "${q.answer_text}"`;
        if (standingPos) paragraph += `\n\n${driverDisplay(driver)} moves to ${ordinal(standingPos)} in the championship.`;

      } else if (result.finish_position <= 3) {
        // Podium
        paragraph = `${displayName} brought it home ${pos} after starting ${started} — a solid run.`;
        if (form?.form === 'on_fire') paragraph += ` The power rankings have them red hot right now.`;
        paragraph += ` "${snippet}"`;
        if (q.answer_text.length > snippet.length + 20) {
          paragraph += `\n\n${driverDisplay(driver)} continued: "${q.answer_text}"`;
        }

      } else if (gained >= 5) {
        // Big charge
        const intro = pickRandom(CHARGE_INTROS)(displayName);
        paragraph = `${intro}. From ${started} to ${pos} — a ${gained}-spot gain.`;
        if (form?.trend === 'surging') paragraph += ` The trend line says this is no fluke.`;
        paragraph += ` "${q.answer_text}"`;

      } else if (result.finish_position > result.start_position + 3) {
        // Lost spots
        const intro = pickRandom(FRUSTRATION_INTROS)(displayName);
        paragraph = `${intro}. Started ${started}, finished ${pos}.`;
        if (wasFavorite) paragraph += ` This was supposed to be their night — the fans had them as the Pick'em favorite.`;
        if (form?.form === 'struggling') paragraph += ` The power rankings already had them flagged as struggling.`;
        paragraph += ` "${snippet}"`;
        if (q.answer_text !== snippet) {
          paragraph += `\n\nThe full take from ${driverDisplay(driver)}: "${q.answer_text}"`;
        }

      } else if (result.incidents >= 20) {
        // Rough night
        paragraph = `${displayName} had one of the rougher nights — ${pos} with ${result.incidents} incidents.`;
        paragraph += ` "${q.answer_text}"`;

      } else {
        // Mid-pack
        paragraph = `${displayName} came home ${pos}.`;
        if (form?.trend === 'trending_down') paragraph += ` The power rankings have them trending in the wrong direction.`;
        else if (standingPos && standingPos <= 3) paragraph += ` Still ${ordinal(standingPos)} in points — no panic, but not the night they wanted.`;
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

  // ── Standings Shift ──
  let standingsShift = '';
  if (standings && standings.length >= 2) {
    const leader = standings[0];
    const second = standings[1];
    const gap = leader.season_points - second.season_points;
    standingsShift = `**Updated Standings:** ${driverFull(leader)} leads the championship with ${leader.season_points} points`;
    if (gap === 0) {
      standingsShift += `, tied with ${driverFull(second)} at the top. This is anyone's title.`;
    } else {
      standingsShift += `, ${gap} ahead of ${driverFull(second)}.`;
    }
    if (standings[2]) {
      const gap3 = leader.season_points - standings[2].season_points;
      standingsShift += ` ${driverFull(standings[2])} is ${gap3} back and still in the hunt.`;
    }
    standingsShift += ` Remember: ${DROPS_ALLOWED} drop weeks make this a marathon, not a sprint.`;
  }

  const closing = pickRandom(POST_RACE_CLOSINGS)(nextTrack);

  // ── Assemble ──
  const bodyParts = [lede, '', resultsContext, ''];
  if (pickemSection) bodyParts.push(pickemSection, '');
  bodyParts.push(sections.join('\n\n'), '', standingsShift, '', closing);

  const body = bodyParts.join('\n');

  const firstSnippet = answered[0]?.answer_text?.split(/[.!?]/)[0];
  const titleOptions = [
    `${track} Recap: Tempers, Trophies, and Consequences`,
    firstSnippet ? `"${firstSnippet}" — ${track} Post-Race Fallout` : `Race ${raceNumber} Fallout: ${track} Leaves Its Mark`,
    `Race ${raceNumber} Recap: ${winner ? `${driverDisplay(winner)} Wins, ` : ''}Garage Sounds Off`,
    `${track} Race Report: Who's Up, Who's Down, and Who's Mad`,
    `After ${track}: The Winners, The Wrecked, and The Words`,
    pickem && !pickem.winFavorites.find((f) => f.name === winner?.name)
      ? `${track} Upset: Nobody Saw ${winner ? driverDisplay(winner) : 'This'} Coming`
      : `${track}: ${winner ? driverDisplay(winner) : 'Winner'} Delivers, Field Reacts`,
  ];
  const title = pickRandom(titleOptions);
  const subtitle = `Post-race reactions, Pick'em results, and power rankings fallout from Race ${raceNumber} at ${track}`;

  return { title, subtitle, body, category: 'recap' };
}
