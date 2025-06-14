import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Zap } from 'lucide-react';

const VoiceAgentWidget: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleListening = () => {
    setIsListening(!isListening);
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