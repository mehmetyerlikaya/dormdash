-- Add grace_end_at column to track when the grace period ends
ALTER TABLE machines ADD COLUMN IF NOT EXISTS grace_end_at TIMESTAMPTZ;

-- Update any machines that are currently stuck at 0:00:00 to proper grace period
UPDATE machines 
SET 
  status = 'finishedGrace',
  grace_end_at = NOW() + INTERVAL '5 minutes'
WHERE 
  status = 'running' 
  AND end_at IS NOT NULL 
  AND end_at <= NOW()
  AND grace_end_at IS NULL;
