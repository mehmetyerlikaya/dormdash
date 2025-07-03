#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

console.log('🧪 Running Adjust Timer Fix Test Suite...')
console.log('='.repeat(60))

try {
  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  const fs = require('fs')
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Please run this script from the project root directory')
    process.exit(1)
  }

  // Run the test
  console.log('📋 Starting tests...\n')
  
  const testPath = path.join(__dirname, 'test-fix.js')
  execSync(`node "${testPath}"`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  })
  
  console.log('\n✅ Test suite completed successfully!')
  
} catch (error) {
  console.error('\n❌ Test suite failed:', error.message)
  process.exit(1)
} 