import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package, Calendar, Target, Award, Clock, Zap } from 'lucide-react';
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
        
        // Menu items (for total count)
        supabase
          .channel('menu_items_metrics')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'menu_items',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Menu items change received:', payload);
              fetchMetrics();
            }
          ),
        
        // Inventory items (for counts and low stock)
        supabase
          .channel('inventory_metrics')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'inventory_items',
              filter: `business_id=eq.${businessId}`,
            },
            (payload) => {
              console.log('Inventory change received:', payload);
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

  // Mock simulation data (existing logic)
  useEffect(() => {
    if (isSimulating) {
      // Initialize with mock data - updated for new relevant metrics
      const mockMetrics: Metric[] = [
        {
          id: 'sales_today',
          label: 'Sales Today',
          value: 247.50,
          change: 12.5,
          icon: DollarSign,
          color: 'green',
          trend: 'up',
        },
        {
          id: 'sales_week',
          label: 'Sales This Week',
          value: 1847.25,
          change: 8.3,
          icon: TrendingUp,
          color: 'blue',
          trend: 'up',
        },
        {
          id: 'low_stock',
          label: 'Low Stock Items',
          value: 3,
          change: -15.2,
          icon: AlertTriangle,
          color: 'red',
          trend: 'down',
        },
        {
          id: 'menu_items',
          label: 'Total Menu Items',
          value: 12,
          change: 0,
          icon: ShoppingCart,
          color: 'purple',
          trend: 'stable',
        },
        {
          id: 'inventory_items',
          label: 'Inventory Items',
          value: 24,
          change: 4.2,
          icon: Package,
          color: 'orange',
          trend: 'up',
        },
        {
          id: 'appointments',
          label: 'Appointments Today',
          value: 8,
          change: -2.1,
          icon: Calendar,
          color: 'indigo',
          trend: 'down',
        },
      ];
      setMetrics(mockMetrics);

      // Mock real-time updates
      const interval = setInterval(() => {
        setMetrics(prevMetrics => 
          prevMetrics.map(metric => {
            const randomChange = (Math.random() - 0.5) * 10; // Random change between -5 and 5
            let newValue = metric.value;
            
            if (typeof metric.value === 'number') {
              if (metric.id === 'sales_today' || metric.id === 'sales_week') {
                // For sales, add small amounts
                newValue = Math.max(0, metric.value + Math.random() * 50);
              } else {
                newValue = Math.max(0, metric.value + Math.floor(randomChange / 2));
              }
            }

            return {
              ...metric,
              value: newValue,
              change: metric.change + (randomChange / 5),
              trend: randomChange > 0 ? 'up' as const : randomChange < 0 ? 'down' as const : 'stable' as const,
            };
          })
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [businessId, isSimulating]);

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        revenueToday,
        revenueWeek,
        inventoryData,
        menuData,
        appointmentsToday
      ] = await Promise.all([
        // Revenue today - changed from .single() to .maybeSingle()
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
        
        // Inventory data
        supabase
          .from('inventory_items')
          .select('quantity, low_stock_threshold')
          .eq('business_id', businessId),
        
        // Menu items count
        supabase
          .from('menu_items')
          .select('id')
          .eq('business_id', businessId),
        
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

      const lowStockItems = inventoryData.data?.filter(item => 
        item.quantity <= item.low_stock_threshold).length || 0;

      const totalInventoryItems = inventoryData.data?.length || 0;
      const totalMenuItems = menuData.data?.length || 0;
      const appointmentsCount = appointmentsToday.data?.length || 0;

      // Create display metrics
      const displayMetrics: Metric[] = [
        {
          id: 'sales_today',
          label: 'Sales Today',
          value: salesToday,
          change: salesTodayChange,
          icon: DollarSign,
          color: 'green',
          trend: salesTodayChange > 0 ? 'up' : salesTodayChange < 0 ? 'down' : 'stable',
        },
        {
          id: 'sales_week',
          label: 'Sales This Week',
          value: salesWeek,
          change: 0, // Could calculate week-over-week if needed
          icon: TrendingUp,
          color: 'blue',
          trend: 'stable',
        },
        {
          id: 'low_stock',
          label: 'Low Stock Items',
          value: lowStockItems,
          change: 0,
          icon: AlertTriangle,
          color: 'red',
          trend: 'stable',
        },
        {
          id: 'menu_items',
          label: 'Total Menu Items',
          value: totalMenuItems,
          change: 0,
          icon: ShoppingCart,
          color: 'purple',
          trend: 'stable',
        },
        {
          id: 'inventory_items',
          label: 'Inventory Items',
          value: totalInventoryItems,
          change: 0,
          icon: Package,
          color: 'orange',
          trend: 'stable',
        },
        {
          id: 'appointments',
          label: 'Appointments Today',
          value: appointmentsCount,
          change: 0,
          icon: Calendar,
          color: 'indigo',
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
      red: { bg: 'bg-red-50', text: 'text-red-900', icon: 'text-red-500', border: 'border-red-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-500', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-900', icon: 'text-orange-500', border: 'border-orange-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', icon: 'text-indigo-500', border: 'border-indigo-200' },
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

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const formatValue = (metric: Metric) => {
    if (metric.id === 'sales_today' || metric.id === 'sales_week') {
      return `$${typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}`;
    }
    return metric.value;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Business Metrics</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {!isSimulating && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Live Data
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isSimulating ? 'Simulated performance indicators' : 'Real-time performance indicators'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => {
            const colors = getColorClasses(metric.color);
            const IconComponent = metric.icon;
            
            return (
              <div
                key={metric.id}
                className={`p-6 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-white/50`}>
                    <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor(metric.trend)}`}>
                    <span>{getTrendIcon(metric.trend, metric.change)}</span>
                    <span>{Math.abs(metric.change).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div>
                  <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                    {formatValue(metric)}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 font-medium transition-colors">
              Generate Report
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-900 font-medium transition-colors">
              View Analytics
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-900 font-medium transition-colors">
              Export Data
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-orange-900 font-medium transition-colors">
              Manage Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMetrics;