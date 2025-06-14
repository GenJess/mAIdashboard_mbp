import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Calendar, Package, CheckSquare, Phone, TrendingUp, ArrowRight, Filter, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';

type ActivityItem = {
  id: string;
  type: 'appointment' | 'task' | 'inventory' | 'menu' | 'call' | 'metric';
  action: 'created' | 'updated' | 'deleted' | 'completed';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
};

interface LiveFeedProps {
  businessId: string;
  isSimulating?: boolean;
  dashboardMode?: boolean;
}

const LiveFeed: React.FC<LiveFeedProps> = ({ businessId, isSimulating, dashboardMode = false }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(dashboardMode ? 8 : 20);

  // Real-time data subscription
  useEffect(() => {
    if (!isSimulating) {
      fetchInitialActivities();
      
      // Set up real-time subscriptions for all tables
      const channels = [
        // Appointments
        supabase
          .channel('live_feed_appointments')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'appointments',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Real-time appointment update:', payload);
              setIsConnected(true); // Set connected when we receive data
              handleRealtimeUpdate('appointment', payload);
            }
          ),
        
        // Tasks
        supabase
          .channel('live_feed_tasks')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Real-time task update:', payload);
              setIsConnected(true);
              handleRealtimeUpdate('task', payload);
            }
          ),
        
        // Inventory
        supabase
          .channel('live_feed_inventory')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'inventory_items',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Real-time inventory update:', payload);
              setIsConnected(true);
              handleRealtimeUpdate('inventory', payload);
            }
          ),
        
        // Menu Items
        supabase
          .channel('live_feed_menu')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'menu_items',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Real-time menu update:', payload);
              setIsConnected(true);
              handleRealtimeUpdate('menu', payload);
            }
          ),
        
        // Calls
        supabase
          .channel('live_feed_calls')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'calls',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Real-time call update:', payload);
              setIsConnected(true);
              handleRealtimeUpdate('call', payload);
            }
          ),
        
        // Business Metrics
        supabase
          .channel('live_feed_metrics')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'business_metrics',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Real-time metrics update:', payload);
              setIsConnected(true);
              handleRealtimeUpdate('metric', payload);
            }
          ),
      ];

      // Subscribe to all channels and monitor connection status
      channels.forEach(channel => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setIsConnected(false);
          }
        });
      });

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
        setIsConnected(false);
      };
    } else {
      // Simulation mode - generate mock activities
      setIsConnected(true);
      generateMockActivities();
    }
  }, [businessId, isSimulating, dashboardMode]);

  const fetchInitialActivities = async () => {
    try {
      // Fetch recent data from all tables to populate initial feed
      const [appointments, tasks, inventory, menuItems, calls, metrics] = await Promise.all([
        supabase.from('appointments').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(5),
        supabase.from('tasks').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(5),
        supabase.from('inventory_items').select('*').eq('business_id', businessId).order('updated_at', { ascending: false }).limit(5),
        supabase.from('menu_items').select('*').eq('business_id', businessId).order('updated_at', { ascending: false }).limit(5),
        supabase.from('calls').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(5),
        supabase.from('business_metrics').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(5),
      ]);

      const initialActivities: ActivityItem[] = [];

      // Convert appointments to activities
      appointments.data?.forEach(item => {
        initialActivities.push({
          id: `appointment-${item.id}`,
          type: 'appointment',
          action: 'created',
          title: `Appointment with ${item.client_name}`,
          description: `${item.service} scheduled for ${new Date(item.appointment_time).toLocaleString()}`,
          timestamp: new Date(item.created_at),
          metadata: item,
        });
      });

      // Convert tasks to activities
      tasks.data?.forEach(item => {
        initialActivities.push({
          id: `task-${item.id}`,
          type: 'task',
          action: item.status === 'completed' ? 'completed' : 'created',
          title: item.title,
          description: `Task ${item.status} - Priority: ${item.priority}`,
          timestamp: new Date(item.updated_at),
          metadata: item,
        });
      });

      // Convert inventory to activities
      inventory.data?.forEach(item => {
        initialActivities.push({
          id: `inventory-${item.id}`,
          type: 'inventory',
          action: 'updated',
          title: `Inventory: ${item.name}`,
          description: `Stock level: ${item.quantity} ${item.unit}`,
          timestamp: new Date(item.updated_at),
          metadata: item,
        });
      });

      // Convert menu items to activities
      menuItems.data?.forEach(item => {
        initialActivities.push({
          id: `menu-${item.id}`,
          type: 'menu',
          action: 'updated',
          title: `Menu: ${item.name}`,
          description: `Price: $${item.price} - Sold: ${item.sold_count || 0}`,
          timestamp: new Date(item.updated_at),
          metadata: item,
        });
      });

      // Convert calls to activities
      calls.data?.forEach(item => {
        initialActivities.push({
          id: `call-${item.id}`,
          type: 'call',
          action: 'created',
          title: `Call from ${item.caller_name}`,
          description: `Status: ${item.status} - Duration: ${item.duration || 0}s`,
          timestamp: new Date(item.created_at),
          metadata: item,
        });
      });

      // Convert metrics to activities
      metrics.data?.forEach(item => {
        initialActivities.push({
          id: `metric-${item.id}`,
          type: 'metric',
          action: 'updated',
          title: `Metric: ${item.metric_name}`,
          description: `Value: ${item.metric_value} (${item.metric_change > 0 ? '+' : ''}${item.metric_change}%)`,
          timestamp: new Date(item.created_at),
          metadata: item,
        });
      });

      // Sort by timestamp and set
      initialActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(initialActivities.slice(0, 50)); // Keep last 50 activities
    } catch (error) {
      console.error('Error fetching initial activities:', error);
    }
  };

  const handleRealtimeUpdate = (type: ActivityItem['type'], payload: any) => {
    console.log(`Real-time ${type} update:`, payload);
    
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    let action: ActivityItem['action'] = 'updated';
    if (eventType === 'INSERT') action = 'created';
    if (eventType === 'DELETE') action = 'deleted';
    
    const record = newRecord || oldRecord;
    if (!record) return;

    let title = '';
    let description = '';
    
    switch (type) {
      case 'appointment':
        title = `Appointment with ${record.client_name}`;
        description = `${record.service} - ${record.status}`;
        if (record.status === 'completed') action = 'completed';
        break;
      case 'task':
        title = record.title;
        description = `Task ${record.status} - Priority: ${record.priority}`;
        if (record.status === 'completed') action = 'completed';
        break;
      case 'inventory':
        title = `Inventory: ${record.name}`;
        description = `Stock level: ${record.quantity} ${record.unit}`;
        break;
      case 'menu':
        title = `Menu: ${record.name}`;
        description = `Price: $${record.price} - Sold: ${record.sold_count || 0}`;
        break;
      case 'call':
        title = `Call from ${record.caller_name}`;
        description = `Status: ${record.status}`;
        break;
      case 'metric':
        title = `Metric: ${record.metric_name}`;
        description = `Value: ${record.metric_value}`;
        break;
    }

    const newActivity: ActivityItem = {
      id: `${type}-${record.id}-${Date.now()}`,
      type,
      action,
      title,
      description,
      timestamp: new Date(),
      metadata: record,
    };

    setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  const generateMockActivities = () => {
    const mockActivities: ActivityItem[] = [
      {
        id: 'mock-1',
        type: 'appointment',
        action: 'created',
        title: 'Appointment with Sarah Johnson',
        description: 'Haircut scheduled for today at 2:00 PM',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: 'mock-2',
        type: 'call',
        action: 'created',
        title: 'Call from Mike Davis',
        description: 'Status: completed - Duration: 45s',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
      },
      {
        id: 'mock-3',
        type: 'menu',
        action: 'updated',
        title: 'Sale: Hamburger',
        description: 'Item sold - Revenue: $12.99',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
      },
      {
        id: 'mock-4',
        type: 'task',
        action: 'completed',
        title: 'Clean equipment',
        description: 'Task completed - Priority: high',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: 'mock-5',
        type: 'inventory',
        action: 'updated',
        title: 'Inventory: Shampoo',
        description: 'Stock level: 15 bottles (Low stock alert)',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        id: 'mock-6',
        type: 'metric',
        action: 'updated',
        title: 'Metric: Daily Revenue',
        description: 'Value: $847 (+12.5%)',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
      },
    ];

    setActivities(mockActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const coreTypes: ActivityItem['type'][] = ['appointment', 'call', 'menu'];
      const operationalTypes: ActivityItem['type'][] = ['task', 'inventory', 'metric'];
      
      // In dashboard mode, focus on customer activities
      const allTypes = dashboardMode ? coreTypes : [...coreTypes, ...operationalTypes];
      const actions: ActivityItem['action'][] = ['created', 'updated', 'completed'];
      
      const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const titles = {
        appointment: ['New appointment booked', 'Appointment confirmed', 'Appointment completed'],
        call: ['Incoming call received', 'Call completed', 'Customer inquiry'],
        menu: ['Item sold', 'New sale recorded', 'Revenue generated'],
        task: ['New task created', 'Task updated', 'Task completed'],
        inventory: ['Stock updated', 'Low stock alert', 'Inventory restocked'],
        metric: ['Revenue updated', 'Customer count updated', 'Performance metric updated'],
      };
      
      const descriptions = {
        appointment: ['Client booking confirmed', 'Service appointment scheduled', 'Customer visit completed'],
        call: ['Customer service call', 'Sales inquiry handled', 'Support request resolved'],
        menu: ['Product purchase completed', 'Service payment received', 'Transaction processed'],
        task: ['Operational task assigned', 'Maintenance activity', 'Administrative update'],
        inventory: ['Stock level changed', 'Supply management update', 'Inventory adjustment'],
        metric: ['Business performance data', 'Analytics update', 'KPI measurement'],
      };
      
      const newActivity: ActivityItem = {
        id: `mock-${Date.now()}`,
        type: randomType,
        action: randomAction,
        title: titles[randomType][Math.floor(Math.random() * titles[randomType].length)],
        description: descriptions[randomType][Math.floor(Math.random() * descriptions[randomType].length)],
        timestamp: new Date(),
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
    }, 8000);

    return () => clearInterval(interval);
  };

  // Helper function to determine if activity is core business activity
  const isCoreBusinessActivity = (type: ActivityItem['type']) => {
    return ['appointment', 'call', 'menu'].includes(type);
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'task': return CheckSquare;
      case 'inventory': return Package;
      case 'menu': return Package;
      case 'call': return Phone;
      case 'metric': return TrendingUp;
      default: return Activity;
    }
  };

  const getActivityColor = (type: ActivityItem['type'], action: ActivityItem['action']) => {
    const isCore = isCoreBusinessActivity(type);
    
    if (action === 'completed') return isCore ? 'text-green-600 bg-green-100' : 'text-green-600 bg-green-50';
    if (action === 'deleted') return isCore ? 'text-red-600 bg-red-100' : 'text-red-600 bg-red-50';
    
    switch (type) {
      case 'appointment': return 'text-blue-600 bg-blue-100';
      case 'call': return 'text-indigo-600 bg-indigo-100';
      case 'menu': return 'text-green-600 bg-green-100';
      case 'task': return 'text-purple-600 bg-purple-50';
      case 'inventory': return 'text-orange-600 bg-orange-50';
      case 'metric': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityContainerStyle = (type: ActivityItem['type'], action: ActivityItem['action']) => {
    const isCore = isCoreBusinessActivity(type);
    
    if (isCore) {
      // Core business activities get prominent styling with thicker border
      return {
        container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-8 border-blue-600 shadow-md',
        hover: 'hover:from-blue-100 hover:to-indigo-100 hover:shadow-lg',
        badge: 'bg-blue-500 text-white'
      };
    } else {
      // Operational activities get subtle styling
      return {
        container: 'bg-gray-100 border-l-4 border-gray-400',
        hover: 'hover:bg-gray-200',
        badge: 'bg-gray-400 text-white'
      };
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Filter activities based on dashboard mode and filter selection
  const filteredActivities = (() => {
    let filtered = activities;
    
    // In dashboard mode, only show customer-focused activities
    if (dashboardMode) {
      filtered = activities.filter(activity => isCoreBusinessActivity(activity.type));
    } else {
      // Apply regular filters for full feed mode
      filtered = filter === 'all' 
        ? activities 
        : filter === 'core'
        ? activities.filter(activity => isCoreBusinessActivity(activity.type))
        : filter === 'operational'
        ? activities.filter(activity => !isCoreBusinessActivity(activity.type))
        : activities.filter(activity => activity.type === filter);
    }
    
    return filtered;
  })();

  const displayedActivities = filteredActivities.slice(0, displayLimit);
  const hasMoreActivities = filteredActivities.length > displayLimit;

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: Activity },
    { value: 'core', label: 'Core Business', icon: Star },
    { value: 'operational', label: 'Operational', icon: CheckSquare },
    { value: 'appointment', label: 'Appointments', icon: Calendar },
    { value: 'call', label: 'Calls', icon: Phone },
    { value: 'menu', label: 'Sales', icon: Package },
    { value: 'task', label: 'Tasks', icon: CheckSquare },
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'metric', label: 'Metrics', icon: TrendingUp },
  ];

  if (dashboardMode) {
    // Dashboard mode - compact layout
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
        <div className="p-6 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span>Recent Activity</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                {!isSimulating && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Live Data
                  </span>
                )}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Customer-focused activity updates
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {displayedActivities.length > 0 ? (
            <div className="divide-y divide-gray-300">
              {displayedActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type, activity.action);
                const containerStyle = getActivityContainerStyle(activity.type, activity.action);
                
                return (
                  <div 
                    key={activity.id} 
                    className={`p-4 transition-all duration-200 ${containerStyle.container} ${containerStyle.hover}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className={`p-2 rounded-lg ${colorClasses}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs">
                          <span className={`px-2 py-1 rounded-full font-medium ${colorClasses}`}>
                            {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                          </span>
                          <span className="text-gray-500 capitalize">
                            {activity.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No recent activity</p>
              <p className="text-sm">
                Customer activities will appear here
              </p>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="p-4 border-t border-gray-300 bg-gray-50">
          <button
            onClick={() => window.location.hash = '#livefeed'}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <span>View All Activity</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Full feed mode - existing layout
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
        <div className="p-6 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span>Live Activity Feed</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                {!isSimulating && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Live Data
                  </span>
                )}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isSimulating ? 'Simulated real-time activity updates' : 'Real-time activity updates from your business'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="px-6 py-3 bg-gray-100 border-b border-gray-300">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">
                  {isConnected ? 'Connected to live data stream' : 'Connecting...'}
                </span>
              </div>
              
              {/* Activity Type Legend */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-1 bg-blue-600 rounded"></div>
                  <span className="text-xs text-gray-500">Core Business</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-1 bg-gray-400 rounded"></div>
                  <span className="text-xs text-gray-500">Operational</span>
                </div>
              </div>
            </div>
            <span className="text-gray-500">
              {displayedActivities.length} of {filteredActivities.length} activities
            </span>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {displayedActivities.length > 0 ? (
            <div className="divide-y divide-gray-300">
              {displayedActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type, activity.action);
                const containerStyle = getActivityContainerStyle(activity.type, activity.action);
                const isCore = isCoreBusinessActivity(activity.type);
                
                return (
                  <div 
                    key={activity.id} 
                    className={`p-6 transition-all duration-200 ${containerStyle.container} ${containerStyle.hover}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className={`p-2 rounded-lg ${colorClasses}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs">
                          <span className={`px-2 py-1 rounded-full font-medium ${colorClasses}`}>
                            {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                          </span>
                          <span className="text-gray-500 capitalize">
                            {activity.type.replace('_', ' ')}
                          </span>
                          <span className="text-gray-400">
                            {activity.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No activities yet</p>
              <p className="text-sm">
                {isSimulating 
                  ? 'Simulated activities will appear here as they happen'
                  : 'Real-time activities will appear here as they happen'
                }
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMoreActivities && (
          <div className="p-4 border-t border-gray-300 bg-gray-50">
            <button
              onClick={() => setDisplayLimit(prev => prev + 20)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Load More Activities ({filteredActivities.length - displayLimit} remaining)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;