# Lone Star Rubbin' League - Project Memory

> Reference file for continuing development. Update this as decisions change.

---

## Project Overview

An ESPN-style iRacing league website for the **Lone Star Rubbin' League**, a competitive community racing series running a 36-race NASCAR-format season. The site serves as the central hub for league members to view standings, race results, driver stats, and news.

**Owner/Admin:** Justin Ellis (justinellis@crossfitwillis.com)
**Live Site:** https://iracing-league-hub.vercel.app
**GitHub Repo:** justinellistx/lone-star-rubbin-league (PUBLIC)
**Supabase Project ID:** awdzzzcbxeafakeilxfn

---

## League Structure

- **Season:** 36 races, divided into 3 stages of 12 races each
- **Stage 1:** Truck Series (currently in progress — 7 of 12 races completed)
- **Stage 2:** Xfinity Series
- **Stage 3:** Next Gen Cup Series
- **iRacing League ID:** 11660
- **League Name:** Lone Star Rubbin' (on iRacing)
- **Season Name:** 2026 Lone Star Rubbin'
- **Race night:** Thursdays (one week after the real NASCAR race)

### Drivers (9 total)
| Driver | Car # | Cust ID | Team | Driver UUID |
|--------|-------|---------|------|-------------|
| Justin Ellis4 | 5 | 1282481 | Justin+Nate | d1000000-...-000000000001 |
| Nathan Becker | 21 | 1423684 | Justin+Nate | d1000000-...-000000000002 |
| Blaine Carnes | 25 | 1265792 | Blaine+Terry | d1000000-...-000000000003 |
| Terry Domino | 11 | — | Blaine+Terry | d1000000-...-000000000004 |
| Nick Green2 | 88 | 369504 | Nick+Jordan | d1000000-...-000000000005 |
| Jordan Stancil | 15 | 1268870 | Nick+Jordan | d1000000-...-000000000006 |
| Ryan Ramsey | 10 | 369623 | Ryan+Sam+Ronald | d1000000-...-000000000007 |
| Sam Kunnemann | 64 | 1444517 | Ryan+Sam+Ronald | d1000000-...-000000000008 |
| Ronald Ramsey | 77 | — | Ryan+Sam+Ronald | d1000000-...-000000000009 |

### Teams (4 total)
| Team | Team UUID | Members |
|------|-----------|---------|
| Justin+Nate | c1000000-...-000000000001 | Justin Ellis4, Nathan Becker |
| Blaine+Terry | c1000000-...-000000000002 | Blaine Carnes, Terry Domino |
| Nick+Jordan | c1000000-...-000000000003 | Nick Green2, Jordan Stancil |
| Ryan+Sam+Ronald | c1000000-...-000000000004 | Ryan Ramsey, Sam Kunnemann, Ronald Ramsey |

### Completed Races (Stage 1) — 52 race_results rows in Supabase
| # | Track | Date | Race UUID |
|---|-------|------|-----------|
| 1 | Daytona | Feb 12, 2026 | e1000000-...-000000000001 |
| 2 | Atlanta | Feb 26, 2026 | e1000000-...-000000000002 |
| 3 | COTA | Mar 5, 2026 | e1000000-...-000000000003 |
| 4 | Phoenix | Mar 12, 2026 | e1000000-...-000000000004 |
| 5 | Las Vegas | Mar 19, 2026 | e1000000-...-000000000005 |
| 6 | Darlington | Mar 26, 2026 | e1000000-...-000000000006 |
| 7 | Martinsville | Apr 3, 2026 | e1000000-...-000000000007 |

**Next race:** Race 9 — TBD (check schedule table)
**Last race uploaded:** Race 7 — Martinsville (Bristol race 8 may have been raced Apr 16)

### Drivers Who Missed Races
- Ronald Ramsey: only raced Martinsville (race 7)
- Sam Kunnemann: raced Phoenix, Las Vegas, Darlington, Martinsville (races 4-7)
- Terry Domino: missed Darlington (race 6)
- Jordan Stancil: missed Martinsville (race 7)

---

## Points System (CURRENT — as implemented)

### Position Points
1st = 40, 2nd = 35, 3rd = 34, 4th = 33, 5th = 32 ... down to 40th = 1

Points are based on **true finishing position** (including AI cars in the field).

### Bonus Points (per race, among league drivers only)
| Bonus | Points | Condition |
|-------|--------|-----------|
| Pole Position | +2 | Started P1 (not best start among league — actual P1 only) |
| Fastest Lap | +2 | Fastest single lap time among league drivers |
| Most Laps Led | +2 | Led the most laps among league drivers |
| Lowest Incidents | +2 | Fewest incidents among league drivers (if tied: +1 each) |

### Incident Penalties (per race — FIXED Apr 17, 2026)
| Incidents | Penalty |
|-----------|---------|
| 0–19 | No penalty |
| 20–29 | -1 point |
| 30–39 | -2 points |
| 40+ | -3 points |

Only the highest applicable tier applies (not cumulative).

### Drop System (CRITICAL — implemented Apr 16, 2026)
- **Drop worst 3 of 12 races per stage**
- DNRs (Did Not Race) are injected as **0-point entries** and get dropped first
- When a race is dropped, **ALL stats from that race are excluded** from stage totals:
  - Points, laps led, incidents, wins, top 5, top 10, avg finish, bonus pts, penalty pts
- Only kept races contribute to the driver's stage standings
- The `raceByRace` array on each driver includes an `isDropped` boolean flag
- Driver Profile shows DROPPED/COUNTED badges per race
- Standings page shows dropped points, DNR count, raw vs kept totals

### Stage Bonuses (end of 12-race stage)
| Bonus | Points | Qualification |
|-------|--------|---------------|
| Most Laps Led | +3 | Open to ALL drivers |
| Most Fastest Laps | +3 | Open to ALL drivers |
| Lowest Total Incidents | +3 | **Requires 9+ races entered to qualify** |

### Current Standings (after drops, 7 races)
| Pos | Driver | Points (kept) | Raw Points | Dropped |
|-----|--------|---------------|------------|---------|
| 1 | Nick Green2 | 162 | 205 | 43 |
| 2 | Nathan Becker | 156 | 203 | 47 |
| 3 | Justin Ellis4 | 139 | 193 | 54 |
| 4 | Blaine Carnes | 133 | 187 | 54 |
| 5 | Jordan Stancil | 124 | 142 | 18 (1 DNR) |
| 6 | Ryan Ramsey | 90 | 128 | 38 |
| 7 | Terry Domino | 82 | 101 | 19 (1 DNR) |
| 8 | Sam Kunnemann | 47 | 47 | 0 (3 DNRs) |
| 9 | Ronald Ramsey | 10 | 10 | 0 (6 DNRs) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v4 + custom ESPN dark theme |
| Routing | React Router v6 |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| Charts | Recharts |
| Icons | Lucide React |
| CSV Parsing | Custom parser (csvParser.js) — handles iRacing paired-row metadata format |
| Hosting | Vercel (free tier) |
| Domain | TBD (using .vercel.app for now) |

---

## Design Theme (ESPN/NASCAR Dark)

| Token | Value | Usage |
|-------|-------|-------|
| bg-primary | `#0a0a0f` | Page backgrounds |
| bg-card | `#14141f` | Card backgrounds |
| bg-hover | `#1a1a2e` | Card hover states |
| gold | `#f5a623` | Primary accent, points, leaders |
| red | `#e63946` | Incidents, penalties, negatives |
| teal | `#2ec4b6` | Positive stats, gains, bonuses |
| text-primary | `#ffffff` | Main text |
| text-secondary | `#8a8a9a` | Labels, subtitles |
| borders | `#2a2a3e` | Card borders, dividers |

---

## Architecture & Data Flow

### Data Pipeline
- **All pages pull live data from Supabase** — no more hardcoded demo data (removed Apr 16)
- `useSupabase.js` hooks layer powers all pages
- `useComputedStandings()` is the main hook — chains useAllRaceResults + useDrivers + useTeams
- Computes standings with drop system in `useMemo`
- Points are pre-computed per race_result row (race_points, bonus_points, penalty_points, total_points)

### Key Hooks (src/hooks/useSupabase.js)
| Hook | Returns | Used By |
|------|---------|---------|
| `useAllRaceResults()` | All race_results with drivers + races joined | Standings, Awards, Heatmap, Timeline, PowerRankings |
| `useComputedStandings()` | `{ standings, teamStandings, stageBonusTracker }` with drops | Standings, Drivers, Teams, HeadToHead, WhatIf, Rivalries, PowerRankings |
| `useRaceResultsByRace()` | Results grouped by race | Results, Awards, Pickem, Timeline |
| `useDrivers()` | Active drivers with team join | Heatmap, Pickem |
| `useTeams()` | Teams with attached drivers | Teams (via teamStandings) |
| `useRaces(stageId?)` | Races with stage info | Results, Teams, HeadToHead, Rivalries |
| `useSchedule(seasonId?)` | Schedule entries | Schedule, Home |
| `useNews(limit)` | Published news articles | Home |
| `useDriver(driverId)` | Single driver + results | (available but DriverProfile uses useComputedStandings instead) |
| `useInterviewQuestions(scheduleId)` | Interview Q&A for a schedule entry | Interviews, InterviewRoom, ManageInterviews |
| `useNews(limit)` | Published news articles | Home, News |

### Critical Supabase Notes
- **FK Ambiguity Bug (FIXED):** `drivers` and `teams` have 3 FKs between them (`drivers.team_id → teams.id`, `teams.driver_1_id → drivers.id`, `teams.driver_2_id → drivers.id`). Must use `!drivers_team_id_fkey` hint in Supabase select queries when joining teams from drivers. Without this, Supabase returns an error and hooks silently fail.
- **RLS Policies:** All tables have public SELECT (`qual: true`). Admin write requires `auth.role() = 'authenticated'`.
- **Tables with RLS enabled:** All 18 public tables.

### Database Tables (20 total)
`admin_users`, `bonus_definitions`, `csv_uploads`, `driver_standings`, `drivers`, `incident_penalties`, `interview_questions`, `news`, `overall_standings`, `pickem_picks`, `points_structure`, `race_bonuses`, `race_results`, `races`, `schedule`, `seasons`, `stages`, `team_standings`, `teams`, `tracks`

### interview_questions columns
`id`, `schedule_id` (FK → schedule), `driver_id` (FK → drivers), `question`, `answer` (nullable), `question_type` (pre_race/post_race), `created_at`, `answered_at`
- Unique constraint on (schedule_id, driver_id, question_type)
- Unanswered questions stay private; answered ones show publicly

### pickem_picks columns
`id`, `race_id` (FK → schedule), `picker_id`, `pick_position` (1-5), `picked_driver_id` (FK → drivers), `created_at`

### schedule ↔ races relationship
- `schedule` = pre-season calendar with own UUIDs (created manually)
- `races` = created when CSV uploaded, different UUIDs
- `schedule.race_id` column links to `races.id` after upload
- `schedule.status` set to 'completed' when race CSV uploaded

### race_results columns
`id`, `race_id`, `driver_id`, `finish_position`, `start_position`, `laps_completed`, `laps_led`, `incidents`, `average_lap_time`, `fastest_lap_time`, `fastest_lap_number`, `qualify_time`, `interval`, `out_reason`, `car_id`, `car_name`, `car_number`, `iracing_team_id`, `iracing_cust_id`, `race_points`, `bonus_points`, `penalty_points`, `total_points`, `created_at`

---

## File Structure

```
iracing-league-hub/
├── src/
│   ├── hooks/
│   │   └── useSupabase.js          # ALL data fetching hooks + computed standings with drops
│   ├── lib/
│   │   ├── supabase.js             # Supabase client init
│   │   ├── points.js               # NASCAR points calculation engine (pole=P1 only)
│   │   ├── csvParser.js            # iRacing CSV parser (paired-row metadata format)
│   │   ├── storyGenerator.js       # ESPN-style article generator (pre-race preview + post-race recap)
│   │   └── postRaceQuestions.js    # Auto-generates post-race interview questions from race results
│   ├── pages/
│   │   ├── Home.jsx                # ESPN-style homepage (live data)
│   │   ├── Standings.jsx           # Drop system display, stage bonus tracker
│   │   ├── Results.jsx             # Race results with bonus labels
│   │   ├── Teams.jsx               # Team War Room with H2H, stat comparison
│   │   ├── Drivers.jsx             # Driver grid, links to profiles
│   │   ├── DriverProfile.jsx       # Full profile with drop indicators, chart, race table
│   │   ├── Schedule.jsx            # Season schedule grouped by stage
│   │   ├── PowerRankings.jsx       # Uses ALL race data (no drops) for true trend picture
│   │   ├── Rivalries.jsx           # Driver rivalries
│   │   ├── HeadToHead.jsx          # H2H comparison tool
│   │   ├── WhatIf.jsx              # What-if scenario simulator
│   │   ├── Awards.jsx              # Season awards
│   │   ├── Pickem.jsx              # Race predictions (FK → schedule, not races)
│   │   ├── News.jsx                # Published news/stories
│   │   ├── Interviews.jsx          # Driver interview cards with pending counts
│   │   ├── InterviewRoom.jsx       # Private per-driver media room (/interviews/:driverId)
│   │   ├── Game.jsx                # Embedded arcade game (iframe → lonestarrubbinleague.netlify.app)
│   │   ├── Timeline.jsx            # Season timeline
│   │   ├── IncidentHeatmap.jsx     # Incident visualization
│   │   └── admin/
│   │       ├── AdminLogin.jsx
│   │       ├── AdminLayout.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── UploadRace.jsx      # CSV upload + auto-generates post-race interview questions
│   │       ├── ManageDrivers.jsx
│   │       ├── ManageSchedule.jsx
│   │       ├── ManageNews.jsx
│   │       └── ManageInterviews.jsx # Single + bulk assign questions, story generation
│   ├── components/                  # Layout, StandingsTable, DriverCard, TrackIcon, etc.
│   ├── styles/                      # Component CSS files
│   ├── App.jsx                      # Router config
│   └── main.jsx                     # Entry point
├── MEMORY.md                        # THIS FILE
├── supabase-schema.sql
├── seed-data.sql
├── .env / .env.example
├── package.json
├── vite.config.js / tailwind.config.js / vercel.json
└── *.command                        # Push/deploy scripts (double-click on Mac)
```

---

## Push/Deploy Workflow

The sandbox cannot `git push` (network blocked), so `.command` scripts are created for Justin to double-click on his Mac. Each script:
1. `cd` to the project directory
2. Removes stale git lock files
3. Configures git identity
4. Stages specific files
5. Creates a descriptive commit
6. Pushes to `origin main`
7. Vercel auto-deploys in ~30 seconds

---

## Weekly Race Upload Workflow

1. Race happens on iRacing (Thursday nights)
2. Export race results CSV from iRacing
3. Log into admin panel at `/admin/login`
4. Go to "Upload Race" page
5. Drag & drop the CSV file
6. Review parsed preview (positions, points, bonuses calculated automatically)
7. Select the correct stage and race number
8. Confirm upload → race_results inserted, schedule entry linked & marked completed
9. **Post-race interview questions auto-generate** from race results (categorized by performance)
10. Standings update — public site reflects new results
11. Go to ManageInterviews → generate post-race recap story → auto-publishes to News
12. After recap, pre-race questions for the next race are auto-assigned

**CSV Format:** iRacing uses paired-row metadata (keys line + values line), then header + data rows. `csvParser.js` handles this. Header detection keys on `Fin Pos` column.

---

## Known Issues & Bugs Fixed

| Date | Issue | Fix |
|------|-------|-----|
| Apr 16, 2026 | Pages show empty data after Supabase wiring | Added `!drivers_team_id_fkey` hint to resolve 3-way FK ambiguity between drivers↔teams |
| Apr 16, 2026 | Pole bonus awarded to best start among league | Changed to P1 start only (`startPos === 1`) |
| Apr 16, 2026 | Lowest incidents showed driver with 1 race | Added minimum race qualification (now 9+ races) |
| Apr 16, 2026 | Team War Room showed only points + laps led | `teamData.drivers` were full objects, not IDs — fixed mapping |
| Apr 16, 2026 | Driver Profile always showed "not found" | Checked `driver.races` (wrong field) and fell back to demo data keyed by strings not UUIDs — fully rewritten |
| Apr 16, 2026 | Power Rankings had 0.00 averages | Referenced `r.finish` instead of `r.finishPosition` — fully rewritten |
| Apr 16, 2026 | No drop system | Implemented: drop worst 3, DNR injection, full stat exclusion |
| Apr 17, 2026 | `re.rpc(...).catch is not a function` in story generation | Supabase rpc() returns thenable builder, not Promise. Removed rpc call, use existing race_results fallback |
| Apr 17, 2026 | Stories used raw points (no drops) | Rewrote standings builder in ManageInterviews to sort & drop worst 3 |
| Apr 17, 2026 | CSV parser "No race results found" | `line.includes('Name')` matched "Session Name" in metadata. Fixed header detection to require `Fin Pos` specifically |
| Apr 17, 2026 | `Car #` header not mapping to carNumber | Added `'car_#': 'carNumber'` to header normalization in csvParser.js |
| Apr 17, 2026 | Incident penalty thresholds off by one tier | Changed `<=` to `<` in calculateIncidentPenalty. Retroactively fixed 7 rows via SQL UPDATE |
| Apr 17, 2026 | Rivalries page missing Bristol data | Compared drivers by array index instead of race_number. Fixed with raceMap keyed by raceNum |
| Apr 17, 2026 | CSV metadata parsing broken for iRacing format | Rewrote to handle paired-row format (keys line, values line) using parseCSVLine |

---

## What's NOT Built Yet / Pending

- [ ] Stage filtering in standings (currently shows all races, not per-stage)
- [ ] Real-time auto-refresh when new results are posted
- [ ] Social media share cards for race results
- [ ] Custom domain setup
- [ ] Historical season archive
- [ ] Automated iRacing API pull (instead of CSV upload)
- [ ] Stage championship "playoffs" bracket visualization
- [ ] Driver helmet/livery image gallery

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Apr 7, 2026 | React + Supabase stack | Modern, free hosting, real-time capable |
| Apr 7, 2026 | ESPN dark theme | Matches broadcast feel Justin wants |
| Apr 7, 2026 | CSV upload (not API) | Simpler, Justin controls when data goes in |
| Apr 7, 2026 | Vercel free tier | No cost to start, easy deployment |
| Apr 16, 2026 | Remove all DEMO hardcoded data | All 15 pages wired to live Supabase data |
| Apr 16, 2026 | Computed standings pattern | useComputedStandings derives everything from raw race_results |
| Apr 16, 2026 | Drop system: worst 3 of 12 | NASCAR-style, DNRs as 0-point droppable entries |
| Apr 16, 2026 | All stats excluded on drops | User requested: "when we drop the race all the stats with it should drop" |
| Apr 16, 2026 | Power Rankings use ALL data (no drops) | User requested: shows real trend even when standings mask decline |
| Apr 16, 2026 | Lowest incidents requires 9+ races | Prevents drivers with few races from winning clean driving bonus |
| Apr 16, 2026 | Pole = P1 start only | Not "best start among league" — must actually start first |
| Apr 17, 2026 | Interview system with private/public split | Unanswered questions private; only answered ones show publicly |
| Apr 17, 2026 | Story generator pulls ALL site data | Standings, Pick'em, Power Rankings, driver forms/trends/streaks woven into narrative |
| Apr 17, 2026 | Post-race questions auto-generate on CSV upload | Categorizes drivers by result type (winner, podium, gained/lost spots) |
| Apr 17, 2026 | Auto-assign pre-race questions after post-race recap | Next race gets random questions from QUESTION_BANK with {track} filled in |
| Apr 17, 2026 | Retro pixel art track icons (TrackIcon.jsx) | 28 tracks with unique SVG paths, glow effects, fuzzy name matching |
| Apr 17, 2026 | Arcade game embedded as iframe page | External game at lonestarrubbinleague.netlify.app, accessible via "More > Arcade" nav |
| Apr 17, 2026 | Incident penalties corrected to 20-29/-1, 30-39/-2, 40+/-3 | Previous thresholds were off by one; 7 historical rows retroactively fixed |

---

## Interview System (added Apr 17, 2026)

### Flow
1. **Pre-race questions** are auto-assigned after a post-race recap is generated (or manually via admin)
2. Drivers answer questions in their private media room (`/interviews/:driverId`)
3. Only answered interviews appear publicly on `/interviews`
4. **Post-race questions** auto-generate when CSV is uploaded via UploadRace.jsx
5. Questions are categorized by result: winner, podium, gained/lost spots, high incidents, etc.
6. Admin can also bulk-assign from a NASCAR-style QUESTION_BANK in ManageInterviews.jsx

### Story Generator (storyGenerator.js — ~600 lines)
- `generatePreRacePreview()` and `generatePostRaceRecap()` produce ESPN-style articles
- Pulls data from: interviews, drop-adjusted standings, Pick'em predictions, driver power rankings/forms
- Sections include: Championship Picture, Fans Have Spoken (Pick'em), Power Rankings Watch, driver quotes
- Post-race adds: Pick'em accuracy report, hard charger, biggest loser
- Uses template intro arrays (CONFIDENCE_INTROS, RIVALRY_INTROS, WINNER_INTROS, etc.)
- Generated stories auto-publish to News page

---

## TrackIcon Component (added Apr 17, 2026)

- Reusable: `<TrackIcon track="Bristol" size={64} showLabel />`
- 28 tracks with unique SVG paths approximating real layouts
- `normalizeTrackName()` strips suffixes like "Motor Speedway", "- Dual Pit Roads"
- Each track has: color accent, SVG path, type (superspeedway/speedway/short/road/street)
- PixelGrid overlay for retro effect, glow filter behind track shape
- Used on: Schedule (56px), Results (48px), Home (64px), DriverProfile (28px mini)

---

## Arcade Game (added Apr 17, 2026)

- Route: `/game` — accessible via "More > Arcade" in nav
- Embeds `https://lonestarrubbinleague.netlify.app/` as full-height iframe
- Header with Gamepad2 icon and "Lone Star Rubbin' League Arcade" title

---

## Environment Variables

```
VITE_SUPABASE_URL=https://awdzzzcbxeafakeilxfn.supabase.co
VITE_SUPABASE_ANON_KEY=<set in .env and Vercel>
```

---

*Last updated: April 17, 2026*
