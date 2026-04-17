#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🏟️  PUSHING ESPN REDESIGN + ALL ACCUMULATED CHANGES..."
echo ""
echo "=== ESPN LIGHT THEME REDESIGN ==="
echo "1. NEW: ESPN light theme (white/gray backgrounds, red accents)"
echo "2. NEW: ESPN-style black nav bar with red active indicators"
echo "3. NEW: Scrolling standings ticker strip below nav"
echo "4. NEW: 2-column Home page (main content + sidebar)"
echo "5. NEW: Dense headline cards, standings widget, quick links"
echo "6. NEW: ESPN-style section headers with red/black bottom borders"
echo ""
echo "=== INTERVIEWS + FEATURES ==="
echo "7. NEW: Driver Interviews system (public + private media rooms)"
echo "8. NEW: Admin ManageInterviews (bulk assign + story generator)"
echo "9. NEW: Post-race question auto-generation on CSV upload"
echo "10. NEW: Retro pixel art track icons (28 tracks)"
echo "11. NEW: Arcade game page (iframe embed)"
echo ""
echo "=== FIXES ==="
echo "12. FIX: Incident penalties (20-29/-1, 30-39/-2, 40+/-3)"
echo "13. FIX: CSV parser for iRacing paired-row format"
echo "14. FIX: Rivalries page race_number comparison"
echo "15. FIX: Pick'em FK + leaderboard scoring"
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
  src/pages/Home.jsx \
  src/pages/Interviews.jsx \
  src/pages/InterviewRoom.jsx \
  src/pages/admin/ManageInterviews.jsx \
  src/pages/admin/UploadRace.jsx \
  src/lib/storyGenerator.js \
  src/lib/postRaceQuestions.js \
  src/lib/csvParser.js \
  src/lib/points.js \
  src/hooks/useSupabase.js \
  src/App.jsx \
  src/pages/admin/AdminLayout.jsx \
  src/pages/Pickem.jsx \
  src/pages/Rivalries.jsx \
  src/components/TrackIcon.jsx \
  src/pages/Game.jsx \
  src/pages/Results.jsx \
  src/pages/Schedule.jsx \
  src/pages/Standings.jsx \
  src/pages/DriverProfile.jsx \
  MEMORY.md \
  PUSH-ESPN-REDESIGN.command

# Create commit
git commit -m "ESPN light theme redesign + interviews + track icons + fixes

ESPN Redesign:
- Light theme: white/gray backgrounds, ESPN red (#d00000) accents
- Black nav bar with red active tab indicators
- Scrolling standings ticker strip below nav (live driver points)
- Home page: 2-column ESPN layout (headlines + sidebar)
- Dense headline cards, compact standings widget, quick links
- ESPN-style section headers with red/black bottom borders
- Updated global CSS tokens, buttons, badges, tables for light theme

New Features:
- Driver interviews system (public page + private media rooms)
- Admin interview management with bulk assign + story generation
- ESPN-style story generator pulling standings, Pick'em, power rankings
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
