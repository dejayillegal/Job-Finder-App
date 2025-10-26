import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            JobFinder Pro
          </Link>
          <Link href="/auth/register" className="btn-primary">
            Try Now
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Revolutionary Demo
            </span>
          </h1>
          <p className="text-xl text-gray-600">See how AI job matching works in action</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">🎯 Complete Workflow</h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold">Upload Resume</h3>
                <p className="text-gray-600">AI extracts skills, experience, current role, and preferences</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold">Real-Time Scraping</h3>
                <p className="text-gray-600">System automatically searches Naukri, Indeed, LinkedIn, Hirist</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold">Smart Matching</h3>
                <p className="text-gray-600">ML algorithms calculate compatibility scores</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-semibold">External Applications</h3>
                <p className="text-gray-600">Direct links to apply on original job platforms</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Platform Integration</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Naukri.com - India\'s largest job portal</li>
              <li>✓ Indeed India - Global job search engine</li>
              <li>✓ LinkedIn Jobs - Professional network</li>
              <li>✓ Hirist.tech - Tech-focused platform</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">AI Capabilities</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ 50+ resume data points extraction</li>
              <li>✓ Advanced skill categorization</li>
              <li>✓ ML-powered match scoring</li>
              <li>✓ Real company job database</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
            🚀 Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}