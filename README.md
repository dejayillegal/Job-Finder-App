# Job Finder - QA/Test Role Assistant

A production-ready Next.js application that helps find relevant QA and Test Engineering roles based on uploaded resumes. Features heuristic scoring, optional LLM re-ranking, and secure job preview functionality.

## Features

- **Resume Upload & Text Extraction**: Supports PDF, DOCX, and TXT files with server-side text extraction
- **Smart Role Matching**: Heuristic scoring against 27 target QA/Test roles using skill keywords
- **Optional LLM Re-ranking**: Server-side OpenAI/Gemini integration for enhanced relevance scoring
- **Link-First Approach**: Pre-filled search URLs for 7 major job portals (Naukri, LinkedIn, Indeed, etc.)
- **Secure Preview**: Optional Firebase Cloud Function for safe job listing previews with rate limiting
- **Production Ready**: TypeScript, error handling, security best practices

## Architecture

```
├── src/app/                    # Next.js 14 App Router
│   ├── api/resumes/           # API routes for upload & text retrieval
│   ├── layout.tsx & page.tsx  # Root layout and home page
├── src/contexts/              # React Context for resume state
├── src/components/            # React components (uploader, dashboard)
├── src/ai/flows/              # Core job-finding logic with LLM support
├── functions/                 # Firebase Cloud Function for preview
├── data/                      # Local storage for resume texts (dev only)
└── tests/                     # Simple integration tests
```

## Quick Start

### 1. Installation

```bash
# Clone and install dependencies
npm install

# Install Firebase CLI (for preview function)
npm install -g firebase-tools
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Optional: Enable LLM re-ranking
USE_LLM_RERANK=false
OPENAI_API_KEY=sk-your-key-here

# Optional: Preview function endpoints (set after Firebase deploy)
NEXT_PUBLIC_PREVIEW_ENDPOINT=https://your-region-your-project.cloudfunctions.net/previewJob
NEXT_PUBLIC_PREVIEW_API_KEY=your-secret-key

# Default job search location
DEFAULT_JOB_LOCATION=Bangalore
```

### 3. Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 4. Test the Application

1. **Upload Resumes**: Use the upload interface to add PDF/DOCX/TXT files
2. **View Results**: See ranked roles with portal search links
3. **Test Links**: Click portal links to verify search URLs work
4. **Run Tests**: `npm test` to verify core functionality

## Deployment

### Deploy to Vercel (Next.js App)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - USE_LLM_RERANK
# - OPENAI_API_KEY
# - NEXT_PUBLIC_PREVIEW_ENDPOINT (after Firebase deploy)
# - NEXT_PUBLIC_PREVIEW_API_KEY
```

### Deploy Firebase Functions (Preview Feature)

```bash
# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init functions

# Set the API key for preview function
firebase functions:config:set jobpreview.key="your-secret-api-key-here"

# Deploy functions
cd functions
npm install
cd ..
firebase deploy --only functions

# Note the deployed URL for NEXT_PUBLIC_PREVIEW_ENDPOINT
```

## Environment Variables

### Required for Basic Operation
- None (app works with heuristic scoring only)

### Optional - LLM Re-ranking
- `USE_LLM_RERANK=true` - Enable LLM-powered role re-ranking
- `OPENAI_API_KEY=sk-...` - OpenAI API key for GPT-3.5-turbo

### Optional - Preview Function
- `NEXT_PUBLIC_PREVIEW_ENDPOINT` - Firebase function URL
- `NEXT_PUBLIC_PREVIEW_API_KEY` - Secret key for preview function

### Optional - Customization
- `DEFAULT_JOB_LOCATION=Bangalore` - Default location for job searches

## Core Components

### Resume Processing (`src/app/api/resumes/`)
- **upload/route.ts**: Handles file upload and text extraction using `pdf-parse` and `mammoth`
- **text/route.ts**: Returns extracted resume texts
- **Storage**: Local `data/resume_texts.json` (dev), recommend cloud storage for production

### Job Finding Logic (`src/ai/flows/find-relevant-jobs.ts`)
- **Target Roles**: 27 QA/Test engineering positions
- **Skills**: 21 relevant keywords (Python, Selenium, CI/CD, embedded, etc.)
- **Scoring**: Heuristic algorithm + optional LLM re-ranking
- **Output**: Roles with scores, reasons, and search URLs

### UI Components (`src/components/`)
- **ResumeUploader**: Drag-drop file upload with extraction preview
- **Dashboard**: Role cards with portal links and preview buttons
- **Error Handling**: Graceful failures, no crashes on server errors

### Preview Function (`functions/index.js`)
- **Security**: API key authentication, domain whitelist, rate limiting
- **Extraction**: JSON-LD JobPosting → meta description → paragraph fallback
- **Rate Limits**: 1.2s per host, 40 requests/minute global
- **No Persistence**: Transient snippets only, no database writes

## Testing

### Manual E2E Checklist

1. **Upload Test**:
   ```bash
   # Upload 2 resumes via UI
   # Verify server returns {ok:true,count:2}
   # Check data/resume_texts.json exists with texts
   ```

2. **Dashboard Test**:
   ```bash
   # Load dashboard
   # Verify roles appear sorted by score
   # Click portal links → open in new tabs
   # Verify links go to correct job search pages
   ```

3. **Preview Test** (if Firebase deployed):
   ```bash
   # Click "Preview" button on any Naukri link
   # Should show snippet OR fallback message
   # If no Firebase config, should open link directly
   ```

### Automated Test

```bash
npm test
# Runs tests/test-job-finder.js
# Verifies resume processing and role scoring
```

## Security & Legal

### Compliance
- **Respects robots.txt**: Preview function checks robots.txt compliance
- **Rate Limited**: Prevents abuse with per-host and global throttling
- **Domain Whitelisted**: Only allowed job portals can be previewed
- **No Persistence**: Scraped content is never stored

### Production Recommendations
- **Use Official APIs**: For scale, use LinkedIn Partner API, Indeed Publisher API, etc.
- **Resume Privacy**: LLM calls are server-side only, text truncated to 6000 chars
- **Token Vending**: Implement short-lived preview tokens instead of embedding Firebase secrets
- **Cloud Storage**: Replace local `data/` with GCS/S3 for serverless hosting

### Terms of Service
This tool generates search links only. Users must respect job portals' Terms of Service. Bulk scraping is prohibited - use official APIs for commercial use.

## Customization

### Adding New Roles
Edit `TARGET_ROLES` in `src/ai/flows/find-relevant-jobs.ts`:

```typescript
const TARGET_ROLES = [
  "Test Manager",
  "Your New Role",
  // ... existing roles
]
```

### Adding New Skills
Edit `SKILLS` array in the same file:

```typescript
const SKILLS = [
  "Python",
  "YourNewSkill",
  // ... existing skills
]
```

### Adding New Job Portals
Edit `makeSearchUrls()` function to add more portals:

```typescript
return {
  // ... existing portals
  newportal: `https://newportal.com/search?q=${q}&location=${loc}`
}
```

### Using Gemini Instead of OpenAI
Replace the LLM call in `callLLMToRank()`:

```typescript
// Replace OpenAI API call with Gemini
const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': process.env.GEMINI_API_KEY
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  })
})
```

## Troubleshooting

### Resume Upload Issues
- **"Upload failed"**: Check file formats (PDF/DOCX/TXT only)
- **"Text extraction error"**: Verify `pdf-parse` and `mammoth` are installed
- **Empty results**: Check if `data/resume_texts.json` was created

### No Roles Found
- **Check resume content**: Ensure it contains QA/Test related keywords
- **Verify extraction**: Look at extracted text in browser devtools
- **Lower threshold**: Modify minimum score filter in dashboard

### Preview Not Working
- **"Preview function not configured"**: Set `NEXT_PUBLIC_PREVIEW_ENDPOINT` and `NEXT_PUBLIC_PREVIEW_API_KEY`
- **403 errors**: Verify Firebase function API key matches
- **Rate limits**: Wait 1.2 seconds between requests to same host

### LLM Re-ranking Issues
- **Set correct env**: `USE_LLM_RERANK=true` and valid `OPENAI_API_KEY`
- **API errors**: Check OpenAI account credits and API key permissions
- **Fallback behavior**: App continues with heuristic scores if LLM fails

## Limitations & Next Steps

### Current Limitations
- **Local Storage**: `data/resume_texts.json` is ephemeral on serverless hosts
- **No Authentication**: Anyone can upload resumes (add auth for production)
- **Basic Preview**: Limited by portal anti-bot measures (captchas, etc.)
- **LLM Cost**: OpenAI calls cost money per resume analysis

### Scaling Recommendations
1. **Use Official APIs**: LinkedIn Jobs API, Indeed Publisher API, Adzuna API
2. **Add Authentication**: User accounts, resume management
3. **Cloud Storage**: AWS S3, Google Cloud Storage for resume texts
4. **Background Processing**: Queue system for LLM calls
5. **Caching**: Redis cache for job search results
6. **Analytics**: Track click rates, successful placements

## Support

For issues or questions:
1. Check this README first
2. Review environment variable configuration
3. Test with the provided examples
4. Check browser devtools for detailed error messages

---

**Built with Next.js 14, React, TypeScript, Firebase Functions, and OpenAI**
