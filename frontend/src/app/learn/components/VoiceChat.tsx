"use client";

import { useVoiceChat } from "@/hooks/useVoiceChat";
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

export default function VoiceChat() {
  const { isConnected, isListening, transcript, connect, disconnect, toggleListening } = useVoiceChat();

  return (
    <div className="rounded-lg border border-white/5 bg-dark-100/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">Voice Tutor</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Transcript area */}
      <div className="bg-dark-50 rounded-lg p-3 min-h-[80px] mb-3 text-sm text-white/60">
        {transcript || <span className="text-white/20 italic">Voice transcript will appear here...</span>}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={isConnected ? disconnect : connect}
          className={`p-3 rounded-full transition-colors ${
            isConnected
              ? 'bg-accent/10 text-accent hover:bg-accent/20'
              : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
          }`}
        >
          {isConnected ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleListening}
          disabled={!isConnected}
          className={`p-3 rounded-full transition-colors disabled:opacity-30 ${
            isListening
              ? 'bg-accent/10 text-accent hover:bg-accent/20 animate-pulse'
              : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
