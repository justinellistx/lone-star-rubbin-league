#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🏈  PUSHING FANTASY DRAFT (DFS-STYLE) SYSTEM..."
echo ""
echo "=== NEW FEATURE: FANTASY DRAFT ==="
echo "1. DraftKings-style fantasy lineup builder"
echo "2. \$10,000 salary cap, pick 3 drivers per race"
echo "3. Auto-calculated salaries from driver performance"
echo "4. Full scoring engine (Win/Top3/5/8/10 + laps led + incidents + fastest lap)"
echo "5. Per-driver point breakdown after each race"
echo "6. Weekly optimal lineup calculator"
echo "7. Season-long fantasy leaderboard"
echo "8. Admin panel: /admin/fantasy (view salaries, manage lineups)"
echo "9. New 'Fantasy' tab on Pick'em page"
echo "10. Supabase table: fantasy_lineups"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage all fantasy draft files + modified files
git add \
  src/components/FantasyDraft.jsx \
  src/pages/admin/ManageFantasy.jsx \
  src/pages/admin/AdminLayout.jsx \
  src/pages/Pickem.jsx \
  src/hooks/useSupabase.js \
  src/App.jsx \
  MEMORY.md \
  PUSH-FANTASY-DRAFT.command

# Create commit
git commit -m "Add DFS-style Fantasy Draft system to Pick'em page

New Feature: Fantasy Draft (DraftKings/FanDuel style)
- \$10,000 salary cap, pick 3 drivers per race
- Salaries auto-calculated from driver stats (avg finish, wins, laps led, incidents)
- Top driver caps at \$5,000, worst at \$1,400 — forces real roster decisions
- Scoring: Win +10, Top 3 +7, Top 5 +5, Top 8 +3, Top 10 +1, P11+ -2
- Bonus: Fastest Lap +5, Per Lap Led +0.25, Per Incident -0.10
- Position tiers are highest-only (not stacking)
- Lineups hidden until race results are in (DraftKings style)
- Locks same time as Pick'em

Features:
- Fantasy tab with 3 sub-tabs: My Lineup, Results, Standings
- Driver pool with salary, stats, and affordability indicators
- Salary cap progress bar and roster builder
- Per-driver scoring breakdown showing exactly how points were earned
- Weekly optimal lineup calculator (best possible under cap)
- Season leaderboard with total, avg/race, best/worst week
- Admin panel (/admin/fantasy) for salary overview and lineup management

New Files:
- src/components/FantasyDraft.jsx (lineup builder + scoring + leaderboard)
- src/pages/admin/ManageFantasy.jsx (admin management)
- Supabase table: fantasy_lineups (race_id, picker_id, driver_id, salary)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
