const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = "https://aodjyjxsqfytythosrka.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key-here"

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '05-add-user-ownership.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration SQL:')
    console.log(migrationSQL)
    console.log('\n')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error)
        throw error
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`)
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📋 Summary of changes:')
    console.log('- Added started_by_user_id column to machines table')
    console.log('- Added started_by_device_fingerprint column to machines table')
    console.log('- Created indexes for better performance')
    console.log('- Updated TypeScript types to match database schema')
    console.log('- Added security checks to adjustMachineTime function')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Check if service role key is provided
if (!supabaseServiceKey || supabaseServiceKey === "your-service-role-key-here") {
  console.error('❌ Please provide your Supabase service role key:')
  console.error('   Set SUPABASE_SERVICE_ROLE_KEY environment variable or update the script')
  console.error('\n📖 How to get your service role key:')
  console.error('   1. Go to your Supabase dashboard')
  console.error('   2. Navigate to Settings > API')
  console.error('   3. Copy the "service_role" key (not the anon key)')
  console.error('   4. Set it as an environment variable:')
  console.error('      export SUPABASE_SERVICE_ROLE_KEY="your-key-here"')
  console.error('   5. Run this script again')
  process.exit(1)
}

runMigration() 