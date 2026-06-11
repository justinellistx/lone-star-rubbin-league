#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🔧 PUSHING SUPABASE WIRING TO GITHUB..."
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage all updated files
git add \
  src/hooks/useSupabase.js \
  src/pages/Standings.jsx \
  src/pages/Results.jsx \
  src/pages/Home.jsx \
  src/pages/Teams.jsx \
  src/pages/Drivers.jsx \
  src/pages/Schedule.jsx \
  src/pages/HeadToHead.jsx \
  src/pages/Awards.jsx \
  src/pages/IncidentHeatmap.jsx \
  src/pages/WhatIf.jsx \
  src/pages/Rivalries.jsx \
  src/pages/Pickem.jsx \
  src/pages/PowerRankings.jsx \
  src/pages/Timeline.jsx \
  src/lib/points.js

# Create commit
git commit -m "Wire all pages to live Supabase data

- Built comprehensive useSupabase hooks (useAllRaceResults, useComputedStandings, useRaceResultsByRace, useTeams, etc.)
- Removed all hardcoded DEMO data from every page
- All 12 pages now pull live race results from Supabase
- Standings, Results, Home, Teams, Drivers, Schedule wired
- HeadToHead, Awards, Rivalries, IncidentHeatmap, WhatIf wired
- PowerRankings, Pickem, Timeline auto-generate from live data
- Added loading states and error handling to all pages
- Pole bonus label updated to P1 start" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
