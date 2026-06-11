#!/bin/bash
echo "🔍 DEBUGGING STANDINGS.JSX"
echo ""

cd "$HOME/Desktop/iracing-league-hub"

echo "=== 1. Git log (last 5 commits) ==="
git log --oneline -5
echo ""

echo "=== 2. Does HEAD version have bonusPoints? ==="
git show HEAD:src/pages/Standings.jsx | grep -c "bonusPoints" || echo "0 matches"
echo ""

echo "=== 3. Does HEAD version have 'Bonus' column header? ==="
git show HEAD:src/pages/Standings.jsx | grep -n "Bonus\|Pen" | head -10
echo ""

echo "=== 4. Does local file have bonusPoints? ==="
grep -c "bonusPoints" src/pages/Standings.jsx || echo "0 matches"
echo ""

echo "=== 5. Git diff for Standings.jsx ==="
git diff src/pages/Standings.jsx | head -30
echo "(empty means no diff)"
echo ""

echo "=== 6. Current branch and remote ==="
git branch -v
echo ""

echo "=== 7. Vercel deployment check ==="
git remote -v
echo ""

read -p "Press Enter to close..."
