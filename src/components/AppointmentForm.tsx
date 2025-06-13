import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Briefcase, Clock, Save, AlertCircle } from 'lucide-react';
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
  }, [appointment, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
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
    
    // Check if appointment time is in the past
    const appointmentDate = new Date(formData.appointment_time);
    const now = new Date();
    if (appointmentDate < now) {
      setError('Appointment time cannot be in the past');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

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
                min={new Date().toISOString().slice(0, 16)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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