import React, { useState } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { Building2, Store, Scissors, Coffee, Car, Heart, AlertCircle } from 'lucide-react';

const BusinessSetup: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createBusiness } = useBusiness();

  const businessTypes = [
    { id: 'barbershop', name: 'Barbershop / Salon', icon: Scissors, color: 'blue' },
    { id: 'restaurant', name: 'Restaurant / Cafe', icon: Coffee, color: 'green' },
    { id: 'retail', name: 'Retail Store', icon: Store, color: 'purple' },
    { id: 'automotive', name: 'Automotive Service', icon: Car, color: 'orange' },
    { id: 'healthcare', name: 'Healthcare / Wellness', icon: Heart, color: 'red' },
    { id: 'general', name: 'General Business', icon: Building2, color: 'gray' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Business name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await createBusiness(businessName.trim(), businessType);
      if (error) {
        setError(error.message || 'Failed to create business');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
      gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Your Business
            </h1>
            <p className="text-gray-600">
              Let's get your dashboard configured for your business type
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-3">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business name"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businessTypes.map((type) => {
                    const colors = getColorClasses(type.color);
                    const IconComponent = type.icon;
                    
                    return (
                      <label
                        key={type.id}
                        className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          businessType === type.id
                            ? `${colors.bg} ${colors.border} ring-2 ring-blue-500 ring-opacity-50`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="businessType"
                          value={type.id}
                          checked={businessType === type.id}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${businessType === type.id ? colors.bg : 'bg-gray-100'}`}>
                            <IconComponent className={`w-5 h-5 ${businessType === type.id ? colors.text : 'text-gray-500'}`} />
                          </div>
                          <span className={`font-medium ${businessType === type.id ? colors.text : 'text-gray-700'}`}>
                            {type.name}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    <span>Create Business Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;