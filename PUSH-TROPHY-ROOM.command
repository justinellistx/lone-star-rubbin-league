#!/bin/bash
set -e
cd /Users/justinellis/Desktop/iracing-league-hub

echo "🏆  PUSHING THE TROPHY ROOM..."
echo ""
echo "=== NEW FEATURE: THE TROPHY ROOM ==="
echo "1. Race Winners Shelf — trophy card for each race winner"
echo "2. Stage Champions — individual + team champion displays"
echo "3. Cup Champion — grand champion showcase"
echo "4. Records & Milestones — most wins, laps led, cleanest driver, etc."
echo "5. AI image support — generate/upload cartoon trophy images per race"
echo "6. Auto-pulled winner quotes from post-race interviews"
echo "7. Admin panel: /admin/trophy-room (manage images, quotes)"
echo "8. Empty shelf spots for upcoming races"
echo "9. Supabase tables: trophy_entries, trophy_stage_champions, trophy_cup_champions"
echo "10. Supabase storage bucket: trophies"
echo ""

# Remove stale git lock files if present
rm -f .git/index.lock
rm -f .git/HEAD.lock

# Configure git identity
git config user.name "Justin Ellis"
git config user.email "justinellis@crossfitwillis.com"

# Stage all trophy room files + modified routing/nav files
git add \
  src/pages/TrophyRoom.jsx \
  src/pages/admin/ManageTrophyRoom.jsx \
  src/hooks/useTrophyRoom.js \
  src/App.jsx \
  src/components/Layout.jsx \
  src/pages/admin/AdminLayout.jsx \
  PUSH-TROPHY-ROOM.command

# Create commit
git commit -m "Add The Trophy Room page — race winners, stage champions, records

New Feature: The Trophy Room (/trophy-room)

Race Winners Shelf:
- Trophy card for every completed race with winner portrait spot
- Winner stats: start position, laps led, incidents
- Podium display (top 3) for each race
- Post-race interview quotes auto-pulled from Supabase
- AI-generated cartoon trophy images (via admin panel)
- Real NASCAR trophy names per track (Grandfather Clock, etc.)
- Empty shelf spots for upcoming races

Stage Champions:
- Current points leader display with top-5 preview
- Individual + team champion sections (populated after stage completion)

Cup Champion:
- Premium showcase for season champion (populated end of season)
- Points leader preview while season is active

Records & Milestones:
- Most wins, most laps led, cleanest driver, most poles
- Most top-5 finishes, biggest comeback, single-race laps led record
- All computed live from Supabase race data

Admin Panel (/admin/trophy-room):
- AI prompt generator (copies DALL-E/Midjourney prompt to clipboard)
- Direct image upload to Supabase Storage (trophies bucket)
- Image URL paste support
- Custom quote editor per race
- Stats overview (images added vs missing)

Database:
- trophy_entries (race_id, driver_id, image_url, custom_quote, trophy_name)
- trophy_stage_champions (stage_id, champion_type, driver/team, image)
- trophy_cup_champions (season_year, driver, image, quote)
- RLS: public read, authenticated write

New Files:
- src/pages/TrophyRoom.jsx
- src/pages/admin/ManageTrophyRoom.jsx
- src/hooks/useTrophyRoom.js

Modified Files:
- src/App.jsx (routes for /trophy-room + /admin/trophy-room)
- src/components/Layout.jsx (Trophy Room in More dropdown)
- src/pages/admin/AdminLayout.jsx (Trophy Room in admin sidebar)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" || echo "(already committed)"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ PUSHED! Vercel will auto-redeploy in ~30 seconds."
echo "🌐 Site: https://iracing-league-hub.vercel.app/trophy-room"
echo ""
read -p "Press Enter to close..."
