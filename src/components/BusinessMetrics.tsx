import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Calendar, Target, Award, Clock, Zap } from 'lucide-react';

interface Metric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

const BusinessMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'revenue',
      label: 'Today\'s Revenue',
      value: 847,
      change: 12.5,
      icon: DollarSign,
      color: 'green',
      trend: 'up',
    },
    {
      id: 'customers',
      label: 'Customers Served',
      value: 34,
      change: 8.3,
      icon: Users,
      color: 'blue',
      trend: 'up',
    },
    {
      id: 'appointments',
      label: 'Appointments Booked',
      value: 28,
      change: -2.1,
      icon: Calendar,
      color: 'purple',
      trend: 'down',
    },
    {
      id: 'efficiency',
      label: 'Service Efficiency',
      value: '94%',
      change: 5.7,
      icon: Zap,
      color: 'orange',
      trend: 'up',
    },
    {
      id: 'leads',
      label: 'New Leads This Week',
      value: 15,
      change: 23.4,
      icon: Target,
      color: 'indigo',
      trend: 'up',
    },
    {
      id: 'satisfaction',
      label: 'Customer Satisfaction',
      value: '4.8/5',
      change: 0.2,
      icon: Award,
      color: 'pink',
      trend: 'up',
    },
    {
      id: 'avgTime',
      label: 'Avg. Service Time',
      value: '28min',
      change: -3.1,
      icon: Clock,
      color: 'teal',
      trend: 'up',
    },
    {
      id: 'growth',
      label: 'Weekly Growth',
      value: '16.7%',
      change: 4.2,
      icon: TrendingUp,
      color: 'emerald',
      trend: 'up',
    },
  ]);

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          const randomChange = (Math.random() - 0.5) * 10; // Random change between -5 and 5
          let newValue = metric.value;
          
          if (typeof metric.value === 'number') {
            newValue = Math.max(0, metric.value + Math.floor(randomChange));
          } else if (metric.id === 'efficiency' || metric.id === 'growth') {
            const currentNum = parseFloat(metric.value.toString().replace(/[^\d.]/g, ''));
            const newNum = Math.max(0, Math.min(100, currentNum + randomChange / 2));
            newValue = metric.id === 'efficiency' ? `${newNum.toFixed(1)}%` : `${newNum.toFixed(1)}%`;
          } else if (metric.id === 'satisfaction') {
            const currentRating = parseFloat(metric.value.toString().split('/')[0]);
            const newRating = Math.max(1, Math.min(5, currentRating + randomChange / 20));
            newValue = `${newRating.toFixed(1)}/5`;
          } else if (metric.id === 'avgTime') {
            const currentTime = parseInt(metric.value.toString().replace(/\D/g, ''));
            const newTime = Math.max(5, currentTime + Math.floor(randomChange / 2));
            newValue = `${newTime}min`;
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
  }, []);

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; icon: string; border: string } } = {
      green: { bg: 'bg-green-50', text: 'text-green-900', icon: 'text-green-500', border: 'border-green-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-500', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-500', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-900', icon: 'text-orange-500', border: 'border-orange-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', icon: 'text-indigo-500', border: 'border-indigo-200' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-900', icon: 'text-pink-500', border: 'border-pink-200' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-900', icon: 'text-teal-500', border: 'border-teal-200' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', icon: 'text-emerald-500', border: 'border-emerald-200' },
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Business Metrics</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </h2>
            <p className="text-gray-600 text-sm mt-1">Real-time performance indicators</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    {typeof metric.value === 'number' && metric.id === 'revenue' 
                      ? `$${metric.value.toLocaleString()}`
                      : metric.value
                    }
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
              Set Goals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMetrics;