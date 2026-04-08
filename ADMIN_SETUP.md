# Admin Panel Setup Guide

## Files Created

All admin panel files have been created in `/src/pages/admin/`:

### Core Admin Files:
1. **AdminLogin.jsx** - Password-protected login page
   - Email/password authentication via Supabase
   - Redirects to dashboard on successful login
   - Dark theme styling with gold accent

2. **AdminLayout.jsx** - Main layout wrapper
   - Authentication check and redirect
   - Collapsible sidebar with navigation
   - User info display
   - Logout functionality

3. **AdminDashboard.jsx** - Admin home page
   - Quick stats: total races, active drivers, current stage
   - Recent uploads list
   - Quick action buttons linking to all admin pages

### Management Pages:
4. **UploadRace.jsx** - CSV race results upload
   - Drag & drop CSV upload
   - iRacing CSV parsing with Papa Parse
   - Results preview with calculated points
   - Stage and race number selection
   - Batch upload to race_results table
   - Uses point calculation engine

5. **ManageDrivers.jsx** - Driver management
   - Add new drivers with name, car number, iRacing ID, team assignment
   - Edit driver information
   - Delete drivers
   - Toggle active/inactive status
   - View all driver records

6. **ManageSchedule.jsx** - Race schedule editor
   - Add new races to schedule
   - Edit existing race details (date, track, series, stage)
   - Delete schedule entries
   - View schedule status (upcoming/completed/cancelled)

7. **ManageNews.jsx** - News article manager
   - Create and edit news articles
   - Article categories: news, highlight, recap, announcement
   - Publish/unpublish toggle
   - Rich text body with image URL support
   - Article list with preview

## Routing Setup Required

Add these routes to your App.jsx or main router configuration:

```jsx
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadRace from './pages/admin/UploadRace';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageSchedule from './pages/admin/ManageSchedule';
import ManageNews from './pages/admin/ManageNews';

// Protected admin routes (wrapped in AdminLayout)
{
  path: '/admin',
  element: <AdminLayout />,
  children: [
    { path: 'dashboard', element: <AdminDashboard /> },
    { path: 'upload-race', element: <UploadRace /> },
    { path: 'drivers', element: <ManageDrivers /> },
    { path: 'schedule', element: <ManageSchedule /> },
    { path: 'news', element: <ManageNews /> },
  ],
},
// Public login route
{
  path: '/admin/login',
  element: <AdminLogin />,
}
```

## Features Implemented

### AdminLogin
- Email/password Supabase authentication
- Error handling for invalid credentials
- Auto-redirect to dashboard on success
- Clean dark-themed login form

### AdminLayout
- Session-based auth checking via Supabase
- Collapsible sidebar navigation
- Active route highlighting
- Quick access to all admin pages
- Logout with redirect to login
- Email display in sidebar

### AdminDashboard
- Fetches stats from Supabase
- Displays total races, active drivers, current stage
- Shows 5 most recent race uploads
- Quick action buttons for all admin functions
- Status indicators for races

### UploadRace (Most Complex)
- File upload with drag & drop
- CSV parsing using parseIRacingCSV() from lib
- Points calculation using points engine
- Live preview of first 10 results (shows all will upload)
- Points breakdown: position + bonuses + incident penalties
- Creates race record and inserts all race_results
- Maps driver cust_id to driver id in database
- Status indicators: parsing → previewing → uploading → success
- Error handling for missing drivers

### ManageDrivers
- List all drivers in paginated table
- Add new driver form with validation
- Edit existing driver details
- Delete driver (with confirmation)
- Toggle driver active/inactive status
- Team assignment support
- Car number and iRacing ID tracking

### ManageSchedule
- View all scheduled races
- Add new races with stage/track/date/series
- Edit schedule entries
- Delete entries with confirmation
- Status tracking: upcoming/completed/cancelled
- Race numbering per stage

### ManageNews
- Create articles with title, subtitle, body, category
- Categories: news, highlight, recap, announcement
- Optional image URL support
- Publish/unpublish articles
- Edit existing articles
- Delete articles with confirmation
- Article list with category badges and dates

## Theme Colors Used

- **Background**: `bg-[#0a0a0f]`
- **Cards**: `bg-[#14141f]`
- **Hover**: `bg-[#1a1a2e]`
- **Gold Accent**: `text-[#f5a623]`
- **Red**: `text-[#e63946]`
- **Teal**: `text-[#2ec4b6]`
- **Secondary Text**: `text-[#8a8a9a]`
- **Borders**: `border-[#2a2a3e]`

## Dependencies Used

- **React** - UI framework
- **React Router** - Navigation
- **Supabase** - Database and auth
- **Papa Parse** - CSV parsing
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

## Security Notes

1. All admin routes are protected by AdminLayout auth check
2. Supabase session stored client-side
3. Redirect to login if session invalid
4. Admin users managed through Supabase auth_users table
5. All data operations go through Supabase (no client-side DB access)

## Next Steps

1. Set up routing in your main App.jsx
2. Ensure Supabase tables exist (drivers, races, race_results, schedule, news, stages, teams)
3. Create admin user accounts in Supabase Auth
4. Test login flow
5. Verify CSV parsing with sample iRacing export
6. Set up database triggers for standings recalculation (optional)
