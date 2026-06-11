#!/bin/bash
# Push Stage Bonus Points fix
# Double-click this file on Mac to deploy

cd "$(dirname "$0")"

# Remove stale lock
rm -f .git/index.lock

# Configure git identity
git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "=== Pushing Stage Bonus Points Fix ==="
echo ""

# Stage changed files
git add \
  src/hooks/useSupabase.js \
  src/pages/Standings.jsx \
  src/pages/Schedule.jsx \
  src/lib/csvParser.js \
  src/pages/admin/UploadRace.jsx

echo "Staged files:"
git diff --cached --name-only
echo ""

# Commit
git commit -m "fix: stage bonus points + CSV fastest lap parsing for road courses

- Stage bonuses (Most Laps Led, Lowest Incidents, Most Poles, Most Fastest Laps) now add +3 pts each to winners' standings
- Handles ties for Most Poles and Most Fastest Laps (all tied leaders get +3)
- Points column shows 'includes +X stage bonus' indicator with tooltip listing which bonuses
- Overall Season standings correctly exclude stage bonus points
- Fixed CSV parser: road course lap times in M:SS.mmm format (e.g. 1:44.738) now convert to total seconds (104.738) instead of truncating to 1
- Added Best Lap column to admin upload preview table so fastest lap data is visible before uploading"

echo ""
echo "Pushing to origin main..."
git push origin main

echo ""
echo "=== Done! Vercel will auto-deploy in ~30 seconds ==="
echo "=== Stage bonus points now reflected in standings totals ==="
