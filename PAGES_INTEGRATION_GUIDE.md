# Lone Star Rubbin' League - Pages Integration Guide

## Overview
8 complete public-facing pages have been created for the iRacing league website. All pages feature ESPN/NASCAR-style dark theme styling and include demo data fallbacks.

## Page Files Created

### 1. Home.jsx
**Location:** `/src/pages/Home.jsx` (346 lines)

**Features:**
- SportsCenter-style hero section
- Latest race results display
- Top 5 standings mini-table
- News & highlights section (5 demo stories)
- Next race callout card
- Stats ticker

**Uses:**
- `useNews()`, `useStandings()`, `useSchedule()` hooks
- Demo data when not connected to Supabase

---

### 2. Standings.jsx
**Location:** `/src/pages/Standings.jsx` (342 lines)

**Features:**
- Stage selector tabs (Truck, Xfinity, Cup, Overall)
- Full driver standings table
- Summary stat cards (leader, most wins, best avg, most laps led)
- Expandable points breakdown section

**Uses:**
- `useStandings()` hook
- Demo data with 8 drivers

---

### 3. Results.jsx
**Location:** `/src/pages/Results.jsx` (262 lines)

**Features:**
- Stage selector
- Collapsible race cards
- Race details with stats
- Full race results table

**Uses:**
- `useRaceResults()` hook
- Demo Daytona race data

---

### 4. Teams.jsx
**Location:** `/src/pages/Teams.jsx` (307 lines)

**Features:**
- Team standings table
- Expandable team details
- Individual driver stats per team
- Bonus breakdown section

**Uses:**
- `useTeamStandings()` hook
- Demo data for 4 teams

---

### 5. Drivers.jsx
**Location:** `/src/pages/Drivers.jsx` (234 lines)

**Features:**
- Responsive driver grid
- Search functionality
- Sort options (points, wins, avg finish)
- Driver cards with links to profiles

**Uses:**
- `useDrivers()` hook
- Links to `/drivers/:id` routes

---

### 6. DriverProfile.jsx
**Location:** `/src/pages/DriverProfile.jsx` (487 lines)

**Features:**
- Individual driver page
- 8 stat cards
- Recharts LineChart for finish position trend
- Race-by-race results table
- Dynamic routing with `useParams()`

**Uses:**
- `useDriver()` hook
- Recharts for performance visualization
- Route: `/drivers/:id`

---

### 7. Schedule.jsx
**Location:** `/src/pages/Schedule.jsx` (334 lines)

**Features:**
- 3-stage season schedule
- 36 total races (6 per stage)
- Race status indicators
- Next race highlight
- Schedule statistics

**Uses:**
- `useSchedule()` hook
- Demo data with 6 tracks

---

### 8. NotFound.jsx
**Location:** `/src/pages/NotFound.jsx` (50 lines)

**Features:**
- 404 error page
- Links back to home
- Racing-themed design

**Uses:**
- Simple component, no hooks

---

## Integration Steps

### Step 1: Update App.jsx Router
Add route definitions for all pages:

```jsx
import Home from './pages/Home';
import Standings from './pages/Standings';
import Results from './pages/Results';
import Teams from './pages/Teams';
import Drivers from './pages/Drivers';
import DriverProfile from './pages/DriverProfile';
import Schedule from './pages/Schedule';
import NotFound from './pages/NotFound';

// In your Routes:
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/standings" element={<Standings />} />
  <Route path="/results" element={<Results />} />
  <Route path="/teams" element={<Teams />} />
  <Route path="/drivers" element={<Drivers />} />
  <Route path="/drivers/:id" element={<DriverProfile />} />
  <Route path="/schedule" element={<Schedule />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Step 2: Verify Dependencies
Ensure your project has these installed:
```bash
npm install react-router-dom lucide-react recharts
```

### Step 3: Update Layout.jsx (if needed)
The existing `Layout.jsx` navigation already includes all necessary links:
- Home, Standings, Results, Teams, Drivers, Schedule

### Step 4: Connect to Supabase
Each page has a fallback to demo data. To use real data:
1. Ensure your Supabase database is configured
2. Update `useSupabase.js` hooks to return real data
3. Demo data will automatically be replaced

## Demo Data Included

### Drivers (8 total)
- Justin Ellis (#4) - 245 pts, 1 win
- Blaine Karnes (#14) - 238 pts
- Ryan Ramsey (#88) - 225 pts
- Nik Green (#2) - 212 pts
- Terry Domino (#7) - 198 pts
- Jordan Stancil (#22) - 185 pts
- Nathan Becker (#5) - 172 pts
- Sam Kunnemann (#12) - 158 pts

### Teams (4 total)
- Justin + Nate (leading)
- Blaine + Terry
- Nik + Jordan
- Ryan + Sam

### Tracks (6 total, repeating each stage)
- Daytona
- EchoPark
- CODA
- Phoenix
- Las Vegas
- Darlington

### Season
- 36 total races
- 3 stages (Truck, Xfinity, Cup)
- 6 races per stage

## Color Scheme
All pages use the defined theme colors:
```
Primary: #0a0a0f
Cards: #14141f
Hover: #1a1a2e
Gold Accent: #f5a623
Red Accent: #e63946
Teal Accent: #2ec4b6
Text Primary: #ffffff
Text Secondary: #8a8a9a
Borders: #2a2a3e
```

## Responsive Design
All pages are fully responsive:
- Mobile (< 768px): Single column, stacked layouts
- Tablet (768px - 1024px): 2-column grids
- Desktop (> 1024px): 3-4 column grids

## Features Summary

### Common Features Across All Pages
- Dark theme ESPN/NASCAR styling
- Tailwind CSS for responsive design
- Lucide React icons
- Hover effects with gold accent transitions
- Fallback demo data
- Mobile-friendly navigation

### Unique Features
- **Home**: News carousel, race ticker
- **Standings**: Points breakdown explanation
- **Results**: Expandable race details
- **Teams**: Team bonus calculations
- **Drivers**: Search and sort functionality
- **DriverProfile**: LineChart visualization
- **Schedule**: Stage-grouped layout with status
- **NotFound**: Racing-themed 404

## Testing Demo Data

To test the demo data fallback:
1. Run the app without Supabase connection
2. Navigate to any page
3. You should see realistic demo data

When Supabase is connected, demo data will be replaced automatically.

## Customization Notes

- All pages use inline Tailwind classes for easy styling adjustments
- Demo data is defined at the top of each component for easy updates
- Color values reference CSS variables defined in `index.css`
- All fonts are system fonts (no custom font imports needed)

## Next Steps

1. ✓ Pages created and tested
2. → Add route configuration to App.jsx
3. → Connect to Supabase database
4. → Customize colors or fonts if desired
5. → Add admin editing features
6. → Deploy to production

---

**Total Lines of Code:** 2,362  
**Estimated Time to Integration:** 15-30 minutes  
**Dependencies Required:** react-router-dom, lucide-react, recharts, tailwindcss
