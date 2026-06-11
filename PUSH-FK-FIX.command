#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🔧 PUSHING ALL FIXES + NEWS SYSTEM..."
echo ""
echo "1. Supabase FK ambiguity fix (empty pages)"
echo "2. Drop worst 3 of 12 — all stats excluded"
echo "3. Team War Room driver stats fix"
echo "4. Driver Profile rewrite with live data + drops"
echo "5. Power Rankings rewrite with trends + context"
echo "6. Lowest incidents requires 9+ races"
echo "7. Updated MEMORY.md with current project state"
echo "8. Fixed CSV upload flow (column names, driver matching, bonuses)"
echo "9. Fixed admin sidebar nav paths"
echo "10. NEW: News page with race recaps, drama, storylines"
echo "11. NEW: Homepage headlines ticker"
echo "12. NEW: News link in main navigation"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage all fixed/new files
git add \
  src/hooks/useSupabase.js \
  src/pages/Standings.jsx \
  src/pages/Teams.jsx \
  src/pages/DriverProfile.jsx \
  src/pages/PowerRankings.jsx \
  src/lib/csvParser.js \
  src/pages/admin/UploadRace.jsx \
  src/pages/admin/AdminLayout.jsx \
  src/pages/admin/AdminLogin.jsx \
  src/pages/News.jsx \
  src/pages/Home.jsx \
  src/components/Layout.jsx \
  src/App.jsx \
  src/pages/Pickem.jsx \
  MEMORY.md

# Create commit
git commit -m "Major update: drops, fixes, news system, upload flow

Core fixes:
- Fixed Supabase FK ambiguity (empty pages bug)
- Drop worst 3 of 12 per stage, DNRs = 0-point entries
- ALL stats from dropped races excluded
- Lowest incidents stage bonus requires 9+ races
- Fixed Team War Room driver stats display
- Rewrote Driver Profile with live data and drop indicators
- Rewrote Power Rankings with trends, form badges, context

Upload flow:
- Fixed column names to match Supabase schema
- Driver matching by cust_id + name fallback
- Bonuses calculated only among league members
- Preview shows match status per driver
- Fixed admin nav paths and login redirect

News system:
- Dedicated /news page with category filters
- 15 articles: 7 race recaps + storylines + drama + Bristol preview
- Homepage headlines ticker with featured article
- News link added to main navigation
- Articles live in Supabase, manageable via admin panel

Pick'em upgrade:
- Picks saved to Supabase (pickem_picks table)
- Fixed FK: pickem_picks.race_id now references schedule (not races)
- Fixed leaderboard scoring: correct property names + schedule-to-race ID mapping
- Pickers identify as league drivers before picking
- Percentage bars show who is picking who per position
- Season leaderboard with tiered scoring (3pts exact, 1pt within 1)
- Dynamic next-race detection from schedule
- Change picks before race, locked view after submit" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
