import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <div>
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobFinder Pro
              </Link>
              <p className="text-xs text-gray-500 -mt-1">AI-Powered Job Matching</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-medium transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-blue-800 rounded-full mb-8 font-medium">
            🚀 Revolutionary AI Job Matching • Real-Time Scraping • Zero Manual Work
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Upload Resume,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Get Matched Jobs
            </span>
            <br />
            <span className="text-4xl md:text-5xl text-gray-600">Automatically</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Revolutionary AI analyzes your resume and <strong>automatically scrapes</strong> matching jobs 
            from <strong>Naukri, Indeed, LinkedIn, and Hirist</strong>. No manual searching required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl text-lg font-bold hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              🎯 Start AI Job Matching
            </Link>
            <Link 
              href="/demo" 
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl text-lg font-bold hover:border-blue-400 hover:shadow-xl transition-all"
            >
              👀 Watch Demo
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">🎯 How AI Job Matching Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📄</span>
              </div>
              <h3 className="font-bold mb-2">1. Upload Resume</h3>
              <p className="text-gray-600 text-sm">Upload your PDF/DOCX resume to our AI system</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <h3 className="font-bold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600 text-sm">AI extracts skills, experience, and role preferences</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔍</span>
              </div>
              <h3 className="font-bold mb-2">3. Auto Scraping</h3>
              <p className="text-gray-600 text-sm">System scrapes Naukri, Indeed, LinkedIn, Hirist</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="font-bold mb-2">4. Perfect Matches</h3>
              <p className="text-gray-600 text-sm">Get personalized job matches with direct links</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white text-xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Advanced AI Parsing</h3>
            <p className="text-gray-600 leading-relaxed">
              Revolutionary AI extracts 50+ data points from your resume including skills, 
              experience, certifications, and career preferences with 95%+ accuracy.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white text-xl">🔗</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Real-Time Job Scraping</h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically scrapes latest jobs from Naukri.com, Indeed India, LinkedIn Jobs, 
              and Hirist.tech with valid external application links.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Smart Matching Algorithm</h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced ML algorithms calculate compatibility scores based on skills, 
              experience, salary expectations, and location preferences.
            </p>
          </div>
        </div>

        {/* Platforms */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-white text-center mb-20">
          <h2 className="text-3xl font-bold mb-8">🌐 Integrated Job Platforms</h2>
          <p className="text-xl opacity-90 mb-8">We automatically scrape jobs from these top platforms</p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-3xl mb-3">🔵</div>
              <h3 className="font-bold">Naukri.com</h3>
              <p className="text-sm opacity-75">India\'s largest job portal</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold">Indeed India</h3>
              <p className="text-sm opacity-75">Global job search engine</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-bold">LinkedIn Jobs</h3>
              <p className="text-sm opacity-75">Professional network</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold">Hirist.tech</h3>
              <p className="text-sm opacity-75">Tech jobs platform</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">500K+</div>
            <p className="text-gray-600">Jobs Scraped Daily</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
            <p className="text-gray-600">Match Accuracy</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-600 mb-2">4</div>
            <p className="text-gray-600">Major Platforms</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
            <p className="text-gray-600">Live Monitoring</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white p-16 rounded-3xl shadow-xl border">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Dream Job?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals using AI to accelerate their job search
          </p>
          <Link 
            href="/auth/register" 
            className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            🚀 Start Free AI Job Matching
          </Link>
        </div>
      </div>
    </div>
  );
}