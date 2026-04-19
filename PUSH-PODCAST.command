#!/bin/bash
cd ~/Desktop/iracing-league-hub

# Remove stale lock
rm -f .git/index.lock

# Git identity
git config user.name "justinellistx"
git config user.email "justinellis@crossfitwillis.com"

# Stage all podcast-related files
git add src/pages/Podcast.jsx
git add src/pages/admin/ManagePodcasts.jsx
git add src/pages/admin/AdminLayout.jsx
git add src/App.jsx
git add src/components/Layout.jsx
git add src/pages/Home.jsx
git add src/hooks/useSupabase.js
git add public/podcasts/
git add MEMORY.md
git add NotebookLM-League-Context.md
git add NotebookLM-Weekly-Prompt.md
git add PUSH-PODCAST.command

# Commit
git commit -m "Add podcast system: admin upload, Supabase storage, custom player

- New podcasts table + storage bucket in Supabase
- Admin panel: ManagePodcasts page with drag-and-drop MP3 upload
  - Episode metadata form (title, track, description, highlights)
  - Publish/unpublish toggle, edit, delete
  - Audio stored in Supabase Storage (public bucket)
- Public Podcast page with ESPN-themed custom audio player
  - Play/pause, seek, skip 15s/30s, volume, download
  - Track icons, episode highlights tags, duration display
  - Graceful fallback when audio not yet uploaded
- PodcastMiniPlayer widget on homepage sidebar
- usePodcasts hook fetches published episodes from Supabase
- Nav link added to main nav bar (between News and Interviews)
- Headphones icon in admin sidebar for podcast management
- NotebookLM context doc + weekly prompt template included"

# Push
git push origin main

echo ""
echo "✅ Podcast system pushed! Vercel will deploy in ~30 seconds."
echo ""
echo "To add an episode:"
echo "  1. Go to Admin > Podcasts"
echo "  2. Click 'New Episode'"
echo "  3. Drop in the MP3 from NotebookLM"
echo "  4. Fill in details and publish"
