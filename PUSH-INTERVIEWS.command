#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🎙️ PUSHING INTERVIEWS + PICK'EM FIX..."
echo ""
echo "1. NEW: Driver Interviews page (pre-race + post-race)"
echo "2. NEW: Admin Manage Interviews (single + bulk assign)"
echo "3. NEW: Interview hooks in useSupabase.js"
echo "4. NEW: Interviews link in main nav"
echo "5. NEW: Interviews link in admin sidebar"
echo "6. FIX: Pick'em FK now references schedule (not races)"
echo "7. FIX: Pick'em leaderboard scoring property names"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage all files
git add \
  src/pages/Interviews.jsx \
  src/pages/admin/ManageInterviews.jsx \
  src/hooks/useSupabase.js \
  src/App.jsx \
  src/components/Layout.jsx \
  src/pages/admin/AdminLayout.jsx \
  src/pages/Pickem.jsx \
  PUSH-INTERVIEWS.command

# Create commit
git commit -m "Add driver interviews system + fix Pick'em submission

Interviews:
- New interview_questions table in Supabase (schedule + driver FK)
- Public /interviews page with Browse + Submit Answer tabs
- Browse: filter by race/type, grouped by race with pre/post sections
- Submit: drivers identify themselves, see pending questions, submit answers
- Admin /admin/interviews with single question + bulk assign workflow
- Bulk assign: randomize from NASCAR-style question bank per driver
- 18 Bristol questions seeded (9 pre-race + 9 post-race, personalized)
- Interviews nav link + admin sidebar link

Pick'em fix:
- Changed pickem_picks FK from races(id) to schedule(id)
- Fixed leaderboard scoring: r.finishPosition + r.id property names
- Added schedule-to-race ID mapping for cross-referencing results" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app"
echo ""
read -p "Press Enter to close..."
