import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Briefcase, Clock, Save, AlertCircle } from 'lucide-react';
import { addMinutes, isBefore, isAfter, isSameMinute, isSameHour, isSameDay, format, startOfDay, setHours, setMinutes, getDay, isValid, parseISO } from 'date-fns';
import { supabase, Database } from '../lib/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];

interface AppointmentFormProps {
  businessId: string;
  appointment?: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSimulating?: boolean;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  businessId,
  appointment,
  isOpen,
  onClose,
  onSave,
  isSimulating = true
}) => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    service: '',
    appointment_time: '',
    status: 'pending' as const
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedTime, setSuggestedTime] = useState<string>('');

  // Populate form when editing an existing appointment
  useEffect(() => {
    if (appointment) {
      setFormData({
        client_name: appointment.client_name,
        client_phone: appointment.client_phone || '',
        service: appointment.service,
        appointment_time: new Date(appointment.appointment_time).toISOString().slice(0, 16),
        status: appointment.status
      });
    } else {
      // Reset form for new appointment
      setFormData({
        client_name: '',
        client_phone: '',
        service: '',
        appointment_time: '',
        status: 'pending'
      });
    }
    setError('');
    setSuggestedTime('');
  }, [appointment, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if a time is within working hours (Monday-Friday, 8 AM - 5 PM, 30-minute intervals)
  const isWorkingHours = (date: Date): boolean => {
    if (!isValid(date)) return false;
    
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Check if it's a weekday (Monday-Friday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Check if time is between 8 AM and 5 PM
    if (hours < 8 || hours >= 17) {
      return false;
    }
    
    // Check if minutes are on 30-minute intervals (0 or 30)
    if (minutes !== 0 && minutes !== 30) {
      return false;
    }
    
    // Last valid start time for 30-minute appointment is 4:30 PM
    if (hours === 16 && minutes === 30) {
      return true;
    }
    
    return hours < 16 || (hours === 16 && minutes === 0);
  };

  // Round time up to next 30-minute interval
  const roundToNext30Minutes = (date: Date): Date => {
    const minutes = date.getMinutes();
    const roundedMinutes = minutes <= 30 ? 30 : 60;
    
    if (roundedMinutes === 60) {
      return setMinutes(addMinutes(date, 60 - minutes), 0);
    } else {
      return setMinutes(date, roundedMinutes);
    }
  };

  // Find next available 30-minute slot
  const findNextAvailableSlot = async (startTime: Date): Promise<Date> => {
    let currentSlot = new Date(startTime);
    const now = new Date();
    
    // Start from at least 30 minutes from now or the requested time, whichever is later
    const minStartTime = addMinutes(now, 30);
    if (isBefore(currentSlot, minStartTime)) {
      currentSlot = minStartTime;
    }
    
    // Round up to next 30-minute interval
    currentSlot = roundToNext30Minutes(currentSlot);
    
    // Look for available slot within next 30 days
    const maxDate = addMinutes(now, 30 * 24 * 60); // 30 days from now
    
    while (isBefore(currentSlot, maxDate)) {
      // Check if slot is within working hours
      if (isWorkingHours(currentSlot)) {
        // Check for conflicts with existing appointments
        if (!isSimulating) {
          try {
            const slotEnd = addMinutes(currentSlot, 30);
            
            const { data: conflictingAppointments, error } = await supabase
              .from('appointments')
              .select('appointment_time')
              .eq('business_id', businessId)
              .gte('appointment_time', currentSlot.toISOString())
              .lt('appointment_time', slotEnd.toISOString());
            
            if (error) {
              console.error('Error checking for conflicts:', error);
              return currentSlot; // Return current slot if we can't check
            }
            
            // If no conflicts found, this slot is available
            if (!conflictingAppointments || conflictingAppointments.length === 0) {
              return currentSlot;
            }
          } catch (error) {
            console.error('Error checking availability:', error);
            return currentSlot;
          }
        } else {
          // In simulation mode, just return the first valid working hours slot
          return currentSlot;
        }
      }
      
      // Move to next 30-minute slot
      currentSlot = addMinutes(currentSlot, 30);
    }
    
    // If no slot found, return the original time (will be caught by validation)
    return startTime;
  };

  const validateForm = async () => {
    if (!formData.client_name.trim()) {
      setError('Client name is required');
      return false;
    }
    if (!formData.service.trim()) {
      setError('Service is required');
      return false;
    }
    if (!formData.appointment_time) {
      setError('Appointment time is required');
      return false;
    }
    
    const appointmentDate = new Date(formData.appointment_time);
    const now = new Date();
    
    if (!isValid(appointmentDate)) {
      setError('Invalid appointment time');
      return false;
    }
    
    if (isBefore(appointmentDate, now)) {
      setError('Appointment time cannot be in the past');
      return false;
    }

    // Check if appointment is within working hours
    if (!isWorkingHours(appointmentDate)) {
      const suggested = await findNextAvailableSlot(appointmentDate);
      setSuggestedTime(suggested.toISOString().slice(0, 16));
      setError('Appointments can only be booked Monday-Friday, 8:00 AM - 4:30 PM, in 30-minute intervals. Please select a valid time or use the suggested time below.');
      return false;
    }

    // Check for conflicts
    const availableSlot = await findNextAvailableSlot(appointmentDate);
    if (!isSameMinute(appointmentDate, availableSlot)) {
      setSuggestedTime(availableSlot.toISOString().slice(0, 16));
      setError(`Sorry, that time slot is not available. The next available appointment is suggested below.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const appointmentData = {
        business_id: businessId,
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone.trim() || null,
        service: formData.service.trim(),
        appointment_time: new Date(formData.appointment_time).toISOString(),
        status: formData.status
      };

      if (!isSimulating) {
        if (appointment) {
          // Update existing appointment
          const { error } = await supabase
            .from('appointments')
            .update(appointmentData)
            .eq('id', appointment.id);

          if (error) {
            setError(error.message);
            return;
          }
        } else {
          // Create new appointment
          const { error } = await supabase
            .from('appointments')
            .insert(appointmentData);

          if (error) {
            setError(error.message);
            return;
          }
        }
      }

      // Success - close form and refresh data
      onSave();
      onClose();
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const useSuggestedTime = () => {
    setFormData(prev => ({
      ...prev,
      appointment_time: suggestedTime
    }));
    setSuggestedTime('');
    setError('');
  };

  const serviceOptions = [
    'Haircut',
    'Haircut & Wash',
    'Color Treatment',
    'Beard Trim',
    'Styling',
    'Deep Cleaning',
    'Manicure',
    'Consultation',
    'Treatment',
    'Massage',
    'Other'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>{appointment ? 'Edit Appointment' : 'Book New Appointment'}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm font-medium">Booking Error</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
              
              {suggestedTime && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm font-medium mb-2">Suggested alternative:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 text-sm">
                      {format(new Date(suggestedTime), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                    </span>
                    <button
                      type="button"
                      onClick={useSuggestedTime}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-medium transition-colors"
                    >
                      Use This Time
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Working Hours Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Business Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM<br />
              <strong>Appointment Duration:</strong> 30 minutes (times available every 30 minutes)
            </p>
          </div>

          {/* Client Name */}
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>
          </div>

          {/* Client Phone */}
          <div>
            <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="client_phone"
                name="client_phone"
                value={formData.client_phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Service */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
              Service *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select a service</option>
                {serviceOptions.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Appointment Time */}
          <div>
            <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                id="appointment_time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleInputChange}
                required
                step="1800"
                min={new Date().toISOString().slice(0, 16)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Appointments are scheduled in 30-minute intervals during business hours
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{appointment ? 'Update' : 'Book'} Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;