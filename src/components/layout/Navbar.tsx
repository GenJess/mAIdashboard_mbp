import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const handleNavClick = (page: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleScrollTo = (elementId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <button 
              onClick={(e) => handleScrollTo('#learn-more', e)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Features
            </button>
            
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={(e) => handleScrollTo('#pricing', e)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Pricing
            </button>
            
            <button 
              onClick={(e) => handleScrollTo('#dashboard-demo', e)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Demo
            </button>
            
            <button 
              onClick={(e) => handleNavClick('getStarted', e)}
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
};

export default Navbar;