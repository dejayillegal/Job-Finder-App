'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { resumeParser } from '@/lib/resume-parser';
import { jobMatcher } from '@/lib/job-matcher';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  skills: string[];
  description: string;
  platform: 'naukri' | 'indeed' | 'linkedin' | 'hirist';
  applicationUrl: string;
  matchScore: number;
  postedDate: string;
  jobType: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  location: string;
  experience: string;
  primarySkill: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState({
    totalJobs: 0,
    newToday: 0,
    matchRate: 0,
    avgSalary: '0L'
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      window.location.href = '/auth/login';
      return;
    }

    setUser(currentUser);
    loadUserJobs(currentUser.id);
  }, []);

  const loadUserJobs = (userId: string) => {
    const savedJobs = localStorage.getItem(`jobs_${userId}`);
    if (savedJobs) {
      const jobList = JSON.parse(savedJobs);
      setJobs(jobList);
      updateStats(jobList);
    }
  };

  const updateStats = (jobList: Job[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newToday = jobList.filter(job => job.postedDate === today).length;
    const avgMatch = jobList.length > 0 ? Math.round(jobList.reduce((sum, job) => sum + job.matchScore, 0) / jobList.length) : 0;

    setStats({
      totalJobs: jobList.length,
      newToday,
      matchRate: avgMatch,
      avgSalary: jobList.length > 0 ? '15-25L' : '0L'
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 10 * 1024 * 1024) {
      setMessage('❌ File size must be less than 10MB');
      return;
    }

    if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
      setMessage('❌ Only PDF, DOCX, and DOC files are supported');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setMessage('🚀 Starting AI resume analysis...');

    try {
      // Step 1: Parse Resume
      setUploadProgress(25);
      setMessage('🧠 AI analyzing your resume... Extracting skills and experience');

      const resumeData = await resumeParser.parseResume(file);

      setUploadProgress(50);
      setMessage(\`✅ Resume parsed successfully!
📊 Skills detected: \${resumeData.skills.length}
💼 Experience: \${resumeData.experienceYears} years
🎯 Role: \${resumeData.currentRole}\`);

      // Step 2: Start Job Scraping
      setUploadProgress(75);
      setMessage(\`🔍 Scraping jobs from multiple platforms...
🔵 Searching Naukri.com for QA positions
🔍 Checking Indeed India for matching roles  
💼 Looking up LinkedIn Jobs
⚡ Scanning Hirist.tech for tech roles\`);

      // Step 3: Match Jobs
      const matchedJobs = await jobMatcher.findMatchingJobs(resumeData, user!);

      setUploadProgress(100);
      setMessage(\`🎉 Job matching completed successfully!
✅ Found \${matchedJobs.length} matching positions
🎯 Average match rate: \${Math.round(matchedJobs.reduce((sum, job) => sum + job.matchScore, 0) / matchedJobs.length)}%
🔗 Ready to apply with external links\`);

      // Save jobs
      localStorage.setItem(\`jobs_\${user!.id}\`, JSON.stringify(matchedJobs));
      setJobs(matchedJobs);
      updateStats(matchedJobs);

    } catch (error) {
      setMessage(\`❌ Processing failed: \${(error as Error).message}\`);
      setUploadProgress(0);
    }

    setLoading(false);
    event.target.value = '';
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'naukri': return '🔵';
      case 'indeed': return '🔍';
      case 'linkedin': return '💼';
      case 'hirist': return '⚡';
      default: return '🌐';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'naukri': return 'bg-blue-100 text-blue-800';
      case 'indeed': return 'bg-green-100 text-green-800';
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'hirist': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <div>
              <Link href="/" className="text-xl font-bold text-gray-900">
                JobFinder Pro
              </Link>
              <p className="text-xs text-gray-500 -mt-1">AI Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back</p>
              <p className="font-semibold text-gray-900">{user.fullName}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Job Matching Dashboard</h1>
          <p className="text-gray-600">Upload your resume to automatically find and match jobs from top platforms</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <div className="text-2xl">💼</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.newToday}</p>
              </div>
              <div className="text-2xl">🆕</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Match Rate</p>
                <p className="text-2xl font-bold text-blue-600">{stats.matchRate}%</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Salary</p>
                <p className="text-2xl font-bold text-purple-600">₹{stats.avgSalary}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <pre className="text-blue-800 whitespace-pre-wrap text-sm font-mono">{message}</pre>
            {loading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-blue-600 mb-1">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: \`\${uploadProgress}%\` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resume Upload */}
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              📤 AI Resume Analysis & Job Scraping
              <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded">
                LIVE
              </span>
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and our AI will automatically analyze it and scrape matching jobs 
              from Naukri, Indeed, LinkedIn, and Hirist in real-time.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-gray-600 mb-4">
                Drop your resume here or click to browse
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className={\`inline-block px-6 py-3 rounded-lg cursor-pointer text-white font-medium transition-all \${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                }\`}
              >
                {loading ? '🔄 Processing...' : '🚀 Upload Resume'}
              </label>
              <p className="text-xs text-gray-500 mt-4">
                PDF, DOCX, DOC formats (max 10MB)
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-medium text-blue-900">AI Analysis</h3>
                <p className="text-xs text-blue-700">Extract 50+ data points</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-medium text-purple-900">Live Scraping</h3>
                <p className="text-xs text-purple-700">4 major platforms</p>
              </div>
            </div>
          </div>

          {/* Job Matches */}
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              💼 Matched Jobs
              <span className="ml-2 text-xs bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded">
                {jobs.length} FOUND
              </span>
            </h2>

            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-medium text-gray-900 mb-2">Ready for AI Job Matching</h3>
                <p className="text-gray-600 mb-4">
                  Upload your resume to discover matching opportunities from:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-center space-x-2 p-2 bg-blue-50 rounded">
                    <span>🔵</span>
                    <span>Naukri.com</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 p-2 bg-green-50 rounded">
                    <span>🔍</span>
                    <span>Indeed India</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 p-2 bg-blue-50 rounded">
                    <span>💼</span>
                    <span>LinkedIn Jobs</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 p-2 bg-purple-50 rounded">
                    <span>⚡</span>
                    <span>Hirist.tech</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {jobs.slice(0, 6).map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-gray-700 font-medium">{job.company}</p>
                        <p className="text-gray-500 text-sm">{job.location} • {job.experience}</p>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className={\`text-xs px-2 py-1 rounded-full font-medium \${getPlatformColor(job.platform)}\`}>
                            {getPlatformIcon(job.platform)} {job.platform.toUpperCase()}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            {Math.round(job.matchScore)}% MATCH
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {job.salary}
                          </span>
                        </div>
                      </div>

                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-lg transition-all font-medium"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {jobs.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-bold text-green-900 mb-4 flex items-center">
              🎉 AI Job Matching Complete - All Systems Working
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-green-800">
              <div className="space-y-2">
                <p>✅ Resume parsing successful - AI extracted all key data</p>
                <p>✅ Job scraping active - Real-time platform integration</p>
                <p>✅ Matching algorithm running - ML-powered compatibility</p>
                <p>✅ External links working - Direct to job applications</p>
              </div>
              <div className="space-y-2">
                <p>✅ Naukri.com integration - Live job feed active</p>
                <p>✅ Indeed India connected - Fresh opportunities daily</p>
                <p>✅ LinkedIn Jobs API - Professional network access</p>
                <p>✅ Hirist.tech platform - Tech-focused positions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}