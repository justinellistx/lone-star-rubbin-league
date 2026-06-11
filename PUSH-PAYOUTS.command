#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "💰  PUSHING THE PAYOUTS LEADERBOARD..."
echo ""
echo "=== NEW FEATURE: PAYOUT LEADERBOARD ==="
echo "1. Driver Earnings leaderboard — ranked by total $ earned"
echo "2. Team Earnings leaderboard — aggregated by racing teams"
echo "3. Race Breakdown tab — per-race payout details with expand"
echo "4. 4-tier payout structure: Crown Jewel, Major, Standard, Finale"
echo "5. Global bonuses: Pole ($2K), Laps Led ($2K), Fastest Lap ($2K), Clean Race ($3K)"
echo "6. Expandable driver rows with race-by-race earnings breakdown"
echo "7. Bonus award chips per driver (pole count, laps led count, etc.)"
echo "8. Payout structure reference section at bottom"
echo "9. Live calculation from Supabase race_results data"
echo "10. NASCAR.com design patterns — consistent with site redesign"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock

echo "📂  Files being pushed:"
echo "  NEW:  src/hooks/usePayouts.js"
echo "  NEW:  src/pages/Payouts.jsx"
echo "  MOD:  src/App.jsx (route added)"
echo "  MOD:  src/components/Layout.jsx (nav link added)"
echo ""

git add src/hooks/usePayouts.js src/pages/Payouts.jsx src/App.jsx src/components/Layout.jsx
git commit -m "feat: add payout leaderboard page with driver/team earnings

- New /payouts page with 3 tabs: Driver Earnings, Team Earnings, Race Breakdown
- 4-tier payout structure: Crown Jewel ($200K), Major ($125K), Standard ($100K), Finale ($300K)
- Global bonus awards: Pole, Most Laps Led, Fastest Lap, Clean Race
- Live calculations from Supabase race_results (finish position, start position, laps led, fastest lap, incidents)
- Expandable driver rows with race-by-race breakdown and bonus chips
- Team leaderboard aggregates driver earnings by racing team
- Race breakdown cards show all position payouts + bonus winners per race
- Payout structure reference section with tier cards and bonus info
- Added /payouts route and nav link"

echo ""
echo "⬆️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅  PAYOUTS LEADERBOARD DEPLOYED!"
echo "🌐  Live at: https://lonestarrubbinleague.com/payouts"
echo ""
echo "💡  Vercel will auto-deploy from the push. Give it ~60 seconds."
