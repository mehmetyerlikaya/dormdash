-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'free',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create noise_reports table
CREATE TABLE IF NOT EXISTS noise_reports (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  last_reported TIMESTAMPTZ DEFAULT NOW()
);

-- Create sublets table
CREATE TABLE IF NOT EXISTS sublets (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create help_requests table
CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  machine_id TEXT NOT NULL,
  incident_type TEXT NOT NULL DEFAULT 'overtime',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

-- Enable Row Level Security
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE noise_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublets ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on machines" ON machines FOR ALL USING (true);
CREATE POLICY "Allow all operations on noise_reports" ON noise_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on sublets" ON sublets FOR ALL USING (true);
CREATE POLICY "Allow all operations on help_requests" ON help_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on incidents" ON incidents FOR ALL USING (true);
