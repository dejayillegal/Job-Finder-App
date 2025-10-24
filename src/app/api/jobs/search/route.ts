import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database-v2';
import { getCurrentUser, logActivity } from '@/lib/enhanced-auth';

interface SearchFilters {
  query?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
  jobType?: string;
  experienceLevel?: string;
  skillsRequired?: string[];
  postedWithin?: number; // days
  sortBy?: 'relevance' | 'date' | 'salary' | 'match_score';
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const filters: SearchFilters = {
      query: searchParams.get('query') || '',
      location: searchParams.get('location') || 'Bangalore',
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
      remote: searchParams.get('remote') === 'true',
      jobType: searchParams.get('jobType') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      postedWithin: searchParams.get('postedWithin') ? parseInt(searchParams.get('postedWithin')!) : 7,
      sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'relevance',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    };

    const db = getDatabase();

    // Build dynamic query
    let baseQuery = `
      SELECT j.*, jm.match_score, jm.recommended, jm.viewed 
      FROM jobs j
      LEFT JOIN job_matches jm ON j.id = jm.job_id AND jm.user_id = ?
      WHERE j.status = 'active'
    `;

    const queryParams: any[] = [user.id];

    // Add filters
    if (filters.query) {
      baseQuery += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)`;
      const searchTerm = `%${filters.query}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.location && filters.location !== 'all') {
      baseQuery += ` AND (j.location LIKE ? OR j.remote = 1)`;
      queryParams.push(`%${filters.location}%`);
    }

    if (filters.salaryMin) {
      baseQuery += ` AND (j.salary_min >= ? OR j.salary_min IS NULL)`;
      queryParams.push(filters.salaryMin);
    }

    if (filters.salaryMax) {
      baseQuery += ` AND (j.salary_max <= ? OR j.salary_max IS NULL)`;
      queryParams.push(filters.salaryMax);
    }

    if (filters.remote) {
      baseQuery += ` AND j.remote = 1`;
    }

    if (filters.jobType) {
      baseQuery += ` AND j.job_type = ?`;
      queryParams.push(filters.jobType);
    }

    if (filters.postedWithin) {
      baseQuery += ` AND j.posted_date >= date('now', '-${filters.postedWithin} days')`;
    }

    // Add sorting
    switch (filters.sortBy) {
      case 'date':
        baseQuery += ` ORDER BY j.posted_date DESC`;
        break;
      case 'salary':
        baseQuery += ` ORDER BY j.salary_max DESC, j.salary_min DESC`;
        break;
      case 'match_score':
        baseQuery += ` ORDER BY jm.match_score DESC NULLS LAST, j.posted_date DESC`;
        break;
      default:
        baseQuery += ` ORDER BY jm.recommended DESC, j.posted_date DESC`;
    }

    // Add pagination
    const offset = (filters.page! - 1) * filters.limit!;
    baseQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(filters.limit, offset);

    const jobs = db.prepare(baseQuery).all(...queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      WHERE j.status = 'active'
    `;
    const countParams: any[] = [];

    if (filters.query) {
      countQuery += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)`;
      const searchTerm = `%${filters.query}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.location && filters.location !== 'all') {
      countQuery += ` AND (j.location LIKE ? OR j.remote = 1)`;
      countParams.push(`%${filters.location}%`);
    }

    if (filters.postedWithin) {
      countQuery += ` AND j.posted_date >= date('now', '-${filters.postedWithin} days')`;
    }

    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

    // Categorize jobs by recency
    const now = new Date();
    const categorized = {
      recommended: [] as any[],
      recent: [] as any[],
      older: [] as any[]
    };

    jobs.forEach(job => {
      const postedDate = new Date(job.posted_date);
      const daysDiff = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Parse skills_required if it's a JSON string
      try {
        if (job.skills_required && typeof job.skills_required === 'string') {
          job.skills_required = JSON.parse(job.skills_required);
        }
      } catch (e) {
        job.skills_required = [];
      }

      if (daysDiff <= 7 || job.recommended) {
        categorized.recommended.push(job);
      } else if (daysDiff <= 21) {
        categorized.recent.push(job);
      } else {
        categorized.older.push(job);
      }
    });

    // Log search activity
    logActivity(user.id, 'job_search', 'job', undefined, {
      query: filters.query,
      location: filters.location,
      resultsCount: jobs.length
    }, request);

    return NextResponse.json({
      jobs: {
        all: jobs,
        recommended: categorized.recommended,
        recent: categorized.recent,
        older: categorized.older
      },
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit!)
      },
      filters: filters
    });

  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { jobIds, action } = body;

    if (!jobIds || !Array.isArray(jobIds) || !action) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const db = getDatabase();

    if (action === 'mark_viewed') {
      // Mark jobs as viewed
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO job_matches (user_id, job_id, viewed, created_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      `);

      jobIds.forEach(jobId => {
        stmt.run(user.id, jobId);
      });

      logActivity(user.id, 'jobs_viewed', 'job', undefined, { jobIds }, request);

    } else if (action === 'save_jobs') {
      // Save jobs for later
      const stmt = db.prepare(`
        UPDATE job_matches SET recommended = 1 WHERE user_id = ? AND job_id = ?
      `);

      jobIds.forEach(jobId => {
        stmt.run(user.id, jobId);
      });

      logActivity(user.id, 'jobs_saved', 'job', undefined, { jobIds }, request);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Job action error:', error);
    return NextResponse.json(
      { error: 'Failed to process job action' },
      { status: 500 }
    );
  }
}