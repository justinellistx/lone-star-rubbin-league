# Lone Star Rubbin' League - Project Memory

> Reference file for continuing development. Update this as decisions change.

---

## Project Overview

An ESPN-style iRacing league website for the **Lone Star Rubbin' League**, a competitive community racing series running a 36-race NASCAR-format season. The site serves as the central hub for league members to view standings, race results, driver stats, and news.

**Owner/Admin:** Justin Ellis (justinellis@crossfitwillis.com)

---

## League Structure

- **Season:** 36 races, divided into 3 stages of 12 races each
- **Stage 1:** Truck Series (currently in progress — 6 of 12 races completed)
- **Stage 2:** Xfinity Series
- **Stage 3:** Next Gen Cup Series
- **iRacing League ID:** 11660
- **League Name:** Lone Star Rubbin' (on iRacing)
- **Season Name:** 2026 Lone Star Rubbin'

### Drivers (8 total)
| Driver | Cust ID | Team |
|--------|---------|------|
| Justin Ellis4 | 1282481 | Justin+Nate |
| Nathan Becker | 1423684 | Justin+Nate |
| Blaine Karnes | 1265792 | Blaine+Terry |
| Terry Domino | — | Blaine+Terry |
| Nik Green2 | 369504 | Nik+Jordan |
| Jordan Stancil | 1268870 | Nik+Jordan |
| Ryan Ramsey | 369623 | Ryan+Sam |
| Sam Kunnemann | 1444517 | Ryan+Sam |

### Completed Races (Stage 1)
1. Daytona - Feb 12, 2026
2. EchoPark - Feb 26, 2026
3. CODA - Mar 5, 2026
4. Phoenix - Mar 12, 2026
5. Las Vegas - Mar 19, 2026
6. Darlington - Mar 26, 2026

---

## Points System

### Position Points
1st = 40, 2nd = 35, 3rd = 34, 4th = 33, 5th = 32 ... down to 40th = 1

Points are based on **true finishing position** (including AI cars in the field).

### Bonus Points (per race)
| Bonus | Points | Condition |
|-------|--------|-----------|
| Pole Position | +2 | Best qualify time |
| Fastest Lap | +1 | Fastest single lap in race |
| Most Laps Led | +2 | Led the most laps |
| Lowest Incidents | +2 | Fewest incidents (among league drivers) |
| Clean Race | +1 | 0 incidents |

### Incident Penalties
- 0-4 incidents: No penalty
- 5-8 incidents: -1 point per incident over 4
- 9-12 incidents: -2 points per incident over 8
- 13+ incidents: -3 points per incident over 12

### Drop Races
- Drivers drop their **3 worst finishes** per 12-race stage
- Teams use their **best 9 finishes** per stage

### Team Bonuses
- Both drivers finishing top 5: bonus awarded
- Combined performance across qualifying, laps led, fastest laps
- Clean racing bonuses across the stage

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
| CSV Parsing | PapaParse |
| Hosting | Vercel (free tier) |
| Domain | TBD (using .vercel.app for now) |

---

## Design Decisions

### Visual Style
- **ESPN/NASCAR dark theme** — broadcast graphics aesthetic
- Background: `#0a0a0f` (near black)
- Cards: `#14141f`
- Card hover: `#1a1a2e`
- Accent gold: `#f5a623` (NASCAR gold — primary accent)
- Accent red: `#e63946` (racing red)
- Accent teal: `#2ec4b6` (positive stats, gains)
- Text primary: `#ffffff`
- Text secondary: `#8a8a9a`
- Borders: `#2a2a3e`

### Architecture
- **Public site** — no login required, anyone can view standings/results/stats
- **Admin panel** — password-protected via Supabase Auth, only Justin logs in
- **Data flow:** iRacing CSV export → Admin uploads via drag & drop → PapaParse parses client-side → Preview shown → Confirm → Supabase insert → Standings recalculate
- **Demo data fallback** — all pages show hardcoded demo data when Supabase isn't connected, so the app works standalone for development

### Database
- 18 Supabase tables (see `supabase-schema.sql`)
- Key tables: `drivers`, `teams`, `seasons`, `stages`, `races`, `race_results`, `driver_standings`, `team_standings`, `overall_standings`, `schedule`, `news`
- Row Level Security: public read on all display tables, authenticated write for admin
- Standings tables are cached/materialized — recalculated after each race upload

---

## File Structure

```
iracing-league-hub/
├── public/
├── scripts/
│   └── migrate-from-sheets.js     # Seeds drivers, teams, season, stages, schedule
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # Main nav + footer (uses Outlet)
│   │   ├── StandingsTable.jsx      # Reusable standings table
│   │   ├── RaceResultsTable.jsx    # Race results display
│   │   ├── StatCard.jsx            # Metric display card
│   │   ├── DriverCard.jsx          # Driver profile card
│   │   ├── NewsCard.jsx            # News article card
│   │   └── LoadingSpinner.jsx      # Loading indicator
│   ├── hooks/
│   │   └── useSupabase.js          # Data fetching hooks
│   ├── lib/
│   │   ├── supabase.js             # Supabase client init
│   │   ├── points.js               # NASCAR points engine
│   │   └── csvParser.js            # iRacing CSV parser
│   ├── pages/
│   │   ├── Home.jsx                # ESPN-style homepage
│   │   ├── Standings.jsx           # Stage standings with tabs
│   │   ├── Results.jsx             # Race results browser
│   │   ├── Teams.jsx               # Team standings
│   │   ├── Drivers.jsx             # Driver directory
│   │   ├── DriverProfile.jsx       # Individual driver page
│   │   ├── Schedule.jsx            # Full season schedule
│   │   ├── NotFound.jsx            # 404
│   │   └── admin/
│   │       ├── AdminLogin.jsx      # Auth login
│   │       ├── AdminLayout.jsx     # Auth-protected wrapper
│   │       ├── AdminDashboard.jsx  # Admin home
│   │       ├── UploadRace.jsx      # CSV upload + preview
│   │       ├── ManageDrivers.jsx   # CRUD drivers
│   │       ├── ManageSchedule.jsx  # Edit schedule
│   │       └── ManageNews.jsx      # News editor
│   ├── styles/                     # Component CSS files
│   ├── App.jsx                     # Router config
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles + theme
├── supabase-schema.sql             # Full database schema
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vercel.json                     # SPA rewrite rules
├── .env.example
└── SETUP.md                        # Deployment guide
```

---

## Weekly Workflow

1. Race happens on iRacing
2. Export race results CSV from iRacing
3. Log into admin panel at `/admin/login`
4. Go to "Upload Race" page
5. Drag & drop the CSV file
6. Review the parsed preview (positions, points, bonuses calculated automatically)
7. Select the correct stage and race number
8. Confirm upload
9. Standings update — league members see new results on the public site

---

## Data Source: Google Sheets

The original data lives in a Google Sheet called "Iracing League" with:
- **Stage 1 LeaderBoard** tab — aggregated standings, bonuses, team standings
- **6 race result tabs** — raw iRacing export data per race (S1Darlington, S1Las Vegas, S1Phoenix, S1Coda, S1EchoPark, S1Daytona)
- Each race tab has: metadata rows (1-6), then full results starting row 8-9
- Fields: Fin Pos, Car ID, Car, Car Class, Team ID, Cust ID, Name, Start Pos, Car #, Out ID, Out, Interval, Laps Led, Qualify Time, Avg Lap Time, Fastest Lap Time, Fast Lap#, Laps Comp, Inc

Migration approach: Export each race as CSV, upload through the admin panel, verify standings match the Google Sheet.

---

## What's NOT Built Yet / Future Ideas

- [ ] Real-time auto-refresh when new results are posted
- [ ] Driver comparison tool (head-to-head stats)
- [ ] Rivalry tracker (close finishes between specific drivers)
- [ ] Season awards page (Most Improved, Ironman, Hard Charger, etc.)
- [ ] Social media share cards for race results
- [ ] Push notifications for new results
- [ ] Historical season archive (for future seasons)
- [ ] Custom domain setup
- [ ] Mobile app version
- [ ] Automated iRacing API pull (instead of CSV upload)
- [ ] Stage championship "playoffs" bracket visualization
- [ ] Race replay/highlights video embeds
- [ ] Driver helmet/livery image gallery
- [ ] Prediction/fantasy league feature

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Apr 7, 2026 | React + Supabase stack | Modern, free hosting, real-time capable |
| Apr 7, 2026 | ESPN dark theme | Matches broadcast feel Justin wants |
| Apr 7, 2026 | CSV upload (not API) | Simpler, Justin controls when data goes in |
| Apr 7, 2026 | Admin-only auth | Only Justin manages data, members just view |
| Apr 7, 2026 | Vercel free tier | No cost to start, easy deployment |
| Apr 7, 2026 | Demo data fallback | App works without Supabase for dev/testing |
| Apr 7, 2026 | Migrate existing data via CSV upload | Verify each race as it goes in |

---

## Environment Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

*Last updated: April 7, 2026*
