#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🔧  PUSHING SCORING UPDATES..."
echo ""
echo "=== FANTASY SCORING CHANGES ==="
echo "1. Win: +10 → +5 bonus (stacks with Top 3 for +12 total)"
echo "2. Laps Led: +0.25/lap → +0.10/lap"
echo "3. Fastest Lap: +5 → +3"
echo "4. Outside Top 10: -2 → -1"
echo ""
echo "=== BONUS FIX ==="
echo "5. Lowest incidents bonus now splits evenly among ALL tied drivers"
echo "   (was: 2-way=1pt each, 3+=1pt each → now: 2pts / number of tied drivers)"
echo "   Example: 4-way tie = 0.5 pts each"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage all changed files
git add \
  src/components/FantasyDraft.jsx \
  src/pages/admin/ManageFantasy.jsx \
  src/lib/points.js \
  MEMORY.md \
  PUSH-SCORING-UPDATE.command

# Create commit
git commit -m "Update fantasy scoring + fix lowest incidents bonus split

Fantasy Scoring Changes:
- Win: +10 (highest-only) → +5 bonus that STACKS with Top 3 (+7) = +12 total
- Laps Led: +0.25/lap → +0.10/lap
- Fastest Lap: +5 → +3
- Outside Top 10: -2 → -1
- Win now stacks with Top 3; all other position tiers remain highest-only

Bonus Fix:
- Lowest incidents bonus (2 pts) now splits EVENLY among all tied drivers
- Was: any tie gave each driver 1 pt (unfair with 3+ way ties)
- Now: 2 / numTied (solo=2, 2-way=1, 3-way=0.67, 4-way=0.5)
- Fixes issue where 4 drivers tied for lowest incidents at Kansas

Files changed:
- src/components/FantasyDraft.jsx (SCORING constants + scoreDriver logic)
- src/pages/admin/ManageFantasy.jsx (matching SCORING constants + logic)
- src/lib/points.js (lowestIncidents bonus split calculation)
- MEMORY.md (updated scoring documentation)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
