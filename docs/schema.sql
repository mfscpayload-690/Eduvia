-- eduvia Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  college TEXT,
  mobile TEXT,
  semester INTEGER,
  year_of_study INTEGER,
  branch TEXT,
  program_type TEXT CHECK (program_type IN ('B.Tech', 'M.Tech')),
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profile_completed ON users(profile_completed);

-- ============================================================================
-- Notes Table (Google Drive PDFs)
-- ============================================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  course TEXT NOT NULL,
  file_id TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_notes_course ON notes(course);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- Optional: Extend notes with semester/year_of_study for precise filtering
ALTER TABLE notes ADD COLUMN IF NOT EXISTS semester INTEGER;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS year_of_study INTEGER;
CREATE INDEX IF NOT EXISTS idx_notes_semester ON notes(semester);
CREATE INDEX IF NOT EXISTS idx_notes_year ON notes(year_of_study);

-- Optional: Set all users' college to default value
UPDATE users SET college = 'IHRD College of Engineering Kallooppara' WHERE college IS NULL OR college = '';
UPDATE users SET college = 'IHRD College of Engineering Kallooppara' WHERE college = 'Other College (Please specify in comments)';

-- ============================================================================
-- Timetable Table
-- ============================================================================
CREATE TABLE timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course TEXT NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT NOT NULL,
  faculty TEXT NOT NULL
);

CREATE INDEX idx_timetable_course ON timetable(course);
CREATE INDEX idx_timetable_day ON timetable(day);

-- ============================================================================
-- Events Table
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_created_by ON events(created_by);

-- ============================================================================
-- Lost & Found Table
-- ============================================================================
CREATE TABLE lostfound (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'claimed')),
  contact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_lostfound_status ON lostfound(status);
CREATE INDEX idx_lostfound_created_at ON lostfound(created_at DESC);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lostfound ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies (Basic)
-- ============================================================================

-- Users: Anyone can read all users (public profile list)
CREATE POLICY "Users can read all users" ON users
FOR SELECT USING (true);

-- Notes: Anyone authenticated can read
CREATE POLICY "Users can read notes" ON notes
FOR SELECT USING (true);

-- Notes: Only admins can insert
CREATE POLICY "Admins can insert notes" ON notes
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Timetable: Anyone can read
CREATE POLICY "Users can read timetable" ON timetable
FOR SELECT USING (true);

-- Timetable: Only admins can insert/update
CREATE POLICY "Admins can manage timetable" ON timetable
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update timetable" ON timetable
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Events: Anyone can read
CREATE POLICY "Users can read events" ON events
FOR SELECT USING (true);

-- Events: Only admins can insert
CREATE POLICY "Admins can insert events" ON events
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Lost & Found: Anyone can read
CREATE POLICY "Users can read lostfound" ON lostfound
FOR SELECT USING (true);

-- Lost & Found: Anyone authenticated can insert
CREATE POLICY "Users can insert lostfound" ON lostfound
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Lost & Found: Admins can update status
CREATE POLICY "Admins can update lostfound" ON lostfound
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
