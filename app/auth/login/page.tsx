'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await authService.login(formData.email, formData.password);
      if (result.success) {
        setMessage('✅ Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setMessage(result.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Authentication system error');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'jmunuswa@gmail.com',
      password: 'Closer@82'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobFinder Pro
              </h1>
              <p className="text-xs text-gray-500 -mt-1">AI Job Matching</p>
            </div>
          </Link>
          <p className="mt-6 text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border">
          <h2 className="text-2xl font-bold text-center mb-8">Welcome Back</h2>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('successful') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-blue-900">Demo Account</h3>
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">ACTIVE</span>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Email:</strong> jmunuswa@gmail.com</p>
              <p><strong>Password:</strong> Closer@82</p>
              <p><strong>Role:</strong> QA Manager (14+ years)</p>
            </div>
            <button 
              type="button"
              onClick={fillDemoCredentials}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Use Demo Credentials
            </button>
          </div>

          <div className="mt-8 text-center space-y-4">
            <Link href="/auth/register" className="block text-blue-600 hover:text-purple-600 font-medium transition-colors">
              Don\'t have an account? Sign up →
            </Link>
            <Link href="/" className="block text-gray-600 hover:text-gray-900 transition-colors">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}