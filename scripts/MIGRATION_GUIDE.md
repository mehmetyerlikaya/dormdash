# Database Migration Guide

## 🚨 IMPORTANT: Fix for Adjust Timer Feature

This migration adds the missing database columns required for the adjust timer feature to work properly.

## What This Migration Does

1. **Adds missing columns** to the `machines` table:
   - `started_by_user_id` - Tracks who started each machine
   - `started_by_device_fingerprint` - Additional security identifier

2. **Creates indexes** for better performance

3. **Updates existing data** to ensure consistency

## How to Run the Migration

### Option 1: Manual SQL Execution (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `aodjyjxsqfytythosrka`

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Migration SQL**
   ```sql
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
   ```

4. **Execute the SQL**
   - Click the "Run" button
   - You should see "Success" message

### Option 2: Using the Automated Script

1. **Get your Service Role Key**
   - Go to Supabase Dashboard > Settings > API
   - Copy the "service_role" key (not the anon key)

2. **Set Environment Variable**
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

3. **Run the Migration Script**
   ```bash
   cd scripts
   node run-migration.js
   ```

## Verification

After running the migration, you can verify it worked by:

1. **Check the table structure**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'machines' 
   ORDER BY ordinal_position;
   ```

2. **Test the adjust timer feature**
   - Start a machine
   - Wait 10+ minutes
   - Try to adjust the timer
   - It should work without errors

## What Was Fixed

### Before the Fix:
- ❌ `adjustMachineTime` function couldn't validate ownership
- ❌ Database errors when trying to read/write missing columns
- ❌ Inconsistent ownership display
- ❌ Security vulnerability (no ownership validation)

### After the Fix:
- ✅ Proper ownership tracking in database
- ✅ Security checks prevent unauthorized timer adjustments
- ✅ TypeScript types match database schema
- ✅ Better performance with indexes
- ✅ Consistent user experience

## Troubleshooting

### If you get "column does not exist" errors:
- Make sure you ran the migration SQL
- Check that the columns were added: `\d machines` in psql

### If adjust timer still doesn't work:
- Check browser console for errors
- Verify the machine has been running for 10+ minutes
- Ensure you're the machine owner

### If you need to rollback:
```sql
-- Remove the columns (WARNING: This will lose ownership data)
ALTER TABLE machines DROP COLUMN IF EXISTS started_by_user_id;
ALTER TABLE machines DROP COLUMN IF EXISTS started_by_device_fingerprint;
```

## Next Steps

After running this migration:
1. Test the adjust timer feature thoroughly
2. Monitor for any errors in the browser console
3. Check that real-time updates still work properly
4. Consider adding additional security measures if needed 