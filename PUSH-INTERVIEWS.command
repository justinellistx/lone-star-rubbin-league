#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🎙️ PUSHING INTERVIEWS + PICK'EM FIX..."
echo ""
echo "1. NEW: Driver Interviews page with driver cards + media room links"
echo "2. NEW: Private media room per driver (/interviews/:driverId)"
echo "3. NEW: Admin Manage Interviews (single + bulk assign)"
echo "4. NEW: ESPN-style story generator (pre-race preview + post-race recap)"
echo "5. NEW: Post-race questions auto-generate from uploaded race results"
echo "6. NEW: Interview hooks in useSupabase.js"
echo "7. NEW: Interviews link in main nav + admin sidebar"
echo "8. FIX: Pick'em FK now references schedule (not races)"
echo "9. FIX: Pick'em leaderboard scoring property names"
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
  src/pages/InterviewRoom.jsx \
  src/pages/admin/ManageInterviews.jsx \
  src/pages/admin/UploadRace.jsx \
  src/lib/storyGenerator.js \
  src/lib/postRaceQuestions.js \
  src/lib/csvParser.js \
  src/hooks/useSupabase.js \
  src/App.jsx \
  src/components/Layout.jsx \
  src/pages/admin/AdminLayout.jsx \
  src/pages/Pickem.jsx \
  src/pages/Rivalries.jsx \
  src/pages/Home.jsx \
  src/components/TrackIcon.jsx \
  src/pages/Game.jsx \
  src/pages/Results.jsx \
  src/pages/Schedule.jsx \
  src/pages/Standings.jsx \
  src/pages/DriverProfile.jsx \
  src/lib/points.js \
  PUSH-INTERVIEWS.command

# Create commit
git commit -m "Add driver interviews system + fix Pick'em submission

Interviews:
- New interview_questions table in Supabase (schedule + driver FK)
- Public /interviews page: driver cards with pending counts + media room links
- Private /interviews/:driverId media room for answering questions
- Only answered interviews shown publicly (unanswered stay private)
- Admin /admin/interviews with single question + bulk assign workflow
- Bulk assign: randomize from NASCAR-style question bank per driver
- ESPN-style story generator: builds articles from interview answers + standings
- Generate Pre-Race Preview button: weaves pre-race quotes into hype article
- Generate Post-Race Recap button: combines results + quotes into recap
- Generated stories auto-publish to News page
- Post-race questions auto-generate on CSV upload from actual race results
- Question generator categorizes drivers (winner, podium, gained/lost spots, etc.)
- Schedule entry auto-linked to race + marked completed on upload
- 9 Bristol pre-race questions seeded (post-race now auto-generated)
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
