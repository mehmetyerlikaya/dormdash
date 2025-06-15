-- Add description column to noise_reports
ALTER TABLE noise_reports ADD COLUMN IF NOT EXISTS description TEXT;

-- Create announcements table (replacing sublets with more comprehensive system)
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  announcement_type TEXT NOT NULL DEFAULT 'general',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policy for announcements
CREATE POLICY "Allow all operations on announcements" ON announcements FOR ALL USING (true);

-- Migrate existing sublets to announcements
INSERT INTO announcements (id, user_name, title, description, announcement_type, timestamp)
SELECT 
  id,
  user_name,
  'Sublet Available' as title,
  duration as description,
  'sublet' as announcement_type,
  timestamp
FROM sublets
ON CONFLICT (id) DO NOTHING;
