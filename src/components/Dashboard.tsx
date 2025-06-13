import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import AppointmentsFeed from './AppointmentsFeed';
import MenuInventory from './MenuInventory';
import BusinessMetrics from './BusinessMetrics';
import TasksList from './TasksList';
import VoiceAgentWidget from './VoiceAgentWidget';
import { Mic, Activity, Calendar, Package, BarChart3, CheckSquare } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Mock real-time activity indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLiveMode(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
              <h1 className="text-xl font-semibold text-gray-900">Business Dashboard</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500' : 'bg-green-400'} animate-pulse`}></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
            <VoiceAgentWidget />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <BusinessMetrics />
              <CalendarView compact />
            </div>
            <div className="space-y-8">
              <AppointmentsFeed />
              <TasksList compact />
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <CalendarView />
            </div>
            <div>
              <AppointmentsFeed />
            </div>
          </div>
        )}

        {activeTab === 'menu' && <MenuInventory />}
        {activeTab === 'tasks' && <TasksList />}
      </main>
    </div>
  );
};

export default Dashboard;