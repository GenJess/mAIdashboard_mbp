import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Zap } from 'lucide-react';

const VoiceAgentWidget: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600">
          {isConnected ? 'AI Agent Ready' : 'Connecting...'}
        </span>
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
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Voice Settings"
        >
          <Volume2 className="w-4 h-4" />
        </button>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="AI Suggestions"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Agent Embed Placeholder */}
      <div className="hidden">
        {/* This is where the actual Eleven Labs widget would be embedded */}
        <div dangerouslySetInnerHTML={{
          __html: '<elevenlabs-convai agent-id="agent_01jxn3j620ey1a72c9pmr0nbg6"></elevenlabs-convai>'
        }} />
      </div>
    </div>
  );
};

export default VoiceAgentWidget;