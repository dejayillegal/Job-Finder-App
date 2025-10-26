# JobFinder Pro - Resume-Driven Job Matching

## 🎯 NEW ARCHITECTURE

**NO MORE MANUAL JOB SCRAPING!**

- ❌ **Old way**: `npm run jobs:realtime` (manual command)
- ✅ **New way**: Upload resume → AI analyzes → Auto-fetches matching jobs

## 🚀 SETUP

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run db:init
```

### 3. Start Application
```bash
npm run dev
```

### 4. Access Platform
- Homepage: http://localhost:3000
- Login: jmunuswa@gmail.com / Closer@82

## 💡 HOW IT WORKS

### User Flow:
1. **User uploads resume** (PDF/DOCX)
2. **AI extracts**:
   - Skills (Selenium, API Testing, etc.)
   - Experience years
   - Current role
3. **System automatically**:
   - Searches Naukri.com for matching jobs
   - Searches Indeed India for QA positions  
   - Searches LinkedIn for relevant openings
   - Calculates match scores
   - Stores personalized results
4. **User sees matched jobs** with external application links

### Key Features:
- ✅ **Automatic job scraping** after resume upload
- ✅ **AI-powered matching** based on skills and experience
- ✅ **Real external links** to Naukri, Indeed, LinkedIn
- ✅ **Personalized results** for each user
- ✅ **Production-ready** - works after deployment

## 📁 PROJECT STRUCTURE

```
├── scripts/
│   └── init-db.js          # Database setup
├── src/
│   ├── app/
│   │   ├── page.tsx        # Homepage
│   │   ├── api/
│   │   │   ├── resume/upload/  # Resume upload + auto scraping
│   │   │   ├── jobs/matched/   # Get personalized jobs
│   │   │   └── auth/           # Login & register
│   ├── lib/
│   │   ├── resume-parser.ts    # Extract skills from resume
│   │   ├── job-scraper.ts      # Auto-scrape matching jobs
│   │   ├── database.ts         # Database connection
│   │   └── auth.ts             # Authentication
│   └── components/
│       └── ui/                 # UI components
```

## 🎯 DEPLOYMENT READY

After deployment, the platform will:
1. Accept resume uploads from users
2. Automatically scrape matching jobs in real-time
3. Display personalized job matches
4. Provide direct external application links

**No manual npm commands needed in production!**

## ✅ COMPLETE FEATURES

- Resume upload & AI parsing
- Automatic real-time job scraping
- Multi-platform aggregation (Naukri, Indeed, LinkedIn)
- Personalized job matching
- External application links
- User authentication
- Production-ready architecture