#!/bin/bash
set -e

echo "🚀 TRIGGERING VERCEL DEPLOYMENT"
echo ""

cd "$HOME/Desktop/iracing-league-hub"
rm -f .git/index.lock

git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "📝 Creating trigger commit..."
git commit --allow-empty -m "Trigger Vercel deployment after reconnecting GitHub integration"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DONE! Check Vercel deployments page for new build."
echo ""
read -p "Press Enter to close..."
