#!/bin/bash
set -e

echo "=========================================="
echo "  NASCAR.com REDESIGN — PHASE 1 PUSH"
echo "=========================================="
echo ""
echo "This will update:"
echo "  - src/index.css (NASCAR.com color palette)"
echo "  - src/styles/layout.css (nav, ticker, footer)"
echo "  - src/components/Layout.jsx (updated heights)"
echo ""

PROJECT="$HOME/Desktop/iracing-league-hub"
REDESIGN="$HOME/Desktop/redesign"

cd "$PROJECT"
rm -f .git/index.lock

git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "--- Copying redesign files ---"

cp "$REDESIGN/index.css" "$PROJECT/src/index.css"
echo "  Copied index.css"

cp "$REDESIGN/layout.css" "$PROJECT/src/styles/layout.css"
echo "  Copied layout.css"

cp "$REDESIGN/Layout.jsx" "$PROJECT/src/components/Layout.jsx"
echo "  Copied Layout.jsx"

echo ""
echo "--- Checking changes ---"
git diff --stat

echo ""
echo "--- Staging and committing ---"
git add src/index.css src/styles/layout.css src/components/Layout.jsx
git commit -m "Phase 1: NASCAR.com visual redesign — color palette, nav, ticker, footer

- Replace ESPN red (#d00000) with NASCAR blue (#003DA5) as primary accent
- Update nav bar: dark navy background, yellow active indicators, 52px height
- Update ticker: blue STANDINGS label, blue point values
- Update footer: blue top border accent
- New CSS variables: --nascar-blue, --nascar-yellow, --nascar-red, --nascar-black
- White page background, updated card/button/input focus states
- Legacy --espn-* aliases kept for backward compatibility"

echo ""
echo "--- Pushing to GitHub ---"
git push origin main

echo ""
echo "=========================================="
echo "  PHASE 1 DEPLOYED!"
echo "=========================================="
echo "  Vercel will auto-deploy in ~60 seconds."
echo "  Check: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
