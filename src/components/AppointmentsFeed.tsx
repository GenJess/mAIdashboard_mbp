import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, Calendar, AlertCircle } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  client: string;
  service: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  timestamp: Date;
  isNew?: boolean;
}

const AppointmentsFeed: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      time: '09:00 AM',
      client: 'John Smith',
      service: 'Haircut & Wash',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      time: '10:30 AM',
      client: 'Sarah Johnson',
      service: 'Color Treatment',
      status: 'pending',
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      time: '02:00 PM',
      client: 'Mike Davis',
      service: 'Beard Trim',
      status: 'completed',
      timestamp: new Date(Date.now() - 30 * 60000),
    },
  ]);

  // Mock real-time appointment updates
  useEffect(() => {
    const interval = setInterval(() => {
      const services = [
        'Haircut', 'Beard Trim', 'Hair Wash', 'Color Treatment', 'Styling',
        'Deep Cleaning', 'Manicure', 'Consultation', 'Treatment', 'Massage'
      ];
      const clients = [
        'Alex Turner', 'Lisa Brown', 'David Miller', 'Rachel Green',
        'Tom Wilson', 'Emma Davis', 'Chris Anderson', 'Sophia Lee',
        'Ryan Clark', 'Maya Patel', 'Jake Thompson', 'Olivia Martin'
      ];

      const newAppointment: Appointment = {
        id: Date.now().toString(),
        time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        client: clients[Math.floor(Math.random() * clients.length)],
        service: services[Math.floor(Math.random() * services.length)],
        status: ['confirmed', 'pending', 'completed'][Math.floor(Math.random() * 3)] as any,
        timestamp: new Date(),
        isNew: true,
      };

      setAppointments(prev => {
        const updated = [newAppointment, ...prev];
        return updated.slice(0, 8); // Keep only latest 8 appointments
      });

      // Remove the "new" flag after animation
      setTimeout(() => {
        setAppointments(prev => 
          prev.map(apt => apt.id === newAppointment.id ? { ...apt, isNew: false } : apt)
        );
      }, 3000);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Live Appointments</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </h2>
        <p className="text-gray-600 text-sm mt-1">Real-time booking updates</p>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <div className="space-y-1 p-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`p-4 rounded-lg border transition-all duration-500 ${
                appointment.isNew 
                  ? 'bg-blue-50 border-blue-200 scale-105 shadow-md' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{appointment.client}</h3>
                      {appointment.isNew && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{appointment.service}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{appointment.time}</span>
                      </div>
                      <span>{formatTimeAgo(appointment.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(appointment.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {appointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No appointments yet</p>
              <p className="text-sm">New bookings will appear here in real-time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsFeed;