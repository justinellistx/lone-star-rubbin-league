# Quick Start Guide - Lone Star Rubbin' League Components

## Component Quick Reference

### 1. Layout (Main Container)
```jsx
import Layout from './components/Layout';

<Layout>
  <YourPageContent />
</Layout>
```

### 2. Standings Table
```jsx
import StandingsTable from './components/StandingsTable';

<StandingsTable
  standings={[
    {
      id: 1,
      position: 1,
      positionChange: 0,
      driverName: "John Doe",
      team: "Team Name",
      points: 1250,
      wins: 5,
      top5: 12,
      top10: 18,
      avgFinish: 8.5,
      lapsLed: 425,
      incidents: 2
    }
  ]}
  showTeam={true}
  title="Driver Standings"
/>
```

### 3. Race Results Table
```jsx
import RaceResultsTable from './components/RaceResultsTable';

<RaceResultsTable
  results={[
    {
      id: 1,
      finishPosition: 1,
      driverName: "John Doe",
      startPosition: 3,
      interval: "Leader",
      lapsLed: 50,
      fastestLap: "1:45.234",
      lapsCompleted: 50,
      incidents: 0,
      points: 40,
      bonusPoints: 5,
      status: "Finished"
    }
  ]}
  raceName="Atlanta 500"
  raceDate="April 5, 2026"
/>
```

### 4. Stat Card
```jsx
import StatCard from './components/StatCard';
import { Trophy } from 'lucide-react';

<StatCard
  label="Total Wins"
  value={12}
  icon={Trophy}
  change={+2}
  changeLabel="vs last season"
/>
```

### 5. Driver Card
```jsx
import DriverCard from './components/DriverCard';

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

### 6. News Card
```jsx
import NewsCard from './components/NewsCard';

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

### 7. Loading Spinner
```jsx
import LoadingSpinner from './components/LoadingSpinner';

// Inline
<LoadingSpinner size="medium" />

// Full page
<LoadingSpinner size="large" fullPage={true} />
```

## File Locations

### Components
- `/src/components/Layout.jsx`
- `/src/components/StandingsTable.jsx`
- `/src/components/RaceResultsTable.jsx`
- `/src/components/StatCard.jsx`
- `/src/components/DriverCard.jsx`
- `/src/components/NewsCard.jsx`
- `/src/components/LoadingSpinner.jsx`

### Stylesheets
- `/src/styles/layout.css`
- `/src/styles/standings-table.css`
- `/src/styles/race-results-table.css`
- `/src/styles/driver-card.css`
- `/src/styles/news-card.css`
- `/src/styles/loading-spinner.css`

### Config
- `/src/index.css` - Theme colors and global styles
- `tailwind.config.js` - Tailwind configuration

## Navigation Structure

The Layout component includes navigation to:
- `/` - Home
- `/standings` - Standings page
- `/results` - Race results
- `/teams` - Teams page
- `/drivers` - Drivers page
- `/schedule` - Race schedule
- `/admin` - Admin panel

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Desktop | 1024px+ | Full navigation, all columns visible |
| Tablet | 768px - 1023px | Optimized layout, some columns hidden |
| Mobile | < 768px | Hamburger menu, stacked layout |

## Color Reference

| Use | Color | Hex |
|-----|-------|-----|
| Primary Background | Dark Purple | #0a0a0f |
| Cards Background | Dark Blue | #14141f |
| Hover Background | Darker Blue | #1a1a2e |
| Accent | Gold | #f5a623 |
| Error | Red | #e63946 |
| Success | Teal | #2ec4b6 |
| Text | White | #ffffff |
| Text Secondary | Gray | #8a8a9a |
| Border | Dark | #2a2a3e |

## Common Props Pattern

Most components follow this pattern:
```jsx
// Data objects
standings = [{
  id: unique_identifier,
  position: number,
  driverName: string,
  team: string,
  points: number,
  ...otherStats
}]

// Display props
title: string
showTeam: boolean
fullPage: boolean
size: "small" | "medium" | "large"
```

## Icons Used (from lucide-react)

- `Trophy` - Wins, achievements
- `Flag` - Racing, finish
- `Users` - Teams, drivers
- `Calendar` - Schedule
- `Shield` - Admin, protection
- `Menu` / `X` - Mobile menu
- `TrendingUp` / `TrendingDown` - Change indicators
- `Target` - Average finish

## Tips & Best Practices

1. **Always wrap pages with Layout**
   ```jsx
   // ✓ Correct
   <Layout><HomePage /></Layout>

   // ✗ Wrong
   <HomePage />
   ```

2. **Use consistent data structure**
   - Follow the examples in each component's props section
   - Include all required fields

3. **Mobile-first responsive design**
   - Components automatically hide/show columns
   - Tables scroll horizontally on small screens
   - Menu converts to hamburger on mobile

4. **Color coding for status**
   - Green/Teal: Positive, success
   - Yellow: Accent, primary
   - Red: Warning, error, issues
   - Gray: Secondary, muted

5. **Images in NewsCard**
   - Use 16:9 aspect ratio for best appearance
   - Always provide fallback when image missing
   - External images should be optimized

6. **Performance tips**
   - Use LoadingSpinner while fetching data
   - Lazy load images in NewsCard
   - Paginate large standings/results tables

## Example Page Layout

```jsx
import Layout from './components/Layout';
import StandingsTable from './components/StandingsTable';
import StatCard from './components/StatCard';
import { Trophy, Award, Target } from 'lucide-react';

export default function StandingsPage() {
  return (
    <Layout>
      {/* Stat cards header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Leader" value="42 Pts" icon={Trophy} />
        <StatCard label="Races" value={10} icon={Award} />
        <StatCard label="Avg Finish" value="8.5" icon={Target} />
      </div>

      {/* Standings table */}
      <StandingsTable standings={standings} title="2026 Season Standings" />
    </Layout>
  );
}
```
