import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Calendar, Star, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';

type BusinessMetric = Database['public']['Tables']['business_metrics']['Row'];

interface Metric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface BusinessMetricsProps {
  businessId: string;
  isSimulating?: boolean;
}

const BusinessMetrics: React.FC<BusinessMetricsProps> = ({ businessId, isSimulating = true }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [revenueView, setRevenueView] = useState<'today' | 'week'>('today');

  // Real-time data fetching and subscription
  useEffect(() => {
    if (!isSimulating) {
      fetchMetrics();
      
      // Set up real-time subscriptions for all relevant tables
      const channels = [
        // Business metrics
        supabase
          .channel('metrics_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'business_metrics',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Metrics change received:', payload);
              fetchMetrics();
            }
          ),
        
        // Appointments (for customer count)
        supabase
          .channel('appointments_metrics')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'appointments',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Appointments change received:', payload);
              fetchMetrics();
            }
          ),
      ];

      // Subscribe to all channels
      channels.forEach(channel => channel.subscribe());

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
      };
    }
  }, [businessId, isSimulating]);

  // Mock simulation data
  useEffect(() => {
    if (isSimulating) {
      // Initialize with mock data - focused on key business metrics
      const mockMetrics: Metric[] = [
        {
          id: 'revenue',
          label: revenueView === 'today' ? 'Revenue Today' : 'Revenue This Week',
          value: revenueView === 'today' ? 847.50 : 4235.75,
          change: revenueView === 'today' ? 12.5 : 8.3,
          icon: DollarSign,
          color: 'green',
          trend: 'up',
        },
        {
          id: 'customers',
          label: 'New Customers',
          value: 8,
          change: 15.2,
          icon: Users,
          color: 'blue',
          trend: 'up',
        },
        {
          id: 'appointments',
          label: 'Appointments This Week',
          value: 24,
          change: -2.1,
          icon: Calendar,
          color: 'purple',
          trend: 'down',
        },
        {
          id: 'satisfaction',
          label: 'Overall Satisfaction',
          value: '4.8/5',
          change: 3.2,
          icon: Star,
          color: 'orange',
          trend: 'up',
        },
      ];
      setMetrics(mockMetrics);

      // Mock real-time updates
      const interval = setInterval(() => {
        setMetrics(prevMetrics => 
          prevMetrics.map(metric => {
            const randomChange = (Math.random() - 0.5) * 5; // Random change between -2.5 and 2.5
            let newValue = metric.value;
            
            if (typeof metric.value === 'number') {
              if (metric.id === 'revenue') {
                // For revenue, add small amounts
                newValue = Math.max(0, metric.value + Math.random() * 25);
              } else if (metric.id === 'customers' || metric.id === 'appointments') {
                newValue = Math.max(0, metric.value + Math.floor(randomChange / 2));
              }
            }

            return {
              ...metric,
              value: newValue,
              change: metric.change + (randomChange / 3),
              trend: randomChange > 0 ? 'up' as const : randomChange < 0 ? 'down' as const : 'stable' as const,
            };
          })
        );
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [businessId, isSimulating, revenueView]);

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        revenueToday,
        revenueWeek,
        appointmentsWeek,
        appointmentsToday
      ] = await Promise.all([
        // Revenue today
        supabase
          .from('business_metrics')
          .select('metric_value, metric_change')
          .eq('business_id', businessId)
          .eq('metric_name', 'revenue')
          .eq('date', today)
          .maybeSingle(),
        
        // Revenue this week
        supabase
          .from('business_metrics')
          .select('metric_value')
          .eq('business_id', businessId)
          .eq('metric_name', 'revenue')
          .gte('date', weekAgo),
        
        // Appointments this week
        supabase
          .from('appointments')
          .select('id, client_name')
          .eq('business_id', businessId)
          .gte('appointment_time', `${weekAgo}T00:00:00`),
        
        // Appointments today
        supabase
          .from('appointments')
          .select('id')
          .eq('business_id', businessId)
          .gte('appointment_time', `${today}T00:00:00`)
          .lt('appointment_time', `${today}T23:59:59`)
      ]);

      // Calculate metrics
      const salesToday = revenueToday.data?.metric_value ? parseFloat(revenueToday.data.metric_value) : 0;
      const salesTodayChange = revenueToday.data?.metric_change || 0;

      const salesWeek = revenueWeek.data?.reduce((sum, record) => 
        sum + parseFloat(record.metric_value), 0) || 0;

      const appointmentsThisWeek = appointmentsWeek.data?.length || 0;
      const appointmentsCount = appointmentsToday.data?.length || 0;

      // Count unique customers this week
      const uniqueCustomers = new Set(appointmentsWeek.data?.map(apt => apt.client_name) || []).size;

      // Create display metrics
      const displayMetrics: Metric[] = [
        {
          id: 'revenue',
          label: revenueView === 'today' ? 'Revenue Today' : 'Revenue This Week',
          value: revenueView === 'today' ? salesToday : salesWeek,
          change: salesTodayChange,
          icon: DollarSign,
          color: 'green',
          trend: salesTodayChange > 0 ? 'up' : salesTodayChange < 0 ? 'down' : 'stable',
        },
        {
          id: 'customers',
          label: 'New Customers',
          value: uniqueCustomers,
          change: 0,
          icon: Users,
          color: 'blue',
          trend: 'stable',
        },
        {
          id: 'appointments',
          label: 'Appointments This Week',
          value: appointmentsThisWeek,
          change: 0,
          icon: Calendar,
          color: 'purple',
          trend: 'stable',
        },
        {
          id: 'satisfaction',
          label: 'Overall Satisfaction',
          value: '4.8/5',
          change: 0,
          icon: Star,
          color: 'orange',
          trend: 'stable',
        },
      ];

      setMetrics(displayMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; icon: string; border: string } } = {
      green: { bg: 'bg-green-50', text: 'text-green-900', icon: 'text-green-500', border: 'border-green-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-500', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-500', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-900', icon: 'text-orange-500', border: 'border-orange-200' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const formatValue = (metric: Metric) => {
    if (metric.id === 'revenue') {
      return `$${typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}`;
    }
    return metric.value;
  };

  const toggleRevenueView = () => {
    setRevenueView(prev => prev === 'today' ? 'week' : 'today');
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Business Overview</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {!isSimulating && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Live Data
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Key performance indicators at a glance
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const colors = getColorClasses(metric.color);
            const IconComponent = metric.icon;
            
            return (
              <div
                key={metric.id}
                className={`p-6 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-md relative`}
              >
                {/* Revenue Toggle Button */}
                {metric.id === 'revenue' && (
                  <button
                    onClick={toggleRevenueView}
                    className="absolute top-4 right-4 flex items-center space-x-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <span>{revenueView === 'today' ? 'Today' : 'Week'}</span>
                    {revenueView === 'today' ? (
                      <ToggleLeft className="w-4 h-4" />
                    ) : (
                      <ToggleRight className="w-4 h-4" />
                    )}
                  </button>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white/50`}>
                    <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor(metric.trend)}`}>
                    <span>{getTrendIcon(metric.trend)}</span>
                    <span>{Math.abs(metric.change).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div>
                  <div className={`text-3xl font-bold ${colors.text} mb-2`}>
                    {formatValue(metric)}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusinessMetrics;