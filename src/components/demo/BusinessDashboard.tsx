import React, { useState } from 'react';
import { Activity, Calendar, Package, BarChart3, CheckSquare, Rss } from 'lucide-react';
import BusinessMetrics from '../BusinessMetrics';
import AppointmentsFeed from '../AppointmentsFeed';
import LiveCallsWidget from '../LiveCallsWidget';
import CalendarView from '../CalendarView';
import MenuInventory from '../MenuInventory';
import TasksList from '../TasksList';
import LiveFeed from '../LiveFeed';

const BusinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  // Real business data from Supabase
  const mockBusiness = {
    id: '44fbb045-4885-4f95-bd66-d84200833fa2', // Real business ID from your Supabase
    name: 'Bella Vista Restaurant',
    type: 'restaurant'
  };

  const toggleDataMode = () => {
    setIsLiveMode(!isLiveMode);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{mockBusiness.name}</h1>
              <p className="text-sm text-gray-500 capitalize">{mockBusiness.type} Dashboard</p>
            </div>
          </div>
          
          {/* Data Mode Toggle */}
          <button
            onClick={toggleDataMode}
            title="Switch between simulated and live data"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isLiveMode
                ? 'bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-2 border-blue-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`}></div>
            <span className="font-semibold text-sm">
              {isLiveMode ? 'Live Data' : 'Simulated Data'}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
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
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        <div className="h-[600px]">
          {activeTab === 'overview' && (
            <div className="h-full flex flex-col space-y-6">
              {/* Business Metrics */}
              <div className="flex-shrink-0">
                <BusinessMetrics businessId={mockBusiness.id} isSimulating={!isLiveMode} />
              </div>
              
              {/* Two Equal Columns */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Column - Live Calls */}
                <div className="min-h-0">
                  <LiveCallsWidget businessId={mockBusiness.id} isSimulating={!isLiveMode} dashboardMode={true} />
                </div>
                
                {/* Right Column - Appointments */}
                <div className="min-h-0">
                  <AppointmentsFeed businessId={mockBusiness.id} isSimulating={!isLiveMode} dashboardMode={true} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
              <div className="xl:col-span-2 min-h-0">
                <CalendarView businessId={mockBusiness.id} isSimulating={!isLiveMode} />
              </div>
              <div className="min-h-0">
                <AppointmentsFeed businessId={mockBusiness.id} isSimulating={!isLiveMode} />
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="h-full overflow-auto">
              <MenuInventory businessId={mockBusiness.id} isSimulating={!isLiveMode} />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="h-full overflow-auto">
              <TasksList businessId={mockBusiness.id} isSimulating={!isLiveMode} />
            </div>
          )}

          {activeTab === 'livefeed' && (
            <div className="h-full overflow-auto">
              <LiveFeed businessId={mockBusiness.id} isSimulating={!isLiveMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;