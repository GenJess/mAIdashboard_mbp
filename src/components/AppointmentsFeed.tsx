import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];

interface AppointmentsFeedProps {
  businessId: string;
  isSimulating?: boolean;
}

const AppointmentsFeed: React.FC<AppointmentsFeedProps> = ({ businessId, isSimulating = true }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Real-time data fetching and subscription
  useEffect(() => {
    if (!isSimulating) {
      fetchAppointments();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('appointments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `business_id=eq.${businessId}`,
          },
          (payload) => {
            console.log('Appointment change received:', payload);
            fetchAppointments(); // Refetch data on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [businessId, isSimulating]);

  // Mock simulation data (existing logic)
  useEffect(() => {
    if (isSimulating) {
      // Initialize with mock data
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          business_id: businessId,
          client_name: 'John Smith',
          client_phone: '(555) 123-4567',
          service: 'Haircut & Wash',
          status: 'confirmed',
          appointment_time: new Date(Date.now() - 5 * 60000).toISOString(),
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: '2',
          business_id: businessId,
          client_name: 'Sarah Johnson',
          client_phone: '(555) 987-6543',
          service: 'Color Treatment',
          status: 'pending',
          appointment_time: new Date(Date.now() - 15 * 60000).toISOString(),
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: '3',
          business_id: businessId,
          client_name: 'Mike Davis',
          client_phone: '(555) 456-7890',
          service: 'Beard Trim',
          status: 'completed',
          appointment_time: new Date(Date.now() - 30 * 60000).toISOString(),
          created_at: new Date(Date.now() - 30 * 60000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
        },
      ];
      setAppointments(mockAppointments);

      // Mock real-time appointment updates
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
          business_id: businessId,
          client_name: clients[Math.floor(Math.random() * clients.length)],
          client_phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          service: services[Math.floor(Math.random() * services.length)],
          status: ['confirmed', 'pending', 'completed'][Math.floor(Math.random() * 3)] as any,
          appointment_time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setAppointments(prev => {
          const updated = [newAppointment, ...prev];
          return updated.slice(0, 8); // Keep only latest 8 appointments
        });
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [businessId, isSimulating]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatAppointmentTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Live Appointments</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {!isSimulating && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Live Data
            </span>
          )}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {isSimulating ? 'Simulated booking updates' : 'Real-time booking updates'}
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <div className="space-y-1 p-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{appointment.client_name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{appointment.service}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatAppointmentTime(appointment.appointment_time)}</span>
                      </div>
                      <span>{formatTimeAgo(appointment.created_at)}</span>
                      {appointment.client_phone && (
                        <span>{appointment.client_phone}</span>
                      )}
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
              <p className="text-sm">
                {isSimulating ? 'Simulated bookings will appear here' : 'New bookings will appear here in real-time'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsFeed;