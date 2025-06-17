import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Building2, Mail, Lock, User, AlertCircle, Zap, ArrowLeft } from 'lucide-react';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { signIn, signUp, autoSignInDemo } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDemo = async () => {
    setLoading(true);
    setError('');
    setShowForm(false);
    await autoSignInDemo();
    setLoading(false);
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-8 text-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Live Business Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Experience a fully functional business management system
              </p>
            </div>

            {/* Demo Experience */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-4">
                  <Zap className="w-4 h-4" />
                  <span>Try the Live Demo</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Explore without signing up
                </h2>
                <p className="text-gray-600 mb-6">
                  Jump right in and experience real-time appointments, inventory management, 
                  task tracking, and AI-powered voice assistance.
                </p>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">🎯 Real-Time Data</h3>
                  <p className="text-blue-700 text-sm">Live appointments, calls, and business metrics</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">🤖 AI Voice Agent</h3>
                  <p className="text-purple-700 text-sm">Book appointments and manage tasks by voice</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">📊 Complete Dashboard</h3>
                  <p className="text-green-700 text-sm">Calendar, inventory, tasks, and analytics</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-2">⚡ Live Updates</h3>
                  <p className="text-orange-700 text-sm">Real-time feed of all business activities</p>
                </div>
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading your demo dashboard...</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In / Create Account</span>
                </button>
                
                <div className="text-center">
                  <p className="text-gray-500 text-sm">
                    Want to try first?{' '}
                    <button
                      onClick={handleBackToDemo}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      Continue to demo dashboard
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-gray-200">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Start managing your business today' : 'Sign in to your dashboard'}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleBackToDemo}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                ← Back to demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;