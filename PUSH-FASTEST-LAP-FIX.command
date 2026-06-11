#!/bin/bash
set -e

echo "🏁 PUSHING FASTEST LAP FIX"
echo ""

PROJECT_DIR="$HOME/Desktop/iracing-league-hub"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "❌ Project not found at $PROJECT_DIR"
  read -p "Press Enter to close..."
  exit 1
fi

cd "$PROJECT_DIR"

# Clean up stale lock files
rm -f .git/index.lock

# Configure git identity
git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "📂 Staging fastest lap fix files..."
git add src/lib/points.js
git add src/pages/admin/UploadRace.jsx
git add src/pages/Results.jsx

echo ""
echo "📝 Creating commit..."
git commit -m "Fix fastest lap bonus: only award when human has overall fastest lap

- Updated calculateBonuses() to accept full field results and compare
  against all cars (including AI) before awarding fastest lap bonus
- Updated UploadRace.jsx to pass full field results to bonus calculation
- Updated Results.jsx badge logic to verify fastest lap was actually
  awarded before showing the Fast Lap badge
- Race 10 (Talladega) bonus corrected in Supabase"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DONE! Vercel will auto-deploy in ~30 seconds."
echo ""
read -p "Press Enter to close..."
