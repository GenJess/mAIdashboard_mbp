import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import AppointmentsFeed from './AppointmentsFeed';
import MenuInventory from './MenuInventory';
import BusinessMetrics from './BusinessMetrics';
import TasksList from './TasksList';
import VoiceAgentWidget from './VoiceAgentWidget';
import LiveCallsWidget from './LiveCallsWidget';
import LiveFeed from './LiveFeed';
import { useAuth } from '../hooks/useAuth';
import { Database } from '../lib/supabase';
import { Activity, Calendar, Package, BarChart3, CheckSquare, LogOut, Rss } from 'lucide-react';

type Business = Database['public']['Tables']['businesses']['Row'];

interface DashboardProps {
  business: Business;
}

const Dashboard: React.FC<DashboardProps> = ({ business }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('dashboard-live-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const { signOut } = useAuth();

  // Save to localStorage whenever isLiveMode changes
  useEffect(() => {
    localStorage.setItem('dashboard-live-mode', JSON.stringify(isLiveMode));
  }, [isLiveMode]);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleDataMode = () => {
    setIsLiveMode(!isLiveMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-500 capitalize">{business.type} Dashboard</p>
              </div>
              
              {/* Data Mode Toggle */}
              <button
                onClick={toggleDataMode}
                title="Simulated is fake data, live is real data"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isLiveMode
                    ? 'bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-2 border-blue-300'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`}></div>
                <span className="font-semibold">
                  {isLiveMode ? 'Live Data' : 'Simulated Data'}
                </span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <VoiceAgentWidget />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'menu', label: 'Menu & Inventory', icon: Package },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'livefeed', label: 'Live Feed', icon: Rss },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Full Width Business Metrics */}
            <BusinessMetrics businessId={business.id} isSimulating={!isLiveMode} />
            
            {/* Three Column Layout - Live Calls, Appointments, Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <LiveCallsWidget businessId={business.id} isSimulating={!isLiveMode} />
              <AppointmentsFeed businessId={business.id} isSimulating={!isLiveMode} />
              <TasksList businessId={business.id} compact isSimulating={!isLiveMode} />
            </div>
            
            {/* Full Width Calendar */}
            <CalendarView businessId={business.id} compact isSimulating={!isLiveMode} />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <CalendarView businessId={business.id} isSimulating={!isLiveMode} />
            </div>
            <div>
              <AppointmentsFeed businessId={business.id} isSimulating={!isLiveMode} />
            </div>
          </div>
        )}

        {activeTab === 'menu' && <MenuInventory businessId={business.id} isSimulating={!isLiveMode} />}
        {activeTab === 'tasks' && <TasksList businessId={business.id} isSimulating={!isLiveMode} />}
        {activeTab === 'livefeed' && <LiveFeed businessId={business.id} isSimulating={!isLiveMode} />}
      </main>
    </div>
  );
};

export default Dashboard;