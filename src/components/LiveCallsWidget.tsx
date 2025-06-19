import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, User, Clock, Mic, MicOff, Volume2, ChevronDown } from 'lucide-react';
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
  isVoiceAgent?: boolean;
  agentSpeaking?: boolean;
  userSpeaking?: boolean;
  vadScore?: number;
}

interface LiveCallsWidgetProps {
  businessId: string;
  isSimulating?: boolean;
  dashboardMode?: boolean;
  isDemoUser?: boolean;
}

const LiveCallsWidget: React.FC<LiveCallsWidgetProps> = ({ 
  businessId, 
  isSimulating, 
  dashboardMode = false,
  isDemoUser = false 
}) => {
  const [activeCalls, setActiveCalls] = useState<LiveCall[]>([]);
  const [callHistory, setCallHistory] = useState<Array<{ caller: string; time: Date; duration: number }>>([]);
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [dbCalls, setDbCalls] = useState<Call[]>([]);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [elevenLabsCallActive, setElevenLabsCallActive] = useState(false);
  const [currentElevenLabsCall, setCurrentElevenLabsCall] = useState<LiveCall | null>(null);

  // Listen for ElevenLabs widget events
  useEffect(() => {
    const handleElevenLabsEvents = (event: any) => {
      console.log('ElevenLabs event received:', event);

      // Listen for conversation start
      if (event.data?.type === 'conversation_initiation_metadata') {
        const newCall: LiveCall = {
          id: event.data.conversation_initiation_metadata_event?.conversation_id || Date.now().toString(),
          caller: 'Live Caller',
          phoneNumber: 'Voice Call',
          duration: 0,
          status: 'active',
          startTime: new Date(),
          purpose: 'Voice conversation',
          isVoiceAgent: true,
          agentSpeaking: false,
          userSpeaking: false,
          vadScore: 0
        };

        setCurrentElevenLabsCall(newCall);
        setActiveCalls([newCall]);
        setElevenLabsCallActive(true);
        setIsAgentActive(true);
      }

      // Listen for agent responses
      if (event.data?.type === 'agent_response') {
        setCurrentElevenLabsCall(prev => prev ? {
          ...prev,
          agentSpeaking: true,
          userSpeaking: false
        } : null);
      }

      // Listen for user transcripts
      if (event.data?.type === 'user_transcript') {
        setCurrentElevenLabsCall(prev => prev ? {
          ...prev,
          agentSpeaking: false,
          userSpeaking: true,
          caller: event.data.user_transcription_event?.user_transcript || prev.caller
        } : null);
      }

      // Listen for voice activity detection
      if (event.data?.type === 'vad_score') {
        const vadScore = event.data.vad_score_event?.vad_score || 0;
        setCurrentElevenLabsCall(prev => prev ? {
          ...prev,
          vadScore,
          userSpeaking: vadScore > 0.5,
          agentSpeaking: vadScore <= 0.5 && prev.agentSpeaking
        } : null);
      }

      // Listen for audio events (agent speaking)
      if (event.data?.type === 'audio') {
        setCurrentElevenLabsCall(prev => prev ? {
          ...prev,
          agentSpeaking: true,
          userSpeaking: false
        } : null);
      }
    };

    // Listen for postMessage events from ElevenLabs widget
    window.addEventListener('message', handleElevenLabsEvents);

    // Also listen for custom events from ElevenLabs widget
    const handleCustomEvents = (event: CustomEvent) => {
      handleElevenLabsEvents({ data: event.detail });
    };

    window.addEventListener('elevenlabs-conversation-start' as any, handleCustomEvents);
    window.addEventListener('elevenlabs-agent-response' as any, handleCustomEvents);
    window.addEventListener('elevenlabs-user-transcript' as any, handleCustomEvents);
    window.addEventListener('elevenlabs-vad-score' as any, handleCustomEvents);

    return () => {
      window.removeEventListener('message', handleElevenLabsEvents);
      window.removeEventListener('elevenlabs-conversation-start' as any, handleCustomEvents);
      window.removeEventListener('elevenlabs-agent-response' as any, handleCustomEvents);
      window.removeEventListener('elevenlabs-user-transcript' as any, handleCustomEvents);
      window.removeEventListener('elevenlabs-vad-score' as any, handleCustomEvents);
    };
  }, []);

  // Update call duration
  useEffect(() => {
    if (currentElevenLabsCall) {
      const interval = setInterval(() => {
        setCurrentElevenLabsCall(prev => prev ? {
          ...prev,
          duration: Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000)
        } : null);

        setActiveCalls(prev => 
          prev.map(call => call.isVoiceAgent ? {
            ...call,
            duration: Math.floor((new Date().getTime() - call.startTime.getTime()) / 1000)
          } : call)
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentElevenLabsCall]);

  // Real-time data fetching and subscription
  useEffect(() => {
    if (!isSimulating) {
      fetchCalls();
      
      // Set up real-time subscription - NO business_id filter in demo mode
      const channel = supabase
        .channel('calls_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls',
            // Only filter by business_id if NOT demo user
            ...(isDemoUser ? {} : { filter: `business_id=eq.${businessId}` })
          },
          (payload) => {
            console.log('Call change received:', payload);
            fetchCalls();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [businessId, isSimulating, isDemoUser]);

  // Mock simulation data (existing logic)
  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        const shouldStartCall = Math.random() > 0.85; // 15% chance every interval
        
        if (shouldStartCall && activeCalls.filter(call => !call.isVoiceAgent).length === 0) {
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
            isVoiceAgent: false,
          };
          
          setActiveCalls(prev => [...prev, newCall]);
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
                  ...prevHistory.slice(0, 19), // Keep only last 20 calls
                ]);
              }
              return prev.filter(call => call.id !== newCall.id);
            });
            
            // Only set agent inactive if no other calls
            setActiveCalls(current => {
              if (current.length <= 1) {
                setIsAgentActive(false);
              }
              return current.filter(call => call.id !== newCall.id);
            });
          }, callDuration);
        }
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [activeCalls.length, isSimulating]);

  const fetchCalls = async () => {
    try {
      let query = supabase.from('calls').select('*');
      
      // In demo mode: Show ALL calls from database
      // In real mode: Filter by business_id
      if (!isDemoUser) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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
      
      setCallHistory(history);
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

  const displayCalls = activeCalls;
  const displayHistory = callHistory.slice(0, displayLimit);
  const totalCalls = dbCalls.length;
  const avgDuration = dbCalls.length > 0 ? Math.round(dbCalls.reduce((acc, call) => acc + (call.duration || 0), 0) / dbCalls.length) : 0;

  const hasMoreCalls = callHistory.length > displayLimit;

  const loadMoreCalls = () => {
    setDisplayLimit(prev => prev + 5);
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-blue-500" />
              <span>Live Calls</span>
              <div className={`w-2 h-2 rounded-full ${isAgentActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              {isDemoUser && (
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  All Activity
                </span>
              )}
              {!isSimulating && !isDemoUser && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Live Data
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {displayCalls.length > 0 ? 'AI agent handling calls' : 'Waiting for calls'}
              {elevenLabsCallActive && ' • Voice agent active'}
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

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Active Calls */}
        {displayCalls.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-green-500" />
              <span>Active Call{displayCalls.length > 1 ? 's' : ''}</span>
            </h3>
            
            {displayCalls.map((call) => (
              <div
                key={call.id}
                className={`p-3 rounded-lg border transition-all duration-300 mb-2 ${
                  call.isVoiceAgent
                    ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-300'
                    : call.status === 'incoming' 
                      ? 'bg-yellow-50 border-yellow-200 animate-pulse' 
                      : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      call.isVoiceAgent
                        ? 'bg-purple-500'
                        : call.status === 'incoming' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{call.caller}</h4>
                        {call.isVoiceAgent && (
                          <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
                            Voice Agent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{call.phoneNumber}</p>
                      {call.purpose && (
                        <p className="text-xs text-gray-500 mt-1">{call.purpose}</p>
                      )}
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(call.duration)}</span>
                        </div>
                        <span className="flex items-center space-x-1">
                          <Volume2 className="w-3 h-3" />
                          <span>AI Agent</span>
                        </span>
                        {call.isVoiceAgent && (
                          <div className="flex items-center space-x-2">
                            {call.agentSpeaking && (
                              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse">
                                Agent Speaking
                              </span>
                            )}
                            {call.userSpeaking && (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
                                Customer Speaking
                              </span>
                            )}
                            {call.vadScore !== undefined && (
                              <span className="text-xs text-gray-400">
                                VAD: {Math.round(call.vadScore * 100)}%
                              </span>
                            )}
                          </div>
                        )}
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
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call History */}
        <div className="p-4 flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <PhoneOff className="w-4 h-4 text-gray-500" />
            <span>Recent Calls</span>
          </h3>
          
          {displayHistory.length > 0 ? (
            <div className="space-y-2">
              {displayHistory.map((call, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{call.caller}</p>
                      <p className="text-xs text-gray-500">{formatDuration(call.duration)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(call.time)}
                  </span>
                </div>
              ))}
              
              {hasMoreCalls && (
                <button
                  onClick={loadMoreCalls}
                  className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Load More Calls</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Phone className="w-8 h-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No recent calls</p>
              <p className="text-xs">Call history will appear here</p>
            </div>
          )}
        </div>

        {/* Call Statistics */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{totalCalls}</div>
              <div className="text-xs text-gray-600">Total Calls</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{avgDuration}s</div>
              <div className="text-xs text-gray-600">Avg Duration</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
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