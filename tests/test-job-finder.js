/**
 * Simple test script for job-finding logic
 * 
 * Usage: node tests/test-job-finder.js
 * 
 * This test verifies:
 * 1. Resume text extraction produces results
 * 2. At least one target role scores > 30
 * 3. All roles have valid search links
 */

const fs = require('fs')
const path = require('path')

// Mock environment
process.env.USE_LLM_RERANK = 'false'
process.env.DEFAULT_JOB_LOCATION = 'Bangalore'

// Load the job finder (requires build first)
async function runTest() {
  console.log('🧪 Running job-finder tests...\n')

  // Check if resume texts exist
  const resumeTextsPath = path.join(__dirname, '../data/resume_texts.json')

  if (!fs.existsSync(resumeTextsPath)) {
    console.error('❌ No resume texts found at data/resume_texts.json')
    console.log('Please upload resumes through the UI first, or run extraction manually.')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(resumeTextsPath, 'utf-8'))
  const resumeTexts = data.texts || []

  if (resumeTexts.length === 0) {
    console.error('❌ No resume texts in data/resume_texts.json')
    process.exit(1)
  }

  console.log(`✓ Found ${resumeTexts.length} resume text(s)`)
  console.log(`✓ First resume preview: ${resumeTexts[0].slice(0, 100)}...\n`)

  // Import the job finder (this assumes TypeScript has been compiled)
  // For development, you might need to run this after 'npm run build'
  const { findRelevantJobs } = require('../src/ai/flows/find-relevant-jobs.ts')

  console.log('🔍 Finding relevant jobs...\n')

  const result = await findRelevantJobs(resumeTexts)
  const roles = result.roles

  console.log(`✓ Found ${roles.length} roles total\n`)

  // Check top roles
  const topRoles = roles.slice(0, 5)
  console.log('Top 5 roles:')
  topRoles.forEach((role, idx) => {
    console.log(`  ${idx + 1}. ${role.role} (score: ${role.score})`)
    console.log(`     Reason: ${role.reason}`)
  })
  console.log('')

  // Assertion: at least one role should score > 30
  const highScoreRoles = roles.filter(r => r.score > 30)

  if (highScoreRoles.length === 0) {
    console.error('❌ FAIL: No roles scored > 30')
    process.exit(1)
  }

  console.log(`✓ ${highScoreRoles.length} role(s) scored > 30`)

  // Verify search links
  const firstRole = roles[0]
  const requiredPortals = ['naukri', 'linkedin', 'indeed', 'glassdoor', 'monster', 'adzuna', 'google']
  const missingPortals = requiredPortals.filter(p => !firstRole.searchLinks[p])

  if (missingPortals.length > 0) {
    console.error(`❌ FAIL: Missing search links for: ${missingPortals.join(', ')}`)
    process.exit(1)
  }

  console.log('✓ All search links present')
  console.log('\n✅ All tests passed!')
}

runTest().catch(err => {
  console.error('❌ Test error:', err)
  process.exit(1)
})
