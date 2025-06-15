import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
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
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Features
            </a>
            
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            
            <a href="#dashboard-demo" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Demo
            </a>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
};

export default Navbar;