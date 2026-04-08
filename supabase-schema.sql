-- ============================================
-- LONE STAR RUBBIN' LEAGUE - Supabase Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  car_number INTEGER,
  car_id INTEGER,
  cust_id INTEGER UNIQUE,
  team_id UUID REFERENCES teams(id),
  avatar_url TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  driver_1_id UUID,
  driver_2_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys after both tables exist
ALTER TABLE teams ADD CONSTRAINT fk_driver_1 FOREIGN KEY (driver_1_id) REFERENCES drivers(id);
ALTER TABLE teams ADD CONSTRAINT fk_driver_2 FOREIGN KEY (driver_2_id) REFERENCES drivers(id);

-- Seasons table
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,               -- e.g. "2026 Lone Star Rubbin'"
  league_id INTEGER,                -- iRacing league ID
  year INTEGER NOT NULL,
  total_races INTEGER DEFAULT 36,
  drops_per_stage INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stages table (Truck, Xfinity, Cup)
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 3),
  name TEXT NOT NULL,               -- e.g. "Truck Series"
  series TEXT NOT NULL,             -- e.g. "NASCAR Truck"
  total_races INTEGER DEFAULT 12,
  drops_allowed INTEGER DEFAULT 3,
  team_best_finishes INTEGER DEFAULT 9,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, stage_number)
);

-- Tracks table
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT,
  config TEXT,                      -- track configuration
  length_miles NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Races table
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id),
  race_number INTEGER NOT NULL,     -- race # within the stage (1-12)
  race_date DATE NOT NULL,
  track_name TEXT NOT NULL,         -- denormalized for easy display
  series TEXT,
  session_id TEXT,                  -- iRacing session ID
  total_laps INTEGER,
  caution_laps INTEGER DEFAULT 0,
  lead_changes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stage_id, race_number)
);

-- Race Results table (one row per driver per race)
CREATE TABLE race_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),

  -- Position data
  finish_position INTEGER NOT NULL,
  start_position INTEGER,

  -- Performance data
  laps_completed INTEGER DEFAULT 0,
  laps_led INTEGER DEFAULT 0,
  incidents INTEGER DEFAULT 0,

  -- Timing data
  average_lap_time NUMERIC,
  fastest_lap_time NUMERIC,
  fastest_lap_number INTEGER,
  qualify_time NUMERIC,
  interval TEXT,                    -- gap to leader

  -- Status
  out_reason TEXT DEFAULT 'Running',  -- Running, Retired, Disqualified

  -- iRacing metadata
  car_id INTEGER,
  car_name TEXT,
  car_number INTEGER,
  iracing_team_id INTEGER,
  iracing_cust_id INTEGER,

  -- Calculated points (stored for performance)
  race_points INTEGER DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  penalty_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(race_id, driver_id)
);

-- ============================================
-- POINTS & SCORING
-- ============================================

-- Points structure (NASCAR-style, configurable)
CREATE TABLE points_structure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  finish_position INTEGER NOT NULL,
  points INTEGER NOT NULL,
  UNIQUE(season_id, finish_position)
);

-- Bonus definitions
CREATE TABLE bonus_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,               -- e.g. "Pole Position", "Fastest Lap", "Most Laps Led"
  code TEXT NOT NULL,               -- e.g. "pole", "fastest_lap", "most_laps_led", "clean_race"
  points INTEGER NOT NULL,
  description TEXT,
  UNIQUE(season_id, code)
);

-- Race bonuses awarded (tracks which bonuses each driver earned per race)
CREATE TABLE race_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  race_result_id UUID NOT NULL REFERENCES race_results(id) ON DELETE CASCADE,
  bonus_code TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident penalty thresholds
CREATE TABLE incident_penalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  min_incidents INTEGER NOT NULL,
  max_incidents INTEGER,
  penalty_points INTEGER NOT NULL,
  description TEXT
);

-- ============================================
-- STANDINGS (Materialized / Cached)
-- ============================================

-- Driver stage standings (cached, recalculated after each race)
CREATE TABLE driver_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),

  -- Points
  total_race_points INTEGER DEFAULT 0,
  total_bonus_points INTEGER DEFAULT 0,
  total_penalty_points INTEGER DEFAULT 0,
  dropped_points INTEGER DEFAULT 0,    -- points from dropped races
  final_points INTEGER DEFAULT 0,      -- after drops and adjustments

  -- Stats
  races_entered INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  top5 INTEGER DEFAULT 0,
  top10 INTEGER DEFAULT 0,
  dnfs INTEGER DEFAULT 0,
  poles INTEGER DEFAULT 0,
  total_laps_led INTEGER DEFAULT 0,
  total_incidents INTEGER DEFAULT 0,
  avg_finish NUMERIC DEFAULT 0,
  avg_start NUMERIC DEFAULT 0,
  best_finish INTEGER,
  worst_finish INTEGER,
  fastest_laps INTEGER DEFAULT 0,      -- # of races with fastest lap

  -- Rank
  position INTEGER,
  position_change INTEGER DEFAULT 0,   -- +/- from previous race

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stage_id, driver_id)
);

-- Team stage standings
CREATE TABLE team_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),

  total_points INTEGER DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  both_top5_count INTEGER DEFAULT 0,
  combined_laps_led INTEGER DEFAULT 0,
  combined_poles INTEGER DEFAULT 0,
  combined_fastest_laps INTEGER DEFAULT 0,
  clean_race_bonus INTEGER DEFAULT 0,

  position INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stage_id, team_id)
);

-- Overall season standings (aggregated across stages)
CREATE TABLE overall_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),

  total_points INTEGER DEFAULT 0,
  stage1_points INTEGER DEFAULT 0,
  stage2_points INTEGER DEFAULT 0,
  stage3_points INTEGER DEFAULT 0,

  overall_wins INTEGER DEFAULT 0,
  overall_top5 INTEGER DEFAULT 0,
  overall_top10 INTEGER DEFAULT 0,
  overall_poles INTEGER DEFAULT 0,
  overall_laps_led INTEGER DEFAULT 0,
  overall_avg_finish NUMERIC DEFAULT 0,

  position INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, driver_id)
);

-- ============================================
-- CONTENT & SCHEDULE
-- ============================================

-- Schedule (pre-populated for the full season)
CREATE TABLE schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  race_number INTEGER NOT NULL,
  track_name TEXT NOT NULL,
  race_date DATE,
  race_time TIME,
  series TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  race_id UUID REFERENCES races(id), -- linked after race is uploaded
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News & Highlights
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'news' CHECK (category IN ('news', 'highlight', 'recap', 'announcement')),
  race_id UUID REFERENCES races(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN
-- ============================================

-- Admin users (simple auth - just you)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CSV upload log
CREATE TABLE csv_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  race_id UUID REFERENCES races(id),
  uploaded_by UUID REFERENCES admin_users(id),
  row_count INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'error')),
  error_message TEXT,
  raw_data JSONB,                   -- store raw CSV data for debugging
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE overall_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

-- Public read access for all display tables
CREATE POLICY "Public read" ON drivers FOR SELECT USING (true);
CREATE POLICY "Public read" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read" ON stages FOR SELECT USING (true);
CREATE POLICY "Public read" ON tracks FOR SELECT USING (true);
CREATE POLICY "Public read" ON races FOR SELECT USING (true);
CREATE POLICY "Public read" ON race_results FOR SELECT USING (true);
CREATE POLICY "Public read" ON points_structure FOR SELECT USING (true);
CREATE POLICY "Public read" ON bonus_definitions FOR SELECT USING (true);
CREATE POLICY "Public read" ON race_bonuses FOR SELECT USING (true);
CREATE POLICY "Public read" ON incident_penalties FOR SELECT USING (true);
CREATE POLICY "Public read" ON driver_standings FOR SELECT USING (true);
CREATE POLICY "Public read" ON team_standings FOR SELECT USING (true);
CREATE POLICY "Public read" ON overall_standings FOR SELECT USING (true);
CREATE POLICY "Public read" ON schedule FOR SELECT USING (true);
CREATE POLICY "Public read news" ON news FOR SELECT USING (published = true);

-- Admin write access (authenticated users only)
CREATE POLICY "Admin write" ON drivers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON races FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON race_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON race_bonuses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON driver_standings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON team_standings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON overall_standings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON schedule FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON news FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON csv_uploads FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_race_results_race ON race_results(race_id);
CREATE INDEX idx_race_results_driver ON race_results(driver_id);
CREATE INDEX idx_race_results_finish ON race_results(finish_position);
CREATE INDEX idx_driver_standings_stage ON driver_standings(stage_id);
CREATE INDEX idx_driver_standings_position ON driver_standings(position);
CREATE INDEX idx_races_stage ON races(stage_id);
CREATE INDEX idx_races_date ON races(race_date);
CREATE INDEX idx_schedule_date ON schedule(race_date);
CREATE INDEX idx_news_published ON news(published, published_at DESC);

-- ============================================
-- DEFAULT NASCAR POINTS (Top 40)
-- ============================================
-- These get inserted once when setting up the season
-- 1st: 40, 2nd: 35, 3rd: 34, 4th: 33... down to 40th: 1
