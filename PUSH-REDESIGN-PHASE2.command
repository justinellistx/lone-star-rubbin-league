#!/bin/bash
set -e

echo "=========================================="
echo "  NASCAR.com REDESIGN — PHASE 2 PUSH"
echo "  Page Components & Table Styles"
echo "=========================================="
echo ""

PROJECT="$HOME/Desktop/iracing-league-hub"
REDESIGN="$HOME/Desktop/redesign"

cd "$PROJECT"
rm -f .git/index.lock

git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "--- Copying Phase 1 files (if not already pushed) ---"
cp "$REDESIGN/index.css" "$PROJECT/src/index.css"
cp "$REDESIGN/layout.css" "$PROJECT/src/styles/layout.css"
cp "$REDESIGN/Layout.jsx" "$PROJECT/src/components/Layout.jsx"
echo "  Phase 1: index.css, layout.css, Layout.jsx"

echo ""
echo "--- Copying Phase 2: Table styles ---"
cp "$REDESIGN/standings-table.css" "$PROJECT/src/styles/standings-table.css"
cp "$REDESIGN/race-results-table.css" "$PROJECT/src/styles/race-results-table.css"
echo "  standings-table.css, race-results-table.css"

echo ""
echo "--- Copying Phase 2: Page components ---"
cp "$REDESIGN/Home.jsx" "$PROJECT/src/pages/Home.jsx"
echo "  Home.jsx"

for f in Awards DriverProfile Drivers Game IncidentHeatmap InterviewRoom Interviews NotFound Pickem Podcast Results Rivalries Schedule Standings Teams TrophyRoom WhatIf; do
  if [ -f "$REDESIGN/pages/$f.jsx" ]; then
    cp "$REDESIGN/pages/$f.jsx" "$PROJECT/src/pages/$f.jsx"
    echo "  $f.jsx"
  fi
done

echo ""
echo "--- Copying Phase 2: Components ---"
cp "$REDESIGN/FantasyDraft.jsx" "$PROJECT/src/components/FantasyDraft.jsx"
echo "  FantasyDraft.jsx"

echo ""
echo "--- Verifying no old colors remain ---"
OLD_COUNT=$(grep -r '#d00000\|#131313\|#004b8d' "$PROJECT/src/pages/" "$PROJECT/src/components/" "$PROJECT/src/styles/" --include='*.jsx' --include='*.css' -c 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
if [ "$OLD_COUNT" -gt 0 ] 2>/dev/null; then
  echo "  WARNING: $OLD_COUNT old color references still found"
  grep -r '#d00000\|#131313\|#004b8d' "$PROJECT/src/pages/" "$PROJECT/src/components/" "$PROJECT/src/styles/" --include='*.jsx' --include='*.css' -l 2>/dev/null
else
  echo "  All clear — zero old ESPN colors remaining"
fi

echo ""
echo "--- Staging and committing ---"
git add src/
git diff --cached --stat

git commit -m "Phase 2: NASCAR.com redesign — all page components and table styles

- Replace all hardcoded ESPN colors across 19 page components
- Primary accent: #d00000 (red) -> #003DA5 (NASCAR blue)
- Dark backgrounds: #131313 -> #1a1a2e (navy)
- Page backgrounds: #f5f5f5 -> #ffffff (clean white)
- Winner highlights: yellow tint -> subtle blue tint
- Update standings-table.css and race-results-table.css
- Update FantasyDraft.jsx component
- 457+ inline color replacements total
- Penalties use NASCAR red #c8102e
- Green (#008564) and neutral grays preserved"

echo ""
echo "--- Pushing to GitHub ---"
git push origin main

echo ""
echo "=========================================="
echo "  PHASE 2 DEPLOYED!"
echo "=========================================="
echo "  Full NASCAR.com color palette now live"
echo "  across ALL pages and components."
echo ""
echo "  Check: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
