-- Add missing columns for user ownership tracking
ALTER TABLE machines ADD COLUMN IF NOT EXISTS started_by_user_id TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS started_by_device_fingerprint TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_machines_started_by_user_id ON machines(started_by_user_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

-- Update existing machines to have null ownership (if any exist)
UPDATE machines SET started_by_user_id = NULL, started_by_device_fingerprint = NULL 
WHERE started_by_user_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN machines.started_by_user_id IS 'User ID of the person who started the machine';
COMMENT ON COLUMN machines.started_by_device_fingerprint IS 'Device fingerprint for additional security'; 