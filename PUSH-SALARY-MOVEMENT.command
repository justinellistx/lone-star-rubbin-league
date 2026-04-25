#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "📊  PUSHING FANTASY SALARY MOVEMENT TRACKING..."
echo ""
echo "=== NEW FEATURE: Salary Movement ==="
echo "1. Driver salaries now show ▲/▼ arrows with dollar amount change"
echo "2. Previous salary computed by excluding latest race results"
echo "3. 'Biggest Movers' sort option in driver pool"
echo "4. 'Best Value' sort (FPTS per $1k salary)"
echo "5. Admin panel shows Change column with movement indicators"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage changed files
git add \
  src/components/FantasyDraft.jsx \
  src/pages/admin/ManageFantasy.jsx \
  PUSH-SALARY-MOVEMENT.command

# Create commit
git commit -m "Add fantasy salary movement tracking + sort options

New Feature: Salary Movement Indicators
- Driver salaries now show ▲/▼ arrows with dollar change since last race
- Previous salary computed by excluding most recent race results
- Green ▲ for salary increases, red ▼ for decreases, dash for unchanged

New Sort Options in Driver Pool:
- By Salary (default) — highest paid first
- Biggest Movers — largest absolute salary change first
- Best Value — highest fantasy pts per \$1k of salary first

Admin Panel Updates:
- New 'Change' column in salary table showing movement indicators
- Previous salary + delta computation matching frontend logic

Files changed:
- src/components/FantasyDraft.jsx (prevSalaries, salaryDeltas, sort UI, movement arrows)
- src/pages/admin/ManageFantasy.jsx (prevSalaries, Change column)

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
