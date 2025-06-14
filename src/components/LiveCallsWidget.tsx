import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, User, Clock, Mic, MicOff, Volume2 } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';

type Call = Database['public']['Tables']['calls']['Row'];

interface LiveCall {
  id: string;
  caller: string;
  phoneNumber: string;
  duration: number;
  status: 'incoming' | 'active' | 'on-hold';
  startTime: Date;
  purpose?: string;
}

interface LiveCallsWidgetProps {
  businessId: string;
  isSimulating?: boolean;
}

const LiveCallsWidget: React.FC<LiveCallsWidgetProps> = ({ businessId, isSimulating }) => {
  const [activeCalls, setActiveCalls] = useState<LiveCall[]>([]);
  const [callHistory, setCallHistory] = useState<Array<{ caller: string; time: Date; duration: number }>>([]);
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [dbCalls, setDbCalls] = useState<Call[]>([]);

  // Real-time data fetching and subscription
  useEffect(() => {
    if (!isSimulating) {
      fetchCalls();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('calls_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls',
            filter: `business_id=eq.${businessId}`,
          },
          (payload) => {
            console.log('Call change received:', payload);
            fetchCalls(); // Refetch data on any change
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
      const interval = setInterval(() => {
        const shouldStartCall = Math.random() > 0.85; // 15% chance every interval
        
        if (shouldStartCall && activeCalls.length === 0) {
          const callers = [
            { name: 'Sarah Johnson', phone: '(555) 123-4567', purpose: 'Appointment booking' },
            { name: 'Mike Davis', phone: '(555) 987-6543', purpose: 'Service inquiry' },
            { name: 'Emma Wilson', phone: '(555) 456-7890', purpose: 'Rescheduling' },
            { name: 'Alex Turner', phone: '(555) 321-0987', purpose: 'Product question' },
            { name: 'Lisa Brown', phone: '(555) 654-3210', purpose: 'Booking consultation' },
          ];
          
          const randomCaller = callers[Math.floor(Math.random() * callers.length)];
          
          const newCall: LiveCall = {
            id: Date.now().toString(),
            caller: randomCaller.name,
            phoneNumber: randomCaller.phone,
            duration: 0,
            status: 'incoming',
            startTime: new Date(),
            purpose: randomCaller.purpose,
          };
          
          setActiveCalls([newCall]);
          setIsAgentActive(true);
          
          // Auto-answer after 3 seconds
          setTimeout(() => {
            setActiveCalls(prev => 
              prev.map(call => 
                call.id === newCall.id 
                  ? { ...call, status: 'active' as const }
                  : call
              )
            );
          }, 3000);
          
          // End call after 15-45 seconds
          const callDuration = 15000 + Math.random() * 30000;
          setTimeout(() => {
            setActiveCalls(prev => {
              const endedCall = prev.find(call => call.id === newCall.id);
              if (endedCall) {
                setCallHistory(prevHistory => [
                  {
                    caller: endedCall.caller,
                    time: endedCall.startTime,
                    duration: Math.floor(callDuration / 1000),
                  },
                  ...prevHistory.slice(0, 4), // Keep only last 5 calls
                ]);
              }
              return prev.filter(call => call.id !== newCall.id);
            });
            setIsAgentActive(false);
          }, callDuration);
        }
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [activeCalls.length, isSimulating]);

  // Update call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCalls(prevCalls =>
        prevCalls.map(call => ({
          ...call,
          duration: Math.floor((new Date().getTime() - call.startTime.getTime()) / 1000),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching calls:', error);
        return;
      }

      setDbCalls(data || []);
      
      // Convert to call history format
      const history = (data || [])
        .filter(call => call.status === 'completed')
        .map(call => ({
          caller: call.caller_name,
          time: new Date(call.started_at),
          duration: call.duration || 0,
        }));
      
      setCallHistory(history.slice(0, 5));
    } catch (error) {
      console.error('Error fetching calls:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-hold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const displayCalls = isSimulating ? activeCalls : [];
  const displayHistory = isSimulating ? callHistory : callHistory;
  const totalCalls = isSimulating ? callHistory.length : dbCalls.length;
  const avgDuration = isSimulating 
    ? (callHistory.length > 0 ? Math.round(callHistory.reduce((acc, call) => acc + call.duration, 0) / callHistory.length) : 0)
    : (dbCalls.length > 0 ? Math.round(dbCalls.reduce((acc, call) => acc + (call.duration || 0), 0) / dbCalls.length) : 0);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-blue-500" />
              <span>Live Calls</span>
              <div className={`w-2 h-2 rounded-full ${isAgentActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              {!isSimulating && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Live Data
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {displayCalls.length > 0 ? 'AI agent handling calls' : 'Waiting for calls'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${isAgentActive ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isAgentActive ? (
                <Mic className="w-4 h-4 text-green-600" />
              ) : (
                <MicOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className={`text-sm font-medium ${isAgentActive ? 'text-green-600' : 'text-gray-500'}`}>
              {isAgentActive ? 'Active' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {/* Active Calls */}
        {displayCalls.length > 0 && (
          <div className="p-6 border-b border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-green-500" />
              <span>Active Call</span>
            </h3>
            
            {displayCalls.map((call) => (
              <div
                key={call.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  call.status === 'incoming' 
                    ? 'bg-yellow-50 border-yellow-200 animate-pulse' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      call.status === 'incoming' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{call.caller}</h4>
                      <p className="text-sm text-gray-600">{call.phoneNumber}</p>
                      {call.purpose && (
                        <p className="text-sm text-gray-500 mt-1">{call.purpose}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(call.duration)}</span>
                        </div>
                        <span className="flex items-center space-x-1">
                          <Volume2 className="w-3 h-3" />
                          <span>AI Agent</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(call.status)}`}>
                      {call.status === 'incoming' ? 'Incoming' : 
                       call.status === 'active' ? 'Active' : 'On Hold'}
                    </span>
                    {call.status === 'incoming' && (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call History */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <PhoneOff className="w-4 h-4 text-gray-500" />
            <span>Recent Calls</span>
          </h3>
          
          {displayHistory.length > 0 ? (
            <div className="space-y-3">
              {displayHistory.map((call, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{call.caller}</p>
                      <p className="text-sm text-gray-500">Duration: {formatDuration(call.duration)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(call.time)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent calls</p>
              <p className="text-sm">Call history will appear here</p>
            </div>
          )}
        </div>

        {/* Call Statistics */}
        <div className="p-6 border-t border-gray-300 bg-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalCalls}</div>
              <div className="text-xs text-gray-600">Calls Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{avgDuration}s</div>
              <div className="text-xs text-gray-600">Avg Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {displayCalls.length > 0 ? '100%' : '0%'}
              </div>
              <div className="text-xs text-gray-600">Answer Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCallsWidget;