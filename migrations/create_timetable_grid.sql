-- Create timetable_grid table for storing semester-wise timetables
CREATE TABLE IF NOT EXISTS timetable_grid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester INTEGER NOT NULL,
  year INTEGER NOT NULL,
  branch TEXT NOT NULL,
  section TEXT DEFAULT '',
  schedule_config JSONB NOT NULL,
  schedule JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(semester, year, branch, section)
);

-- Add index for faster queries
CREATE INDEX idx_timetable_grid_lookup ON timetable_grid(semester, year, branch, section);

-- Comments
COMMENT ON TABLE timetable_grid IS 'Stores grid-based timetables for each semester-year-branch combination';
COMMENT ON COLUMN timetable_grid.schedule_config IS 'Per-day configuration with time slots and lunch break info';
COMMENT ON COLUMN timetable_grid.schedule IS 'Nested object with days as keys and period-cell mappings as values';
