import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, Calendar, AlertCircle, Plus, Edit, Zap } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';
import AppointmentForm from './AppointmentForm';

type Appointment = Database['public']['Tables']['appointments']['Row'];

interface AppointmentsFeedProps {
  businessId: string;
  isSimulating?: boolean;
  dashboardMode?: boolean;
}

const AppointmentsFeed: React.FC<AppointmentsFeedProps> = ({ businessId, isSimulating, dashboardMode = false }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

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
      // Initialize with mock data - upcoming appointments only
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          business_id: businessId,
          client_name: 'John Smith',
          client_phone: '(555) 123-4567',
          service: 'Haircut & Wash',
          status: 'confirmed',
          appointment_time: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes from now
          created_at: new Date(Date.now() - 30 * 60000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
          id: '2',
          business_id: businessId,
          client_name: 'Sarah Johnson',
          client_phone: '(555) 987-6543',
          service: 'Color Treatment',
          status: 'pending',
          appointment_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: '3',
          business_id: businessId,
          client_name: 'Mike Davis',
          client_phone: '(555) 456-7890',
          service: 'Beard Trim',
          status: 'confirmed',
          appointment_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
          updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
        },
        {
          id: '4',
          business_id: businessId,
          client_name: 'Emma Wilson',
          client_phone: '(555) 321-0987',
          service: 'Styling',
          status: 'confirmed',
          appointment_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
          created_at: new Date(Date.now() - 60 * 60000).toISOString(),
          updated_at: new Date(Date.now() - 60 * 60000).toISOString(),
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
          status: ['confirmed', 'pending'][Math.floor(Math.random() * 2)] as any,
          appointment_time: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(), // Random time in next 48 hours
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setAppointments(prev => {
          const updated = [newAppointment, ...prev];
          return updated.slice(0, 8); // Keep only latest 8 appointments
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [businessId, isSimulating]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', businessId)
        .gte('appointment_time', new Date().toISOString()) // Only upcoming appointments
        .order('appointment_time', { ascending: true })
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

  const handleFormSave = () => {
    if (!isSimulating) {
      fetchAppointments();
    }
    setEditingAppointment(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowForm(true);
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

  const formatAppointmentTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / 60000);
    
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    const dateString = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    if (diffInMinutes < 60) {
      return `${timeString} (${diffInMinutes}m)`;
    } else if (diffInMinutes < 1440) {
      return `${timeString} (${Math.floor(diffInMinutes / 60)}h)`;
    } else {
      return `${dateString} ${timeString}`;
    }
  };

  const isLiveAppointment = (timestamp: string) => {
    const appointmentTime = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((appointmentTime.getTime() - now.getTime()) / 60000);
    
    // Consider appointment "live" if it's within 15 minutes of start time
    return diffInMinutes >= -15 && diffInMinutes <= 15;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
        <div className="p-6 border-b border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Upcoming Appointments</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {!isSimulating && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Live Data
                  </span>
                )}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isSimulating ? 'Simulated upcoming appointments' : 'Real-time upcoming appointments'}
              </p>
            </div>
          </div>
          
          {!dashboardMode && (
            <button
              onClick={handleNewAppointment}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Book New Appointment</span>
            </button>
          )}
        </div>

        <div className={`${dashboardMode ? 'max-h-[400px]' : 'max-h-[400px]'} overflow-y-auto`}>
          <div className="space-y-1 p-4">
            {appointments.map((appointment) => {
              const isLive = isLiveAppointment(appointment.appointment_time);
              
              return (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isLive 
                      ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-300' 
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{appointment.client_name}</h3>
                          {isLive && (
                            <span className="px-2 py-1 text-xs font-bold bg-orange-500 text-white rounded-full animate-pulse flex items-center space-x-1">
                              <Zap className="w-3 h-3" />
                              <span>LIVE NOW</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{appointment.service}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatAppointmentTime(appointment.appointment_time)}</span>
                          </div>
                          {appointment.client_phone && (
                            <span>{appointment.client_phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!dashboardMode && (
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit appointment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming appointments</p>
                <p className="text-sm">
                  {isSimulating ? 'Simulated bookings will appear here' : 'New bookings will appear here in real-time'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {!dashboardMode && (
        <AppointmentForm
          businessId={businessId}
          appointment={editingAppointment}
          isOpen={showForm}
          onClose={handleFormClose}
          onSave={handleFormSave}
          isSimulating={isSimulating}
        />
      )}
    </>
  );
};

export default AppointmentsFeed;