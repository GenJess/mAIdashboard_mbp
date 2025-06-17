import React from 'react';
import { HeroWithMockup } from './ui/hero-with-mockup';
import { ScrollRevealContainer } from './ui/scroll-reveal-container';
import BusinessDashboard from './demo/BusinessDashboard';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { ChevronDown } from 'lucide-react';

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      <Navbar onNavigate={onNavigate} />
      <main>
        {/* Hero Section */}
        <HeroWithMockup
          title="Never Miss a Customer Call Again"
          description="Your AI receptionist works 24/7, answers every call, books appointments, and costs 90% less than hiring staff."
          primaryCta={{
            text: "Get Started",
            href: "getStarted",
          }}
          secondaryCta={{
            text: "See Demo",
            href: "#dashboard-demo",
            icon: <ChevronDown className="mr-2 h-4 w-4" />,
          }}
        />

        {/* Dashboard Section */}
        <section id="dashboard-demo" className="py-16 bg-gray-50 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See Your Business <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</span> in Action
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                This is a live simulation of how your business dashboard would look with our AI voice assistant handling your calls.
              </p>
            </div>
            
            <div className="max-w-7xl mx-auto">
              <ScrollRevealContainer>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                  <h3 className="text-xl font-semibold">Bella Vista Restaurant - Live Operations</h3>
                  <p className="text-blue-100 mt-1">Real-time business metrics with AI voice support</p>
                </div>
                <BusinessDashboard />
              </ScrollRevealContainer>
            </div>
          </div>
        </section>

        {/* Learn More Section */}
        <section id="learn-more" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                Our AI voice assistant integrates seamlessly with your business operations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Setup in Minutes</h3>
                  <p className="text-gray-600">Connect your phone number and customize your AI assistant's responses.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Handles Calls</h3>
                  <p className="text-gray-600">Your AI receptionist answers calls, books appointments, and handles inquiries 24/7.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Track Everything</h3>
                  <p className="text-gray-600">Monitor all interactions and business metrics in your real-time dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                Choose the plan that fits your business needs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Starter</h3>
                  <div className="text-3xl font-bold mb-4">$29<span className="text-lg text-gray-600">/month</span></div>
                  <ul className="text-left space-y-2 mb-8">
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Up to 100 calls/month</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Basic dashboard</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Email support</li>
                  </ul>
                  <button 
                    onClick={() => onNavigate && onNavigate('getStarted')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Get Started
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Professional</h3>
                  <div className="text-3xl font-bold mb-4">$79<span className="text-lg text-gray-600">/month</span></div>
                  <ul className="text-left space-y-2 mb-8">
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Up to 500 calls/month</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Full dashboard</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Priority support</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Custom integrations</li>
                  </ul>
                  <button 
                    onClick={() => onNavigate && onNavigate('getStarted')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Get Started
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
                  <div className="text-3xl font-bold mb-4">$199<span className="text-lg text-gray-600">/month</span></div>
                  <ul className="text-left space-y-2 mb-8">
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Unlimited calls</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Advanced analytics</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>24/7 support</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Custom AI training</li>
                  </ul>
                  <button 
                    onClick={() => onNavigate && onNavigate('getStarted')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;