# Lone Star Rubbin' League - Component Documentation

## Overview
ESPN/NASCAR-style dark theme iRacing league website components. Built with React, React Router, Lucide Icons, and Tailwind CSS.

## Color Scheme
- **Primary Background**: `#0a0a0f`
- **Secondary Background**: `#14141f`
- **Tertiary Background**: `#1a1a2e`
- **Accent Yellow**: `#f5a623`
- **Accent Red**: `#e63946`
- **Accent Green/Teal**: `#2ec4b6`
- **Primary Text**: `#ffffff`
- **Secondary Text**: `#8a8a9a`
- **Border Color**: `#2a2a3e`

---

## Component Library

### 1. **Layout.jsx**
Main layout wrapper component with navigation, content area, and footer.

**Location**: `src/components/Layout.jsx`
**Styles**: `src/styles/layout.css`

**Features**:
- Fixed top navigation bar with dark theme
- League logo/name "LONE STAR RUBBIN'" with trophy icon
- Desktop navigation with active state styling (yellow underline)
- Mobile hamburger menu (responsive)
- Admin link with special styling
- Main content area with proper padding
- Footer with league name and season info

**Props**:
- `children` - Page content to render

**Usage**:
```jsx
<Layout>
  <Home />
</Layout>
```

**Navigation Links**:
- Home (`/`)
- Standings (`/standings`)
- Results (`/results`)
- Teams (`/teams`)
- Drivers (`/drivers`)
- Schedule (`/schedule`)
- Admin (`/admin`)

**Icons Used**:
- `Trophy` - Brand logo
- `Menu` / `X` - Mobile menu toggle

---

### 2. **StandingsTable.jsx**
Reusable standings table component for driver/team standings.

**Location**: `src/components/StandingsTable.jsx`
**Styles**: `src/styles/standings-table.css`

**Features**:
- Position with change indicator (↑ green, ↓ red, - no change)
- Top 3 positions with medal highlights (gold, silver, bronze)
- ESPN broadcast-style bold numbers for points
- Responsive horizontal scroll on mobile
- Hover effects on rows
- Responsive column hiding on smaller screens

**Columns**:
- Position (with change indicator)
- Driver
- Team (optional)
- Points
- Wins
- Top 5
- Top 10
- Avg Finish
- Laps Led
- Incidents

**Props**:
```jsx
{
  standings: Array,    // Array of standing objects
  showTeam: boolean,   // Show/hide team column (default: true)
  title: string        // Table title (default: "Standings")
}
```

**Usage**:
```jsx
<StandingsTable
  standings={standings}
  showTeam={true}
  title="Driver Standings"
/>
```

**Data Structure**:
```jsx
{
  id: string,
  position: number,
  positionChange: number,    // +/- or null
  driverName: string,
  team: string,
  points: number,
  wins: number,
  top5: number,
  top10: number,
  avgFinish: number,
  lapsLed: number,
  incidents: number
}
```

**Icons Used**:
- `TrendingUp` - Position increase
- `TrendingDown` - Position decrease

---

### 3. **RaceResultsTable.jsx**
Race results table component showing finishing positions and statistics.

**Location**: `src/components/RaceResultsTable.jsx`
**Styles**: `src/styles/race-results-table.css`

**Features**:
- Winner row highlighted in gold
- DNF/Retired rows shown in muted style with reduced opacity
- Status badges with color coding (Running, Retired, Disqualified)
- Fastest lap highlighting
- Responsive design with mobile optimization
- Winner indicator on finish position badge

**Columns**:
- Position (with winner badge)
- Driver
- Start Position
- Interval
- Laps Led
- Fastest Lap
- Laps Completed
- Incidents
- Points
- Bonus Points
- Status

**Props**:
```jsx
{
  results: Array,       // Array of result objects
  raceName: string,     // Race name (default: "Race Results")
  raceDate: string      // Race date for display
}
```

**Usage**:
```jsx
<RaceResultsTable
  results={raceResults}
  raceName="Atlanta 500"
  raceDate="April 5, 2026"
/>
```

**Data Structure**:
```jsx
{
  id: string,
  finishPosition: number,
  driverName: string,
  startPosition: number,
  interval: string,
  lapsLed: number,
  fastestLap: string,
  lapsCompleted: number,
  incidents: number,
  points: number,
  bonusPoints: number,
  status: string        // "Running", "Retired", "Disqualified", etc.
}
```

**Status Colors**:
- Running: Yellow
- Retired/DNF: Red (muted)
- Disqualified: Red (dark)
- Finished: Green

---

### 4. **StatCard.jsx**
Reusable stat card component for displaying key metrics.

**Location**: `src/components/StatCard.jsx`

**Features**:
- Large bold value display
- Icon support from lucide-react
- Optional change indicator (green ↑ or red ↓)
- Dark card with gradient background
- Hover effects with lift animation
- Label underneath value

**Props**:
```jsx
{
  label: string,              // Stat label (e.g., "Total Wins")
  value: string | number,     // Main value to display
  icon: React.Component,      // Lucide icon component
  change: number,             // Optional change (+/-)
  changeLabel: string         // Optional change description
}
```

**Usage**:
```jsx
<StatCard
  label="Total Wins"
  value={12}
  icon={Trophy}
  change={+2}
  changeLabel="vs last season"
/>
```

**CSS Classes**:
- `.stat-card` - Main card styling with gradient and hover

---

### 5. **DriverCard.jsx**
Driver profile card component with key stats and profile link.

**Location**: `src/components/DriverCard.jsx`
**Styles**: `src/styles/driver-card.css`

**Features**:
- Racing-styled with yellow accent border on left
- Car number badge with gradient (yellow to red)
- Driver name and team name
- Stats grid showing: Wins, Top 5, Avg Finish, Points
- Link to driver profile page
- Hover animation with lift effect
- Responsive grid layout

**Props**:
```jsx
{
  driver: Object,       // Driver object with id, name, team, carNumber
  stats: Object         // Stats object with wins, top5, avgFinish, points
}
```

**Usage**:
```jsx
<DriverCard
  driver={{
    id: 1,
    driverName: "John Doe",
    carNumber: 42,
    team: "Team Name"
  }}
  stats={{
    wins: 5,
    top5: 12,
    avgFinish: 8.5,
    points: 1250
  }}
/>
```

**Icons Used**:
- `Trophy` - Wins and Points
- `TrendingUp` - Top 5 finishes
- `Target` - Average finish

---

### 6. **NewsCard.jsx**
News/highlight card component for articles and announcements.

**Location**: `src/components/NewsCard.jsx`
**Styles**: `src/styles/news-card.css`

**Features**:
- Optional image with overlay gradient
- Category badge with color coding (News, Highlight, Recap, Announcement)
- ESPN headline style title
- Subtitle with line clamping (2 lines)
- Published date formatting
- "Read More" CTA with arrow animation
- Internal link or external link support
- Hover effects with image zoom

**Props**:
```jsx
{
  article: Object       // Article object with title, subtitle, date, etc.
}
```

**Usage**:
```jsx
<NewsCard
  article={{
    title: "Driver Wins at Atlanta",
    subtitle: "Amazing performance in challenging conditions",
    category: "Highlight",
    date: "2026-04-05",
    image: "https://...",
    link: "/news/article-slug"
  }}
/>
```

**Category Colors**:
- **News** (default): Yellow badge
- **Highlight**: Red badge
- **Recap**: Green badge
- **Announcement**: Purple badge

---

### 7. **LoadingSpinner.jsx**
Racing-themed loading spinner component.

**Location**: `src/components/LoadingSpinner.jsx`
**Styles**: `src/styles/loading-spinner.css`

**Features**:
- Three rotating rings with yellow and red racing colors
- Size variants: small, medium (default), large
- Optional full-page overlay mode
- Loading text animation
- Smooth rotation animations
- Responsive sizing

**Props**:
```jsx
{
  size: string,         // "small" | "medium" | "large" (default: "medium")
  fullPage: boolean     // Full-page overlay mode (default: false)
}
```

**Usage**:
```jsx
// Inline spinner
<LoadingSpinner size="medium" />

// Full-page spinner
<LoadingSpinner size="medium" fullPage={true} />
```

---

## Integration Guide

### Layout Integration
Wrap your application with the Layout component:

```jsx
// App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Standings from './pages/Standings';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/standings" element={<Standings />} />
        {/* ... more routes */}
      </Routes>
    </Layout>
  );
}
```

### Responsive Breakpoints
- **Desktop**: 1024px and up (full navigation)
- **Tablet**: 768px to 1023px (optimized layout)
- **Mobile**: Below 768px (hamburger menu, stacked content)

### CSS Imports
All components automatically import their CSS files. Ensure the `src/styles/` directory is properly set up in your build configuration.

### Icon Usage
All icons are from `lucide-react`. Install if not already:
```bash
npm install lucide-react
```

---

## Styling Customization

### Using CSS Variables
All colors are defined as CSS variables in `src/index.css`:

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #14141f;
  --bg-tertiary: #1a1a2e;
  --accent-yellow: #f5a623;
  --accent-red: #e63946;
  --accent-green: #2ec4b6;
  --text-primary: #ffffff;
  --text-secondary: #8a8a9a;
  --border-color: #2a2a3e;
}
```

### Tailwind Classes
Components use custom Tailwind classes defined in `tailwind.config.js`. All components are styled with utility classes for consistency.

---

## File Structure
```
src/
├── components/
│   ├── Layout.jsx
│   ├── StandingsTable.jsx
│   ├── RaceResultsTable.jsx
│   ├── StatCard.jsx
│   ├── DriverCard.jsx
│   ├── NewsCard.jsx
│   └── LoadingSpinner.jsx
├── styles/
│   ├── layout.css
│   ├── standings-table.css
│   ├── race-results-table.css
│   ├── driver-card.css
│   ├── news-card.css
│   └── loading-spinner.css
└── index.css
```

---

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Dependencies
- React 18+
- React Router 6+
- Lucide React
- Tailwind CSS 3+
