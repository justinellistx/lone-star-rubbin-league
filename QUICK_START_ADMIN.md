# Quick Start - Admin Panel Integration

## Step 1: Update Your App.jsx

Add these imports at the top:
```jsx
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadRace from './pages/admin/UploadRace';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageSchedule from './pages/admin/ManageSchedule';
import ManageNews from './pages/admin/ManageNews';
```

Add these routes to your router configuration:
```jsx
const router = createBrowserRouter([
  // ... your existing routes ...
  
  // Admin login (public)
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  
  // Admin protected routes
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
]);
```

## Step 2: Create Supabase Admin User

In Supabase:
1. Go to Authentication > Users
2. Create a new user with email and password
3. User can now login at `/admin/login`

## Step 3: Test the Routes

Navigate to:
- `/admin/login` - Login page
- `/admin/dashboard` - After login
- `/admin/upload-race` - Upload CSV
- `/admin/drivers` - Manage drivers
- `/admin/schedule` - Manage races
- `/admin/news` - Manage articles

## File Locations

All admin files are in:
```
/src/pages/admin/
  ├── AdminLogin.jsx        (Login page)
  ├── AdminLayout.jsx       (Layout wrapper)
  ├── AdminDashboard.jsx    (Dashboard)
  ├── UploadRace.jsx        (CSV upload)
  ├── ManageDrivers.jsx     (Driver CRUD)
  ├── ManageSchedule.jsx    (Schedule CRUD)
  └── ManageNews.jsx        (News CRUD)
```

## Key Features

### Login Flow
- Email/password authentication
- Supabase session management
- Auto-redirect if not authenticated
- Auto-redirect to dashboard on success

### Dashboard
- Shows stats: total races, active drivers, stage
- Recent uploads list
- Quick access buttons to all admin pages

### Upload Race
1. Upload iRacing CSV file (drag & drop)
2. Select stage and race number
3. Preview first 10 results with calculated points
4. Click "Confirm & Upload" to save all results
5. Automatic driver mapping via cust_id

### Manage Drivers
- Add drivers with name, car number, iRacing ID, team
- Edit driver information
- Delete drivers
- Toggle active/inactive

### Manage Schedule
- Add races to schedule
- Set track, date, series, stage
- Edit schedule entries
- Delete entries
- Track status: upcoming/completed/cancelled

### Manage News
- Create articles with title, subtitle, body
- Choose category: news/highlight/recap/announcement
- Add image URL
- Publish/unpublish with toggle
- Edit existing articles
- Delete articles

## Database Tables Required

Your Supabase should have these tables:
- `drivers` - Driver info
- `teams` - Team data
- `stages` - League stages
- `races` - Race records
- `race_results` - Individual race results
- `schedule` - Pre-planned races
- `news` - Articles
- `auth_users` - For login (auto-created by Supabase)

## Theme & Styling

All components use:
- Tailwind CSS dark theme
- Color scheme: navy background (#0a0a0f), gold accents (#f5a623)
- Responsive grid layouts
- Lucide React icons

## Troubleshooting

**"Cannot find module" errors:**
- Make sure all files are in `/src/pages/admin/`
- Check import paths match your project structure

**Authentication not working:**
- Verify Supabase credentials in .env
- Check user exists in Supabase Auth > Users
- Clear browser cookies/cache

**CSV upload failing:**
- Verify drivers exist with matching cust_id
- Check CSV format matches iRacing export
- Review browser console for detailed errors

**Supabase errors:**
- Check RLS policies allow authenticated users
- Verify table names match exactly (drivers, races, etc.)
- Check Supabase connection string

## Next: Optional Enhancements

After basic setup works, consider:
- Adding database triggers for standings recalculation
- Search/filter on driver and article lists
- Batch driver import from CSV
- Export race results
- Activity logging for admin actions
- More detailed error messages

---

That's it! Your admin panel is ready to use.
