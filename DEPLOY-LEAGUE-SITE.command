#!/bin/bash
# ============================================
# LONE STAR RUBBIN' LEAGUE - ONE-CLICK DEPLOY
# ============================================
# Just double-click this file to deploy your site!
# It will push your code to GitHub and deploy to Vercel.
# You'll get a live URL to share with the league.
# ============================================

cd ~/Desktop/iracing-league-hub || { echo "ERROR: Could not find iracing-league-hub folder on Desktop"; exit 1; }

echo ""
echo "🏁 LONE STAR RUBBIN' LEAGUE - DEPLOYING..."
echo "============================================"
echo ""

# Step 1: Initialize git if needed
if [ ! -d ".git" ] || [ ! -f ".git/HEAD" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Step 2: Make sure .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'GITIGNORE'
node_modules/
.env
.env.local
.env.*.local
dist/
.vscode/
.idea/
*.swp
*.swo
.DS_Store
*.log
npm-debug.log*
GITIGNORE
fi

# Step 3: Stage and commit
echo "📝 Staging files..."
git add -A
echo "💾 Creating commit..."
git commit -m "Lone Star Rubbin' League - full site" --allow-empty 2>/dev/null || true

# Step 4: Push to GitHub
echo ""
echo "🔗 Setting up GitHub remote..."
# Check if remote already exists
if git remote get-url origin 2>/dev/null; then
    echo "   Remote already configured."
else
    git remote add origin https://github.com/justinellistx/lone-star-rubbin-league.git
fi

echo "📤 Pushing to GitHub..."
echo "   (You may be asked to sign in to GitHub - just follow the prompts)"
git push -u origin main --force

# Step 5: Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo "   (If this is your first time, follow the prompts to sign in)"
echo ""
npx -y vercel --yes --prod 2>&1

echo ""
echo "============================================"
echo "🏆 DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "Your site should be live! Check the Vercel URL above."
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
