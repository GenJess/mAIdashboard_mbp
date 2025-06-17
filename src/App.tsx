import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useBusiness } from './hooks/useBusiness';
import AuthForm from './components/AuthForm';
import BusinessSetup from './components/BusinessSetup';
import Dashboard from './components/Dashboard';
import DemoPage from './components/DemoPage';
import HomePage from './components/HomePage';
import { Activity, ChevronDown } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const [currentPage, setCurrentPage] = useState('home');

  // Navigation component
  const Navigation = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">VoiceAgent</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'home' 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Home
            </button>
            
            <div className="relative group">
              <button
                onClick={() => onNavigate('learnMore')}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                  currentPage === 'learnMore' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <span>Learn More</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => onNavigate('pricing')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'pricing' 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Pricing
            </button>
            
            <button
              onClick={() => onNavigate('demo')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'demo' 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Demo
            </button>
            
            <button
              onClick={() => onNavigate('getStarted')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Placeholder pages
  const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">This page is coming soon.</p>
        <button
          onClick={() => setCurrentPage('home')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  // Render different pages based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'demo':
        return <DemoPage />;
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'learnMore':
        return <PlaceholderPage title="Learn More" />;
      case 'pricing':
        return <PlaceholderPage title="Pricing" />;
      case 'getStarted':
        // For "Get Started", we want to show the authentication flow
        if (authLoading || businessLoading) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          );
        }

        if (!user) {
          return <AuthForm />;
        }

        if (!business) {
          return <BusinessSetup />;
        }

        return <Dashboard business={business} />;
      case 'dashboard':
        // Original dashboard logic for direct access
        if (authLoading || businessLoading) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          );
        }

        if (!user) {
          return <AuthForm />;
        }

        if (!business) {
          return <BusinessSetup />;
        }

        return <Dashboard business={business} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen">
      {currentPage !== 'home' && <Navigation onNavigate={setCurrentPage} />}
      {renderPage()}
    </div>
  );
}

export default App;