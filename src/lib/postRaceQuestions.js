/**
 * Post-Race Question Generator
 *
 * Generates personalized post-race interview questions for each driver
 * based on their actual race results. Called after a race CSV is uploaded.
 */

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Question templates — {track}, {finish}, {start}, {incidents}, {lapsLed} get replaced
const WINNER_QUESTIONS = [
  "You won at {track}! Walk us through the final laps — when did you know it was yours?",
  "P1 at {track}. You led {lapsLed} laps tonight. Was this the race you expected or did you have to earn it the hard way?",
  "Checkered flag is yours at {track}. What does this win mean for your championship run?",
  "Dominant night at {track}. Is this the best you've driven all season?",
];

const PODIUM_QUESTIONS = [
  "You finished {finish} at {track} after starting {start}. Solid night — but are you satisfied or did you want more?",
  "{finish} at {track}. You were close to the front all race — what kept you from getting to victory lane?",
  "A top-3 at {track} — good points night. Was there a moment you thought you had a shot at the win?",
];

const GAINED_SPOTS_QUESTIONS = [
  "You started {start} and drove up to {finish} at {track}. That's a statement drive — what was working for you out there?",
  "Nice charge through the field at {track} — {start} to {finish}. Where did you make your best moves?",
  "You gained {gained} spots at {track}. Were you racing the guys around you or just trying to survive?",
];

const LOST_SPOTS_QUESTIONS = [
  "Tough night at {track} — started {start}, finished {finish}. What happened out there?",
  "You dropped from {start} to {finish} at {track}. Was it handling, incidents, or just bad luck?",
  "Not the result you wanted at {track}. You lost {lost} spots from where you started. What went wrong?",
];

const HIGH_INCIDENT_QUESTIONS = [
  "You racked up {incidents} incidents at {track}. Was it you getting into people or people getting into you?",
  "{incidents} incidents at {track} — that's a rough night. What was going on out there?",
  "The incident count was high tonight at {incidents}. Are you frustrated with how {track} went?",
];

const LAPS_LED_NO_WIN_QUESTIONS = [
  "You led {lapsLed} laps at {track} but finished {finish}. That's got to hurt — what happened down the stretch?",
  "{lapsLed} laps out front and no trophy at {track}. Are you sick of this script yet?",
  "You had the car to win at {track} — led {lapsLed} laps. What does it take to close one of these out?",
];

const MID_PACK_QUESTIONS = [
  "You finished {finish} at {track}. How would you rate your night — is the car getting better or are you still searching?",
  "{finish} at {track}. Not a disaster, not a celebration. Where do you go from here?",
  "Middle of the pack tonight at {track}. What do you need to get to the front?",
];

const ROUGH_RACE_QUESTIONS = [
  "It was a tough one at {track} — {finish} with {incidents} incidents. Just one of those nights?",
  "{track} chewed you up. Finished {finish}, {incidents} incidents. What's the mood right now?",
  "Be honest — how bad was tonight at {track}? {finish} is not where you want to be.",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template, data) {
  return template
    .replace(/\{track\}/g, data.track)
    .replace(/\{finish\}/g, data.finish)
    .replace(/\{start\}/g, data.start)
    .replace(/\{incidents\}/g, data.incidents)
    .replace(/\{lapsLed\}/g, data.lapsLed)
    .replace(/\{gained\}/g, data.gained)
    .replace(/\{lost\}/g, data.lost);
}

/**
 * Generate a personalized post-race question for one driver based on their result.
 */
function generateQuestionForDriver(result, trackName) {
  const data = {
    track: trackName,
    finish: ordinal(result.finish_position),
    start: ordinal(result.start_position),
    incidents: String(result.incidents || 0),
    lapsLed: String(result.laps_led || 0),
    gained: String(Math.max(0, (result.start_position || 0) - result.finish_position)),
    lost: String(Math.max(0, result.finish_position - (result.start_position || 0))),
  };

  let pool;

  // Winner
  if (result.finish_position === 1) {
    pool = WINNER_QUESTIONS;
  }
  // Led lots of laps but didn't win
  else if ((result.laps_led || 0) >= 10 && result.finish_position > 1) {
    pool = LAPS_LED_NO_WIN_QUESTIONS;
  }
  // Podium
  else if (result.finish_position <= 3) {
    pool = PODIUM_QUESTIONS;
  }
  // Gained 3+ spots
  else if ((result.start_position || 99) - result.finish_position >= 3) {
    pool = GAINED_SPOTS_QUESTIONS;
  }
  // High incidents (20+)
  else if ((result.incidents || 0) >= 20) {
    pool = result.finish_position > 10 ? ROUGH_RACE_QUESTIONS : HIGH_INCIDENT_QUESTIONS;
  }
  // Lost 3+ spots
  else if (result.finish_position - (result.start_position || 0) >= 3) {
    pool = LOST_SPOTS_QUESTIONS;
  }
  // Mid-pack
  else {
    pool = MID_PACK_QUESTIONS;
  }

  return fillTemplate(pickRandom(pool), data);
}

/**
 * Generate post-race questions for all drivers in a race.
 *
 * @param {Object} params
 * @param {string} params.scheduleId - Schedule table ID for this race
 * @param {string} params.trackName - e.g. "Bristol"
 * @param {Array} params.raceResults - Array of { driver_id, finish_position, start_position, laps_led, incidents }
 * @returns {Array} Array of { schedule_id, driver_id, question_type, question_text, published }
 */
export function generatePostRaceQuestions({ scheduleId, trackName, raceResults }) {
  return raceResults.map((result) => ({
    schedule_id: scheduleId,
    driver_id: result.driver_id,
    question_type: 'post_race',
    question_text: generateQuestionForDriver(result, trackName),
    published: true,
  }));
}
