import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Calendar, Package, CheckSquare, Phone, TrendingUp, ArrowRight, Filter } from 'lucide-react';
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
}

const LiveFeed: React.FC<LiveFeedProps> = ({ businessId, isSimulating = false }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(false);

  // Real-time data subscription
  useEffect(() => {
    if (!isSimulating) {
      setIsConnected(true);
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
            (payload) => handleRealtimeUpdate('appointment', payload)
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
            (payload) => handleRealtimeUpdate('task', payload)
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
            (payload) => handleRealtimeUpdate('inventory', payload)
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
            (payload) => handleRealtimeUpdate('menu', payload)
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
            (payload) => handleRealtimeUpdate('call', payload)
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
            (payload) => handleRealtimeUpdate('metric', payload)
          ),
      ];

      // Subscribe to all channels
      channels.forEach(channel => channel.subscribe());

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
        setIsConnected(false);
      };
    } else {
      // Simulation mode - generate mock activities
      generateMockActivities();
    }
  }, [businessId, isSimulating]);

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
      setActivities(initialActivities.slice(0, 20));
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
        type: 'task',
        action: 'completed',
        title: 'Clean equipment',
        description: 'Task completed - Priority: high',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: 'mock-3',
        type: 'inventory',
        action: 'updated',
        title: 'Inventory: Shampoo',
        description: 'Stock level: 15 bottles (Low stock alert)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: 'mock-4',
        type: 'call',
        action: 'created',
        title: 'Call from Mike Davis',
        description: 'Status: completed - Duration: 45s',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        id: 'mock-5',
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
      const types: ActivityItem['type'][] = ['appointment', 'task', 'inventory', 'menu', 'call', 'metric'];
      const actions: ActivityItem['action'][] = ['created', 'updated', 'completed'];
      
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const titles = {
        appointment: ['New appointment booked', 'Appointment confirmed', 'Appointment completed'],
        task: ['New task created', 'Task updated', 'Task completed'],
        inventory: ['Stock updated', 'Low stock alert', 'Inventory restocked'],
        menu: ['Menu item updated', 'New sale recorded', 'Price updated'],
        call: ['Incoming call', 'Call completed', 'Missed call'],
        metric: ['Revenue updated', 'Customer count updated', 'Performance metric updated'],
      };
      
      const newActivity: ActivityItem = {
        id: `mock-${Date.now()}`,
        type: randomType,
        action: randomAction,
        title: titles[randomType][Math.floor(Math.random() * titles[randomType].length)],
        description: 'Simulated activity update',
        timestamp: new Date(),
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }, 8000);

    return () => clearInterval(interval);
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
    if (action === 'completed') return 'text-green-600 bg-green-100';
    if (action === 'deleted') return 'text-red-600 bg-red-100';
    
    switch (type) {
      case 'appointment': return 'text-blue-600 bg-blue-100';
      case 'task': return 'text-purple-600 bg-purple-100';
      case 'inventory': return 'text-orange-600 bg-orange-100';
      case 'menu': return 'text-green-600 bg-green-100';
      case 'call': return 'text-indigo-600 bg-indigo-100';
      case 'metric': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: Activity },
    { value: 'appointment', label: 'Appointments', icon: Calendar },
    { value: 'task', label: 'Tasks', icon: CheckSquare },
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'call', label: 'Calls', icon: Phone },
    { value: 'metric', label: 'Metrics', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span>Live Activity Feed</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
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
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">
                {isConnected ? 'Connected to live data stream' : 'Connecting...'}
              </span>
            </div>
            <span className="text-gray-500">
              {filteredActivities.length} activities
            </span>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredActivities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type, activity.action);
                
                return (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${colorClasses}`}>
                        <IconComponent className="w-4 h-4" />
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
      </div>
    </div>
  );
};

export default LiveFeed;