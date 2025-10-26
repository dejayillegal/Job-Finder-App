import Link from 'next/link';
import { Upload, Zap, Target, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            JobFinder Pro
          </h1>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full mb-6">
            <Zap className="h-4 w-4 mr-2" />
            AI-Powered Resume Analysis & Auto Job Matching
          </div>

          <h1 className="text-5xl font-bold mb-6">
            Upload Resume,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Get Matching Jobs
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Our AI analyzes your resume and automatically fetches real-time matching QA/Testing jobs 
            from Naukri, Indeed, and LinkedIn.
          </p>

          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Resume & Find Jobs
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Upload Resume</h3>
            <p className="text-gray-600">
              Upload your resume (PDF/DOCX). Our AI extracts skills, experience, and preferences.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. AI Analysis</h3>
            <p className="text-gray-600">
              AI analyzes your profile and automatically searches Naukri, Indeed, LinkedIn for matches.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Get Matched Jobs</h3>
            <p className="text-gray-600">
              View personalized job matches with direct external links. Apply with one click.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Automatic Job Scraping</h4>
                  <p className="text-gray-600">No manual commands needed. Jobs are fetched automatically after resume upload.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Real-Time Matching</h4>
                  <p className="text-gray-600">AI matches your skills with live jobs from multiple platforms instantly.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">External Application Links</h4>
                  <p className="text-gray-600">Every job includes real external links to apply on original platform.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Multi-Platform Aggregation</h4>
                  <p className="text-gray-600">Searches Naukri.com, Indeed India, and LinkedIn simultaneously.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">QA/Testing Focus</h4>
                  <p className="text-gray-600">Specialized in Quality Assurance and Software Testing positions.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Production Ready</h4>
                  <p className="text-gray-600">Deployed and ready to use. No setup commands required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}