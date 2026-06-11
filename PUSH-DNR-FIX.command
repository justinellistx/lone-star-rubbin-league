#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🔧 PUSHING ALL FIXES TO GITHUB..."
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage updated files
git add src/lib/points.js src/pages/IncidentHeatmap.jsx

# Create commit (skip if already committed)
git commit -m "Fix: DNR injection, pole bonus P1-only, heatmap cleanest/dirtiest

- Points engine injects 0-point DNR entries for missed races
- Pole bonus now only awarded if driver starts P1 (was: best start among league)
- Fixed cleanest/dirtiest labels on Incident Heatmap showing blank
  (reduce had no initial value so driver names were undefined)" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
