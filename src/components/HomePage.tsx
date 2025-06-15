import React from 'react';
import { HeroWithMockup } from './ui/hero-with-mockup';
import { ScrollRevealContainer } from './ui/scroll-reveal-container';
import BusinessDashboard from './demo/BusinessDashboard';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { ChevronDown } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <HeroWithMockup
          title="Never Miss a Customer Call Again"
          description="Your AI receptionist works 24/7, answers every call, books appointments, and costs 90% less than hiring staff."
          primaryCta={{
            text: "Get Started",
            href: "#dashboard-demo",
          }}
          secondaryCta={{
            text: "Learn More",
            href: "#learn-more",
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
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;