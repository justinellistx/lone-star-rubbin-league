#!/bin/bash
# ============================================
# LONE STAR RUBBIN' LEAGUE - FIX & DEPLOY
# ============================================
set -e

cd /Users/justinellis/Desktop/iracing-league-hub

echo ""
echo "🔧 FIXING & DEPLOYING LONE STAR RUBBIN' LEAGUE"
echo "============================================"
echo ""

# Step 1: Remove stale git lock file
echo "🔓 Removing stale git lock file..."
rm -f .git/index.lock
echo "   ✅ Lock file cleared"
echo ""

# Step 2: Stage all files
echo "📝 Staging files..."
git add -A
echo "   ✅ Files staged"
echo ""

# Step 3: Create commit
echo "💾 Creating commit..."
git commit -m "Full Lone Star Rubbin' League site" || echo "   (commit already exists or nothing to commit)"
echo ""

# Step 4: Rename branch to main
echo "🔀 Setting branch to main..."
git branch -M main
echo "   ✅ Branch set to main"
echo ""

# Step 5: Set remote
echo "🔗 Setting up GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/justinellistx/lone-star-rubbin-league.git
echo "   ✅ Remote configured"
echo ""

# Step 6: Push to GitHub
echo "📤 Pushing to GitHub..."
echo "   (You may be asked to sign in to GitHub - follow the prompts)"
git push -u origin main --force
echo "   ✅ Code pushed to GitHub!"
echo ""

# Step 7: Vercel login & deploy
echo "🚀 Logging into Vercel..."
echo "   (A browser window will open - sign in with GitHub)"
npx -y vercel login
echo ""

echo "🚀 Deploying to Vercel..."
npx -y vercel --yes --prod
echo ""

echo "============================================"
echo "🏆 DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "IMPORTANT: Add these environment variables in Vercel Dashboard"
echo "   → Settings → Environment Variables:"
echo ""
echo "   VITE_SUPABASE_URL = https://awdzzzcbxeafakeilxfn.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY = (copy from your .env file)"
echo ""
echo "Then click 'Redeploy' in the Vercel dashboard."
echo ""
read -p "Press Enter to close..."
