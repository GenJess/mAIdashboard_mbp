import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Zap } from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';

const VoiceAgentWidget: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { business } = useBusiness();

  // Simple appointment booking tool - no auth bullshit
  const clientTools = [
    {
      name: 'bookAppointment',
      description: 'Book a new appointment for a client',
      parameters: {
        type: 'object',
        properties: {
          client_name: {
            type: 'string',
            description: 'The name of the client'
          },
          service: {
            type: 'string',
            description: 'The service requested (e.g., haircut, color treatment, beard trim)'
          },
          appointment_time: {
            type: 'string',
            description: 'The appointment date and time in ISO format'
          },
          client_phone: {
            type: 'string',
            description: 'The client phone number (optional)'
          }
        },
        required: ['client_name', 'service', 'appointment_time']
      },
      handler: async (parameters: any) => {
        try {
          console.log('Booking appointment with parameters:', parameters);
          
          // Simple HTTP request to Supabase RPC endpoint
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/book_appointment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              p_client_name: parameters.client_name,
              p_service: parameters.service,
              p_appointment_time: parameters.appointment_time,
              p_client_phone: parameters.client_phone || null
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Appointment booking result:', result);

          if (result.success) {
            return {
              success: true,
              message: `Appointment booked for ${parameters.client_name} on ${new Date(parameters.appointment_time).toLocaleDateString()} at ${new Date(parameters.appointment_time).toLocaleTimeString()}`
            };
          } else {
            throw new Error(result.message || 'Unknown error');
          }
        } catch (error) {
          console.error('Failed to book appointment:', error);
          return {
            success: false,
            message: 'Failed to book appointment. Please try again.'
          };
        }
      }
    }
  ];

  const toggleListening = async () => {
    if (!isListening) {
      try {
        // Start ElevenLabs conversation with client tools
        const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY || ''
          },
          body: JSON.stringify({
            agent_id: 'agent_01jxn3j620ey1a72c9pmr0nbg6',
            client_tools: clientTools.map(tool => ({
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          setConversationId(data.conversation_id);
          setIsListening(true);
          console.log('Voice agent started');
        } else {
          console.error('Failed to start conversation');
        }
      } catch (error) {
        console.error('Error starting voice agent:', error);
      }
    } else {
      setIsListening(false);
      setConversationId(null);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Play notification sound when unmuting
    if (isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Play notification sound when voice agent becomes active
  useEffect(() => {
    if (isListening && !isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [isListening, isMuted]);

  // Listen for client tool calls from ElevenLabs
  useEffect(() => {
    if (!conversationId) return;

    const handleClientToolCall = async (event: MessageEvent) => {
      if (event.data.type === 'client_tool_call') {
        const { tool_name, parameters } = event.data;
        
        // Find and execute the appropriate tool
        const tool = clientTools.find(t => t.name === tool_name);
        if (tool) {
          console.log(`Executing tool: ${tool_name}`, parameters);
          const result = await tool.handler(parameters);
          
          // Send result back to ElevenLabs
          window.postMessage({
            type: 'client_tool_result',
            tool_call_id: event.data.tool_call_id,
            result
          }, '*');
        }
      }
    };

    window.addEventListener('message', handleClientToolCall);
    return () => window.removeEventListener('message', handleClientToolCall);
  }, [conversationId, clientTools]);

  return (
    <div className="flex items-center space-x-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600">
          {isConnected ? 'AI Agent Ready' : 'Connecting...'}
        </span>
        {business && (
          <span className="text-xs text-gray-500">({business.name})</span>
        )}
      </div>

      {/* Voice Agent Button */}
      <button
        onClick={toggleListening}
        className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-105'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {/* Pulse Animation for Listening State */}
        {isListening && (
          <div className="absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-25"></div>
        )}
        
        <div className="relative flex items-center space-x-2">
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Voice Assistant</span>
            </>
          )}
        </div>
      </button>

      {/* Quick Actions */}
      <div className="hidden md:flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg transition-colors ${
            isMuted 
              ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="AI Suggestions - Get intelligent recommendations for your business"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Audio element for notification sounds */}
      <audio
        ref={audioRef}
        preload="auto"
        className="hidden"
      >
        {/* Using a data URL for a simple notification beep */}
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>
    </div>
  );
};

export default VoiceAgentWidget;