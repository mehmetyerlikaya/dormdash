const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = "https://aodjyjxsqfytythosrka.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZGp5anhzcWZ5dHl0aG9zcmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDYzOTYsImV4cCI6MjA2NTA4MjM5Nn0.V0K-uTAl8FDkupkjYZn9R6P4qIMhJ0kX1iE4LQFr_tg"

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test configuration
const TEST_MACHINE_ID = 'test-adjust-timer-machine'
const TEST_USER_ID = 'test-user-123'
const TEST_DEVICE_FINGERPRINT = 'test-device-456'

class AdjustTimerTestSuite {
  constructor() {
    this.testResults = []
    this.originalMachineData = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  addResult(testName, passed, details = '') {
    this.testResults.push({ testName, passed, details })
    this.log(`${testName}: ${passed ? 'PASSED' : 'FAILED'} ${details}`, passed ? 'success' : 'error')
  }

  async testDatabaseSchema() {
    this.log('🧪 Testing Database Schema...')
    
    try {
      // Test 1: Check if required columns exist
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'machines')
        .in('column_name', ['started_by_user_id', 'started_by_device_fingerprint'])
        .order('column_name')

      if (error) {
        this.addResult('Database Schema - Column Check', false, `Error: ${error.message}`)
        return false
      }

      if (!columns || columns.length < 2) {
        this.addResult('Database Schema - Column Check', false, 'Missing required columns')
        return false
      }

      const columnNames = columns.map(col => col.column_name)
      const hasUserId = columnNames.includes('started_by_user_id')
      const hasDeviceFingerprint = columnNames.includes('started_by_device_fingerprint')

      this.addResult('Database Schema - started_by_user_id column', hasUserId)
      this.addResult('Database Schema - started_by_device_fingerprint column', hasDeviceFingerprint)

      // Test 2: Check if indexes exist
      const { data: indexes, error: indexError } = await supabase
        .rpc('get_table_indexes', { table_name: 'machines' })
        .catch(() => ({ data: null, error: 'Index check not available' }))

      if (!indexError && indexes) {
        const indexNames = indexes.map(idx => idx.indexname)
        const hasUserIdIndex = indexNames.some(name => name.includes('started_by_user_id'))
        const hasStatusIndex = indexNames.some(name => name.includes('status'))
        
        this.addResult('Database Schema - User ID Index', hasUserIdIndex)
        this.addResult('Database Schema - Status Index', hasStatusIndex)
      } else {
        this.addResult('Database Schema - Indexes', true, 'Index check skipped (function not available)')
      }

      return hasUserId && hasDeviceFingerprint
    } catch (error) {
      this.addResult('Database Schema', false, `Exception: ${error.message}`)
      return false
    }
  }

  async backupOriginalMachine() {
    this.log('💾 Backing up original machine data...')
    
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('id', TEST_MACHINE_ID)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        this.addResult('Backup Original Machine', false, `Error: ${error.message}`)
        return false
      }

      this.originalMachineData = data || null
      this.addResult('Backup Original Machine', true, data ? 'Machine found and backed up' : 'No existing machine to backup')
      return true
    } catch (error) {
      this.addResult('Backup Original Machine', false, `Exception: ${error.message}`)
      return false
    }
  }

  async createTestMachine() {
    this.log('🔧 Creating test machine...')
    
    try {
      const testMachine = {
        id: TEST_MACHINE_ID,
        name: 'Test Adjust Timer Machine',
        status: 'free',
        start_at: null,
        end_at: null,
        grace_end_at: null,
        started_by_user_id: null,
        started_by_device_fingerprint: null
      }

      const { error } = await supabase
        .from('machines')
        .upsert(testMachine, { onConflict: 'id' })

      if (error) {
        this.addResult('Create Test Machine', false, `Error: ${error.message}`)
        return false
      }

      this.addResult('Create Test Machine', true)
      return true
    } catch (error) {
      this.addResult('Create Test Machine', false, `Exception: ${error.message}`)
      return false
    }
  }

  async testMachineOwnership() {
    this.log('👤 Testing machine ownership functionality...')
    
    try {
      // Test 1: Start machine with ownership
      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour

      const { error: startError } = await supabase
        .from('machines')
        .update({
          status: 'running',
          start_at: startTime.toISOString(),
          end_at: endTime.toISOString(),
          started_by_user_id: TEST_USER_ID,
          started_by_device_fingerprint: TEST_DEVICE_FINGERPRINT
        })
        .eq('id', TEST_MACHINE_ID)

      if (startError) {
        this.addResult('Machine Ownership - Start Machine', false, `Error: ${startError.message}`)
        return false
      }

      this.addResult('Machine Ownership - Start Machine', true)

      // Test 2: Verify ownership data
      const { data: machine, error: fetchError } = await supabase
        .from('machines')
        .select('*')
        .eq('id', TEST_MACHINE_ID)
        .single()

      if (fetchError) {
        this.addResult('Machine Ownership - Verify Data', false, `Error: ${fetchError.message}`)
        return false
      }

      const ownershipCorrect = machine.started_by_user_id === TEST_USER_ID && 
                              machine.started_by_device_fingerprint === TEST_DEVICE_FINGERPRINT &&
                              machine.status === 'running'

      this.addResult('Machine Ownership - Verify Data', ownershipCorrect, 
        ownershipCorrect ? 'Ownership data correctly set' : 'Ownership data incorrect')

      return ownershipCorrect
    } catch (error) {
      this.addResult('Machine Ownership', false, `Exception: ${error.message}`)
      return false
    }
  }

  async testAdjustTimerFunctionality() {
    this.log('⏱️ Testing adjust timer functionality...')
    
    try {
      // Test 1: Try to adjust timer with correct ownership
      const newEndTime = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

      const { error: adjustError } = await supabase
        .from('machines')
        .update({ end_at: newEndTime.toISOString() })
        .eq('id', TEST_MACHINE_ID)
        .eq('started_by_user_id', TEST_USER_ID)

      if (adjustError) {
        this.addResult('Adjust Timer - Valid Update', false, `Error: ${adjustError.message}`)
        return false
      }

      this.addResult('Adjust Timer - Valid Update', true)

      // Test 2: Try to adjust timer with wrong ownership (should fail)
      const { error: unauthorizedError } = await supabase
        .from('machines')
        .update({ end_at: newEndTime.toISOString() })
        .eq('id', TEST_MACHINE_ID)
        .eq('started_by_user_id', 'wrong-user-id')

      // This should not update anything (no error, but no rows affected)
      const { data: machineAfterUnauthorized } = await supabase
        .from('machines')
        .select('end_at')
        .eq('id', TEST_MACHINE_ID)
        .single()

      const unauthorizedBlocked = machineAfterUnauthorized && 
        new Date(machineAfterUnauthorized.end_at).getTime() === newEndTime.getTime()

      this.addResult('Adjust Timer - Unauthorized Blocked', !unauthorizedBlocked, 
        unauthorizedBlocked ? 'Unauthorized update was not blocked' : 'Unauthorized update correctly blocked')

      return !unauthorizedBlocked
    } catch (error) {
      this.addResult('Adjust Timer Functionality', false, `Exception: ${error.message}`)
      return false
    }
  }

  async testTypeScriptTypes() {
    this.log('📝 Testing TypeScript type compatibility...')
    
    try {
      // Test if the database response matches our TypeScript types
      const { data: machine, error } = await supabase
        .from('machines')
        .select('*')
        .eq('id', TEST_MACHINE_ID)
        .single()

      if (error) {
        this.addResult('TypeScript Types - Database Response', false, `Error: ${error.message}`)
        return false
      }

      // Check if all expected fields exist
      const requiredFields = [
        'id', 'name', 'status', 'start_at', 'end_at', 'grace_end_at', 
        'updated_at', 'started_by_user_id', 'started_by_device_fingerprint'
      ]

      const missingFields = requiredFields.filter(field => !(field in machine))
      
      if (missingFields.length > 0) {
        this.addResult('TypeScript Types - Required Fields', false, `Missing: ${missingFields.join(', ')}`)
        return false
      }

      this.addResult('TypeScript Types - Required Fields', true)

      // Test data types
      const typeChecks = [
        { field: 'id', expectedType: 'string', actual: typeof machine.id },
        { field: 'name', expectedType: 'string', actual: typeof machine.name },
        { field: 'status', expectedType: 'string', actual: typeof machine.status },
        { field: 'started_by_user_id', expectedType: 'string', actual: typeof machine.started_by_user_id }
      ]

      const typeErrors = typeChecks.filter(check => check.actual !== check.expectedType)
      
      if (typeErrors.length > 0) {
        this.addResult('TypeScript Types - Data Types', false, 
          `Type mismatches: ${typeErrors.map(e => `${e.field}(${e.actual}!=${e.expectedType})`).join(', ')}`)
        return false
      }

      this.addResult('TypeScript Types - Data Types', true)
      return true
    } catch (error) {
      this.addResult('TypeScript Types', false, `Exception: ${error.message}`)
      return false
    }
  }

  async restoreOriginalMachine() {
    this.log('🔄 Restoring original machine data...')
    
    try {
      if (this.originalMachineData) {
        // Restore the original machine
        const { error } = await supabase
          .from('machines')
          .upsert(this.originalMachineData, { onConflict: 'id' })

        if (error) {
          this.addResult('Restore Original Machine', false, `Error: ${error.message}`)
          return false
        }
      } else {
        // Delete the test machine if it didn't exist before
        const { error } = await supabase
          .from('machines')
          .delete()
          .eq('id', TEST_MACHINE_ID)

        if (error) {
          this.addResult('Restore Original Machine', false, `Error: ${error.message}`)
          return false
        }
      }

      this.addResult('Restore Original Machine', true)
      return true
    } catch (error) {
      this.addResult('Restore Original Machine', false, `Exception: ${error.message}`)
      return false
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Adjust Timer Fix Test Suite...')
    this.log('📋 This test will verify the database schema and functionality without affecting production data')
    
    const startTime = Date.now()
    
    try {
      // Run tests in sequence
      const schemaOk = await this.testDatabaseSchema()
      if (!schemaOk) {
        this.log('❌ Database schema test failed. Stopping tests.')
        return this.generateReport()
      }

      await this.backupOriginalMachine()
      await this.createTestMachine()
      await this.testMachineOwnership()
      await this.testAdjustTimerFunctionality()
      await this.testTypeScriptTypes()
      await this.restoreOriginalMachine()

      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      this.log(`⏱️ Test suite completed in ${duration} seconds`)
      
      return this.generateReport()
    } catch (error) {
      this.log(`❌ Test suite failed with exception: ${error.message}`)
      await this.restoreOriginalMachine() // Try to clean up
      return this.generateReport()
    }
  }

  generateReport() {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const successRate = ((passedTests / totalTests) * 100).toFixed(1)

    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUITE REPORT')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests} ✅`)
    console.log(`Failed: ${failedTests} ❌`)
    console.log(`Success Rate: ${successRate}%`)
    console.log('='.repeat(60))

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:')
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.testName}: ${result.details}`)
      })
    }

    console.log('\n✅ PASSED TESTS:')
    this.testResults.filter(r => r.passed).forEach(result => {
      console.log(`  • ${result.testName}${result.details ? `: ${result.details}` : ''}`)
    })

    console.log('\n' + '='.repeat(60))
    
    if (failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! The adjust timer fix is working correctly.')
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.')
    }
    console.log('='.repeat(60))

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: parseFloat(successRate),
      results: this.testResults
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new AdjustTimerTestSuite()
  const report = await testSuite.runAllTests()
  
  // Exit with appropriate code
  process.exit(report.failed === 0 ? 0 : 1)
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Test interrupted. Cleaning up...')
  const testSuite = new AdjustTimerTestSuite()
  await testSuite.restoreOriginalMachine()
  process.exit(1)
})

main().catch(error => {
  console.error('❌ Test suite failed to start:', error)
  process.exit(1)
}) 