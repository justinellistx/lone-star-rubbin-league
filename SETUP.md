# iRacing League Manager - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **A Supabase account** - [Free tier available](https://supabase.com)
- **A Vercel account** - [Free tier available](https://vercel.com)
- **GitHub account** - For version control and Vercel deployment

---

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in the details:
   - **Name**: `iracing-league` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
4. Click **Create new project** and wait for it to initialize (2-3 minutes)

### 1.2 Create the Database Schema

1. Once your project is ready, go to the **SQL Editor** tab
2. Click **New query**
3. Open the file `supabase-schema.sql` from the project root
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute
7. Verify all tables are created (you should see tables like `seasons`, `stages`, `races`, `drivers`, etc.)

### 1.3 Enable Email Authentication

1. Go to **Authentication** in the left sidebar
2. Click **Settings**
3. Under **Email Auth**, toggle **Enable Email signups** to ON
4. Scroll down and enable **Email/Password** authentication
5. Click **Save**

### 1.4 Create Your Admin User

1. Go to **Authentication > Users** tab
2. Click **Add user**
3. Enter:
   - **Email**: Your admin email (e.g., admin@example.com)
   - **Password**: Create a strong password
4. Click **Create user**
5. Note your email and password - you'll use these to log in to the admin panel

### 1.5 Get Your Credentials

1. Go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values - you'll need them next:
   - **Project URL** (under "Project Details")
   - **anon public** (under "Project API keys")
   - **service_role secret** (optional, for server-side operations)

---

## Step 2: Local Development Setup

### 2.1 Clone and Install

```bash
# Clone the repository (or navigate to existing project)
cd /path/to/iracing-league

# Install dependencies
npm install
```

### 2.2 Configure Environment Variables

1. In the project root, find the `.env.example` file
2. Copy it to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_KEY=your-service-role-secret-key
   ```

   Replace:
   - `https://your-project-id.supabase.co` with your Project URL from Step 1.5
   - `your-anon-public-key` with your anon key from Step 1.5
   - `your-service-role-secret-key` with your service role secret (optional, for scripts)

### 2.3 Seed Initial Data

Run the migration script to populate your database with:
- 8 drivers
- 4 teams
- 1 season (2026 Lone Star Rubbin')
- 3 stages with placeholder races

```bash
node scripts/migrate-from-sheets.js
```

You should see output like:
```
Starting migration...

Seeding drivers...
  ✓ Justin Ellis4
  ✓ Blaine Karnes
  ...

✅ Migration complete!

Summary:
  - 8 drivers seeded
  - 4 teams created
  - 1 season with 3 stages
  - ...
```

### 2.4 Start Local Development

```bash
npm run dev
```

The application will start at `http://localhost:5173`

Visit these pages to verify:
- **Public Standings**: http://localhost:5173/standings
- **Admin Login**: http://localhost:5173/admin/login
- **Admin Panel**: http://localhost:5173/admin/upload (after logging in)

---

## Step 3: Upload Existing Race Results

Once the app is running locally, you'll upload the 6 existing race results from iRacing.

### 3.1 Prepare Race CSVs

For each of the 6 completed races, you'll need to export a CSV file from iRacing:

**From iRacing Results:**
1. Go to **My Results** in iRacing
2. Find the race result
3. Click **Export** or **Download CSV**
4. Save as `[Track]-[Date].csv` (e.g., `Daytona-2026-02-12.csv`)

The CSV should have columns like:
- Finish Position
- Driver Name
- Incidents
- Laps Led
- (other stats)

### 3.2 Upload via Admin Panel

1. Log into the admin panel: http://localhost:5173/admin/login
   - Email: The admin email you created in Step 1.4
   - Password: The password you created

2. Go to **Upload Race**

3. For each of the 6 existing races, upload the CSV:
   - **Stage**: Select "Stage 1"
   - **Race Number**: 1-6 (corresponds to Daytona through Darlington)
   - **CSV File**: Select the exported CSV file
   - Click **Upload and Parse**

4. Review the parsed results:
   - Verify driver names match exactly
   - Check that positions and incidents are correct
   - The system will automatically calculate points based on:
     - Finish position
     - Incidents (penalties applied)
     - Any bonus points

5. Click **Save Results** to confirm

6. After uploading all 6 races, verify the standings calculate correctly:
   - Visit http://localhost:5173/standings
   - Check that driver points are tallied
   - Check that team standings are calculated (best 9 finishes per driver per stage)

---

## Step 4: Deploy to Vercel

### 4.1 Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: iRacing league manager"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/your-username/iracing-league.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 4.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** > **Project**
3. Select your `iracing-league` repository
4. Click **Import**
5. On the "Configure Project" page:
   - **Framework**: Select **Vite**
   - **Root Directory**: Leave as `.`
6. Click **Environment Variables** and add:
   ```
   VITE_SUPABASE_URL = https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-public-key
   ```
7. Click **Deploy**

### 4.3 Verify Deployment

Once deployed:
1. Vercel will provide you with a live URL (e.g., `https://iracing-league.vercel.app`)
2. Visit the URL to verify:
   - Public standings page loads
   - Admin login works
   - You can upload race results

---

## Weekly Workflow: After Each Race

Once set up, here's the workflow after each race:

### 1. Export Race Results from iRacing

In iRacing **My Results**:
- Find the completed race
- Export/Download as CSV
- Save with a descriptive name

### 2. Log Into Admin Panel

Navigate to: `https://your-vercel-url.vercel.app/admin/login` (or `http://localhost:5173/admin/login` locally)

### 3. Upload Race Results

1. Click **Upload Race**
2. Select the appropriate **Stage** and **Race Number**
3. Upload the CSV file
4. Review the parsed results
5. Click **Confirm** to save

### 4. Verify Standings Update

1. Go to **Standings** page
2. Check:
   - Driver points are updated
   - Team points are calculated correctly
   - Incident penalties applied correctly
   - Drop races handled properly (worst 3 per stage)

---

## Points System Reference

### Finish Position Points (NASCAR Format)

| Position | Points |
|----------|--------|
| 1st      | 40     |
| 2nd      | 35     |
| 3rd      | 34     |
| 4th      | 33     |
| 5th      | 32     |
| ...      | ...    |
| 40th+    | 1      |

### Bonus Points

- **Pole Position**: +2 points
- **Fastest Lap**: +1 point
- **Most Laps Led**: +2 points
- **Lowest Incidents**: +2 points (fewest incidents in the race)
- **Clean Race**: +1 point (0 incidents)

### Incident Penalties

Penalties are applied on top of the finish position:

- **5-8 incidents**: -1 point per incident over 4
  - Example: 6 incidents = -2 points (2 over 4)
- **9-12 incidents**: -2 points per incident over 8
  - Example: 10 incidents = -4 points (2 over 8)
- **13+ incidents**: -3 points per incident over 12
  - Example: 15 incidents = -9 points (3 over 12)

### Stage Scoring

- Each stage consists of 12 races
- **Drops**: Each driver can drop (ignore) their worst 3 race finishes per stage
- **Team Scoring**: A team's score is the best 9 race finishes from each team member (18 total races per team, best 9 used)

---

## Troubleshooting

### "Missing Supabase credentials"
- Check that `.env` file exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart `npm run dev`

### "CSV upload fails with driver name mismatch"
- Ensure driver names in the CSV exactly match the seeded driver names
- Seeded drivers: Justin Ellis4, Blaine Karnes, Ryan Ramsey, Nik Green2, Terry Domino, Jordan Stancil, Nathan Becker, Sam Kunnemann
- Check for extra spaces or capitalization differences

### "Standings not calculating correctly"
- Verify the migration script ran successfully (`node scripts/migrate-from-sheets.js`)
- Check that all 6 race CSVs were uploaded for Stage 1
- Verify database schema was applied correctly via SQL Editor

### "Vercel deployment shows blank page"
- Ensure environment variables are set in Vercel project settings
- Check that `vercel.json` is in the project root
- Verify the public standings path is `/standings` (check vite.config.js)

---

## File Structure Reference

```
iracing-league/
├── src/
│   ├── components/           # React components
│   ├── pages/                # Route pages
│   ├── lib/                  # Utility functions and Supabase client
│   └── App.jsx               # Main app component
├── scripts/
│   └── migrate-from-sheets.js # Initial data seeding script
├── supabase-schema.sql       # Database schema (run in SQL Editor)
├── .env.example              # Environment variables template
├── .env                      # Your local environment variables (don't commit!)
├── vercel.json               # Vercel SPA configuration
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite build configuration
└── SETUP.md                  # This file
```

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

---

## Next Steps After Setup

1. Customize the league name and settings in the admin panel
2. Add team logos/images if desired
3. Set up automated weekly reminders for race uploads
4. Share the public standings link with league members
5. Monitor performance and adjust incident penalties as needed

Good luck with your league!
