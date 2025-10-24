import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Shield 
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: 'ATS Resume Scoring',
      description: "Get instant feedback on your resume's ATS compatibility with detailed analysis",
    },
    {
      icon: Target,
      title: 'AI Resume Tailoring',
      description: 'Automatically customize your resume for each job description',
    },
    {
      icon: Sparkles,
      title: 'Smart Job Matching',
      description: 'AI-powered job recommendations based on your skills and experience',
    },
    {
      icon: TrendingUp,
      title: 'Career Insights',
      description: 'Track applications, interviews, and get actionable career advice',
    },
    {
      icon: Zap,
      title: 'Auto-Apply',
      description: 'Apply to multiple jobs automatically with customized applications',
    },
    {
      icon: Shield,
      title: 'Interview Prep',
      description: 'Practice with AI interviewer and get personalized feedback',
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Land Your Dream Job with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Optimize your resume, find perfect matches, and automate applications 
            with our advanced AI-powered career platform
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link href="/login">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-lg"
              >
                Login
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">ATS Pass Rate</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">3x</div>
              <div className="text-sm text-gray-600">More Interviews</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Everything You Need to Succeed
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card 
                key={idx}
                className="border-2 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of job seekers who found their dream roles
          </p>
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-lg font-semibold"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-50 py-8 px-4 text-center text-gray-600">
        <p className="mb-2">&copy; 2025 Job Finder Pro. All rights reserved.</p>
        <p className="text-sm">Admin: jmunuswa@gmail.com</p>
      </footer>
    </main>
  )
}
