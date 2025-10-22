/**
 * Core Job Finding Logic
 * 
 * This file implements:
 * 1. Heuristic scoring based on role titles and skill keywords
 * 2. Optional LLM re-ranking (if USE_LLM_RERANK=true and OPENAI_API_KEY set)
 * 3. Search URL generation for major job portals
 * 
 * Environment Variables:
 * - USE_LLM_RERANK: Set to "true" to enable LLM-powered re-ranking
 * - OPENAI_API_KEY: Required if USE_LLM_RERANK is enabled
 * - DEFAULT_JOB_LOCATION: Default location for job search (default: Bangalore)
 */

// Exact TARGET_ROLES as specified
const TARGET_ROLES = [
  "Test Manager", "QA Manager", "Test Lead", "QA Lead", "Senior QA Lead", "Lead QA Engineer",
  "Test Architect", "Senior Test Architect", "Principal Test Architect", "Test Automation Lead",
  "Automation Test Lead", "Senior Automation Engineer", "Performance Test Architect",
  "Performance Test Lead", "Performance Engineer", "Embedded QA Lead", "Embedded Test Lead",
  "Embedded Systems Test Engineer", "Senior Software Engineer in Test", "SDET",
  "Principal Systems Engineer", "Test Manager - Embedded", "Validation Test Lead", "V&V Lead",
  "Test Strategy Lead", "QA Strategy Manager", "Head of QA", "Quality Engineering Lead",
  "Test Engineering Manager"
]

// Exact SKILLS as specified
const SKILLS = [
  "Python", "pytest", "Selenium", "Appium", "Jenkins", "GitLab CI", "GitHub Actions", "CI/CD",
  "GNSS", "GPS", "BLE", "RTOS", "OTA", "FDA 21 CFR", "ISO 13485", "IEC 62304",
  "Postman", "JMeter", "API testing", "performance testing", "embedded"
]

interface SearchLinks {
  naukri: string
  linkedin: string
  indeed: string
  glassdoor: string
  monster: string
  adzuna: string
  google: string
}

export interface JobRole {
  role: string
  score: number
  reason: string
  searchLinks: SearchLinks
}

interface JobFinderResult {
  roles: JobRole[]
}

/**
 * Generate search URLs for all major job portals
 */
function makeSearchUrls(title: string, location: string = "Bangalore"): SearchLinks {
  const encodeQuery = (str: string) => encodeURIComponent(str)
  const q = encodeQuery(title)
  const loc = encodeQuery(location)

  return {
    naukri: `https://www.naukri.com/${q}-jobs-in-${loc}`,
    linkedin: `https://www.linkedin.com/jobs/search?keywords=${q}&location=${loc}`,
    indeed: `https://in.indeed.com/jobs?q=${q}&l=${loc}`,
    glassdoor: `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${q}&locKeyword=${loc}`,
    monster: `https://www.monsterindia.com/srp/results?query=${q}&locations=${loc}`,
    adzuna: `https://www.adzuna.co.in/search?q=${q}&where=${loc}`,
    google: `https://www.google.com/search?q=${encodeQuery(title + " jobs in " + location)}`
  }
}

/**
 * Heuristic scoring: count skill and role keyword matches
 */
function calculateHeuristicScore(resumeText: string, role: string): { score: number; reason: string } {
  const lowerResume = resumeText.toLowerCase()
  const lowerRole = role.toLowerCase()

  let score = 0
  const matchedSkills: string[] = []

  // Check role title match
  if (lowerResume.includes(lowerRole)) {
    score += 30
  }

  // Check for partial role keyword matches
  const roleWords = lowerRole.split(/\s+/)
  roleWords.forEach(word => {
    if (word.length > 3 && lowerResume.includes(word)) {
      score += 5
    }
  })

  // Check skill matches
  SKILLS.forEach(skill => {
    if (lowerResume.includes(skill.toLowerCase())) {
      score += 3
      matchedSkills.push(skill)
    }
  })

  const reason = matchedSkills.length > 0
    ? `Matched skills: ${matchedSkills.slice(0, 5).join(', ')}${matchedSkills.length > 5 ? '...' : ''}`
    : 'Role keyword alignment'

  return { score, reason }
}

/**
 * Optional LLM Re-ranking using OpenAI
 * Requires OPENAI_API_KEY environment variable
 */
async function callLLMToRank(resumeCorpus: string, roles: JobRole[]): Promise<JobRole[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, skipping LLM re-rank')
    return roles
  }

  try {
    // Truncate resume to 6000 chars for safety
    const truncatedResume = resumeCorpus.slice(0, 6000)

    const prompt = `You are a career advisor. Given this resume excerpt and list of job roles, re-rank the roles by relevance and provide a brief reason for each.

Resume:
${truncatedResume}

Roles:
${roles.map(r => r.role).join('\n')}

Return ONLY a JSON array (no markdown, no explanation) with format:
[{"role":"Role Name","score":0-100,"reason":"Brief reason"}]

Ensure the response is valid JSON.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()

    // Attempt to extract JSON from response
    let llmRoles: Array<{ role: string; score: number; reason: string }>

    try {
      // Try to parse as-is
      llmRoles = JSON.parse(content)
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        llmRoles = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Could not parse LLM response as JSON')
      }
    }

    // Merge LLM scores with original searchLinks
    const roleMap = new Map(roles.map(r => [r.role, r]))

    return llmRoles.map(llmRole => {
      const original = roleMap.get(llmRole.role)
      return {
        role: llmRole.role,
        score: llmRole.score,
        reason: llmRole.reason,
        searchLinks: original?.searchLinks || makeSearchUrls(llmRole.role)
      }
    })
  } catch (error) {
    console.error('LLM re-rank error:', error)
    return roles // Fallback to heuristic scores
  }
}

/**
 * Main entry point: Find relevant jobs based on resume text(s)
 */
export async function findRelevantJobs(
  resumesText: string[],
  location: string = process.env.DEFAULT_JOB_LOCATION || "Bangalore"
): Promise<JobFinderResult> {
  // Combine all resume texts
  const combinedResume = resumesText.join('\n\n')

  // Calculate heuristic scores for all roles
  const roles: JobRole[] = TARGET_ROLES.map(role => {
    const { score, reason } = calculateHeuristicScore(combinedResume, role)
    return {
      role,
      score,
      reason,
      searchLinks: makeSearchUrls(role, location)
    }
  })

  // Sort by heuristic score
  roles.sort((a, b) => b.score - a.score)

  // Optional LLM re-ranking
  const useLLM = process.env.USE_LLM_RERANK === 'true'
  let finalRoles = roles

  if (useLLM) {
    console.log('LLM re-ranking enabled, calling OpenAI...')
    finalRoles = await callLLMToRank(combinedResume, roles.slice(0, 15)) // Re-rank top 15
  }

  return { roles: finalRoles }
}
