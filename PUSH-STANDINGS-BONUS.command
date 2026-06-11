#!/bin/bash
set -e

echo "📊 PUSHING STANDINGS BONUS COLUMNS"
echo ""

PROJECT_DIR="$HOME/Desktop/iracing-league-hub"
FILE="$PROJECT_DIR/src/pages/Standings.jsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Standings.jsx not found"
  read -p "Press Enter to close..."
  exit 1
fi

cd "$PROJECT_DIR"
rm -f .git/index.lock
git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "📂 Patching Standings.jsx..."

python3 << 'PYEOF'
import os, sys

filepath = os.path.expanduser("~/Desktop/iracing-league-hub/src/pages/Standings.jsx")

with open(filepath, 'r') as f:
    content = f.read()

# Check if already patched (look for the SPECIFIC bonus data cell, not just "Bonus" anywhere)
if "driver.bonusPoints" in content:
    print("⏭️  Already patched — skipping")
    sys.exit(0)

# === PATCH 1: Add Bonus + Pen headers after Points header ===
old_h = '''                      <th className="px-4 py-4 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                        Points
                      </th>
                      <th className="px-4 py-4 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                        Dropped'''

new_h = '''                      <th className="px-4 py-4 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                        Points
                      </th>
                      <th className="px-4 py-4 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                        Bonus
                      </th>
                      <th className="px-4 py-4 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                        Pen
                      </th>
                      <th className="px-4 py-4 text-right text-[#6c6d6f] text-xs font-bold uppercase">
                        Dropped'''

if old_h not in content:
    print("❌ Could not find Points/Dropped header block")
    print("DEBUG: searching for 'Points' in th tags...")
    import re
    matches = re.findall(r'Points.*?Dropped', content, re.DOTALL)
    for m in matches[:2]:
        print(repr(m[:200]))
    sys.exit(1)

content = content.replace(old_h, new_h, 1)
print("✅ Added Bonus + Pen header columns")

# === PATCH 2: Add Bonus + Pen data cells after Points data cell ===
old_d = '''                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {driver.droppedPoints > 0 ? ('''

new_d = '''                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {driver.bonusPoints > 0 ? (
                            <span className="text-[#008564] font-semibold">+{driver.bonusPoints % 1 === 0 ? driver.bonusPoints : driver.bonusPoints.toFixed(1)}</span>
                          ) : (
                            <span className="text-[#6c6d6f]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {driver.penaltyPoints < 0 ? (
                            <span className="text-[#cc0000] font-semibold">{driver.penaltyPoints}</span>
                          ) : (
                            <span className="text-[#6c6d6f]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {driver.droppedPoints > 0 ? ('''

if old_d not in content:
    print("❌ Could not find droppedPoints data cell block")
    sys.exit(1)

content = content.replace(old_d, new_d, 1)
print("✅ Added Bonus + Pen data cells")

with open(filepath, 'w') as f:
    f.write(content)

print("✅ File written successfully")
PYEOF

if [ $? -ne 0 ]; then
  echo "❌ Patch failed"
  read -p "Press Enter to close..."
  exit 1
fi

echo ""
echo "📂 Staging..."
git add src/pages/Standings.jsx

echo "📝 Diff check..."
git diff --cached --stat
echo ""

git commit -m "Add bonus/penalty columns to Standings page

- Added Bonus column (green +X) showing total bonus points from kept races
- Added Pen column (red -X) showing incident penalties from kept races
- Fixed Blaine Daytona bonus in Supabase (4.00 -> 0.00, superspeedway)"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DONE! Vercel will auto-deploy in ~30 seconds."
echo ""
read -p "Press Enter to close..."
