#!/bin/bash
# Push YouTube Highlights feature
# Double-click this file on Mac to deploy

cd "$(dirname "$0")"

# Remove stale lock
rm -f .git/index.lock

# Configure git identity
git config user.email "justinellis@crossfitwillis.com"
git config user.name "Justin Ellis"

echo "=== Pushing YouTube Highlights Feature ==="
echo ""

# Stage all changed files
git add \
  src/pages/admin/ManageHighlights.jsx \
  src/pages/admin/AdminLayout.jsx \
  src/App.jsx \
  src/hooks/useSupabase.js \
  src/pages/Results.jsx \
  src/pages/Home.jsx \
  src/pages/Schedule.jsx \
  src/pages/DriverProfile.jsx \
  src/pages/Podcast.jsx

echo "Staged files:"
git diff --cached --name-only
echo ""

# Commit
git commit -m "feat: YouTube race highlights — admin page, embedded player on Results, links across site

- Added youtube_url column to schedule table (Supabase migration)
- New ManageHighlights.jsx admin page for managing YouTube URLs per race
- Embedded 16:9 YouTube player on Results page when video exists
- YouTube highlight links on Home page, Schedule cards, Driver Profile race table, Podcast episodes
- Updated useRaceResultsByRace hook to include youtube_url from schedule
- Admin sidebar: new Highlights nav item with YouTube icon"

echo ""
echo "Pushing to origin main..."
git push origin main

echo ""
echo "=== Done! Vercel will auto-deploy in ~30 seconds ==="
echo "=== Go to Admin > Highlights to add YouTube URLs ==="
