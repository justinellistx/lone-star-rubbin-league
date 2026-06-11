#!/bin/bash
# Push Stage-Aware Standings feature
# Double-click this file on Mac to deploy

cd "$(dirname "$0")"

# Remove stale lock
rm -f .git/index.lock

# Configure git identity
git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "=== Pushing Stage-Aware Standings Feature ==="
echo ""

# Stage all changed files
git add \
  src/hooks/useSupabase.js \
  src/pages/Standings.jsx

echo "Staged files:"
git diff --cached --name-only
echo ""

# Commit
git commit -m "feat: Stage-aware standings with 4 stage bonuses + overall season view

- Rewrote useComputedStandings() to compute per-stage standings (filter by stage_id)
- Each stage has independent drop-worst-3-of-12 calculation
- Added 4 stage champion bonuses (+3 pts each): Most Laps Led, Lowest Incidents (9+ races), Most Poles, Most Fastest Laps
- All bonuses computed from KEPT races only (dropped races excluded)
- Stage bonuses are stage-scoped — do NOT carry into overall season standings
- Overall season view: cumulative post-drop race points across all stages, no bonuses
- Updated Standings.jsx with working stage tabs, bonus tracker with 4 categories
- Tabs auto-disable for stages with no data yet (Stage 2, Stage 3)
- Backward-compatible: other pages still get Stage 1 standings via 'standings' property"

echo ""
echo "Pushing to origin main..."
git push origin main

echo ""
echo "=== Done! Vercel will auto-deploy in ~30 seconds ==="
echo "=== Stage 2 will appear when Race 13 data is entered ==="
