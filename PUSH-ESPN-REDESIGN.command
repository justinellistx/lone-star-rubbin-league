#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🏟️  PUSHING ESPN REDESIGN + ALL ACCUMULATED CHANGES..."
echo ""
echo "=== ESPN LIGHT THEME REDESIGN (ALL PAGES) ==="
echo "1. ESPN light theme: white/gray backgrounds, red accents"
echo "2. Black nav bar with red active tab indicators"
echo "3. Scrolling standings ticker strip below nav"
echo "4. 2-column Home page (headlines + sidebar)"
echo "5. ALL 18 pages converted to light theme"
echo ""
echo "=== INTERVIEWS + FEATURES ==="
echo "6. Driver Interviews system (public + private media rooms)"
echo "7. Admin ManageInterviews (bulk assign + story generator)"
echo "8. Post-race question auto-generation on CSV upload"
echo "9. Retro pixel art track icons (28 tracks)"
echo "10. Arcade game page (iframe embed)"
echo ""
echo "=== FIXES ==="
echo "11. Incident penalties (20-29/-1, 30-39/-2, 40+/-3)"
echo "12. CSV parser for iRacing paired-row format"
echo "13. Rivalries page race_number comparison"
echo "14. Pick'em FK + leaderboard scoring"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage all files
git add \
  src/index.css \
  src/styles/layout.css \
  src/components/Layout.jsx \
  src/components/TrackIcon.jsx \
  src/pages/Home.jsx \
  src/pages/Standings.jsx \
  src/pages/Results.jsx \
  src/pages/Schedule.jsx \
  src/pages/Drivers.jsx \
  src/pages/DriverProfile.jsx \
  src/pages/Teams.jsx \
  src/pages/News.jsx \
  src/pages/Interviews.jsx \
  src/pages/InterviewRoom.jsx \
  src/pages/HeadToHead.jsx \
  src/pages/Rivalries.jsx \
  src/pages/PowerRankings.jsx \
  src/pages/Awards.jsx \
  src/pages/Timeline.jsx \
  src/pages/IncidentHeatmap.jsx \
  src/pages/WhatIf.jsx \
  src/pages/Pickem.jsx \
  src/pages/Game.jsx \
  src/pages/NotFound.jsx \
  src/pages/admin/ManageInterviews.jsx \
  src/pages/admin/UploadRace.jsx \
  src/pages/admin/AdminLayout.jsx \
  src/lib/storyGenerator.js \
  src/lib/postRaceQuestions.js \
  src/lib/csvParser.js \
  src/lib/points.js \
  src/hooks/useSupabase.js \
  src/App.jsx \
  MEMORY.md \
  PUSH-ESPN-REDESIGN.command

# Create commit
git commit -m "ESPN light theme redesign (all pages) + interviews + track icons + fixes

ESPN Light Theme Redesign:
- Switched from dark (#0a0a0f) to ESPN light (#f5f5f5) across ALL 18 pages
- Black nav bar with red (#d00000) active tab indicators
- Scrolling standings ticker strip below nav (live driver points)
- Home: 2-column ESPN layout with headline cards + sidebar
- Tables: dark headers with red bottom border (ESPN style)
- Cards: white backgrounds, light borders, clean typography
- Buttons/badges: ESPN red primary, dark green positive, clean red negative
- Updated global CSS tokens, buttons, badges, tables, inputs

New Features:
- Driver interviews system (public page + private media rooms)
- Admin interview management with bulk assign + story generation
- ESPN-style story generator (standings + Pick'em + power rankings)
- Post-race questions auto-generate on CSV upload
- Pre-race questions auto-assign after post-race recap
- Retro pixel art track icons (28 tracks with SVG paths)
- Arcade game page (iframe embed at /game)

Fixes:
- Incident penalties: 20-29=-1, 30-39=-2, 40+=-3 (was off by one)
- CSV parser: handles iRacing paired-row metadata format
- Rivalries: compare by race_number not array index
- Pick'em: FK references schedule, fixed leaderboard scoring" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
