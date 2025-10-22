/**
 * Firebase Cloud Function: previewJob
 * 
 * Secure endpoint to fetch and extract job listing snippets
 * 
 * Security:
 * - Requires x-api-key header (set in Firebase config: jobpreview.key)
 * - Domain whitelist (only allowed job portals)
 * - Rate limiting: 1200ms min interval per host, max 40 req/min global
 * - No data persistence (transient only)
 * 
 * Usage:
 *   GET /previewJob?url=https://www.naukri.com/...
 *   Header: x-api-key: YOUR_SECRET_KEY
 * 
 * Returns:
 *   { snippet: string, sourceHost: string, fetchedAt: string }
 *   or 204 if no content found
 * 
 * Deploy:
 *   firebase functions:config:set jobpreview.key="YOUR_SECRET_KEY"
 *   firebase deploy --only functions
 */

const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()
app.use(cors({ origin: true }))

// Configuration
const ALLOWED_DOMAINS = [
  'naukri.com',
  'linkedin.com',
  'indeed.com',
  'glassdoor.co.in',
  'monsterindia.com',
  'adzuna.co.in'
]

const MIN_INTERVAL_MS_PER_HOST = 1200 // 1.2 seconds between requests to same host
const MAX_REQUESTS_PER_MINUTE = 40

// In-memory throttling (per-instance)
const lastFetchTime = new Map() // host -> timestamp
const requestCount = { count: 0, resetAt: Date.now() + 60000 }

/**
 * Check if domain is whitelisted
 */
function isAllowedDomain(url) {
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_DOMAINS.some(domain => hostname.includes(domain))
  } catch {
    return false
  }
}

/**
 * Rate limiting check
 */
function checkRateLimit(host) {
  const now = Date.now()

  // Reset per-minute counter
  if (now > requestCount.resetAt) {
    requestCount.count = 0
    requestCount.resetAt = now + 60000
  }

  // Global rate limit
  if (requestCount.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, reason: 'Global rate limit exceeded' }
  }

  // Per-host throttle
  const lastFetch = lastFetchTime.get(host) || 0
  if (now - lastFetch < MIN_INTERVAL_MS_PER_HOST) {
    return { allowed: false, reason: `Too soon for ${host}` }
  }

  return { allowed: true }
}

/**
 * Extract job snippet from HTML
 * Priority: JSON-LD JobPosting > meta description > first meaningful paragraph
 */
function extractSnippet(html, url) {
  const $ = cheerio.load(html)

  // Try JSON-LD JobPosting
  const scripts = $('script[type="application/ld+json"]')
  for (let i = 0; i < scripts.length; i++) {
    try {
      const json = JSON.parse($(scripts[i]).html())
      if (json['@type'] === 'JobPosting' && json.description) {
        return json.description.slice(0, 500)
      }
    } catch {}
  }

  // Try meta description
  const metaDesc = $('meta[name="description"]').attr('content')
  if (metaDesc && metaDesc.length > 50) {
    return metaDesc.slice(0, 500)
  }

  // Fallback: first meaningful paragraph
  const paragraphs = $('p')
  for (let i = 0; i < paragraphs.length; i++) {
    const text = $(paragraphs[i]).text().trim()
    if (text.length > 100) {
      return text.slice(0, 500)
    }
  }

  return null
}

/**
 * Main endpoint
 */
app.get('/', async (req, res) => {
  try {
    // Check API key
    const apiKey = req.headers['x-api-key'] || req.query.key
    const configKey = functions.config().jobpreview?.key

    if (!configKey || apiKey !== configKey) {
      return res.status(403).json({ error: 'Invalid or missing API key' })
    }

    // Get and validate URL
    const targetUrl = req.query.url
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' })
    }

    if (!isAllowedDomain(targetUrl)) {
      return res.status(403).json({ error: 'Domain not whitelisted' })
    }

    // Rate limiting
    const hostname = new URL(targetUrl).hostname
    const rateCheck = checkRateLimit(hostname)

    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.reason })
    }

    // Fetch page
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000,
      maxRedirects: 5
    })

    // Update rate limit state
    lastFetchTime.set(hostname, Date.now())
    requestCount.count++

    // Extract snippet
    const snippet = extractSnippet(response.data, targetUrl)

    if (!snippet) {
      return res.status(204).send()
    }

    // Return transient data (NO DATABASE WRITES)
    return res.json({
      snippet,
      sourceHost: hostname,
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Preview error:', error.message)

    if (error.response?.status === 403 || error.response?.status === 429) {
      return res.status(403).json({ error: 'Access denied or rate limited by target site' })
    }

    return res.status(500).json({ error: 'Failed to fetch preview' })
  }
})

exports.previewJob = functions.https.onRequest(app)
