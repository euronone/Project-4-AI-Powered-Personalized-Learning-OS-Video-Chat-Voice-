"use client";

import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Video, VideoOff } from 'lucide-react'
import SentimentIndicator from '@/components/SentimentIndicator'
import { useSentiment } from '@/hooks/useSentiment'

export default function VideoFeed() {
  const { isActive, videoRef, startCamera, stopCamera } = useVideoFeed();
  const { currentSentiment } = useSentiment();

  return (
    <div className="rounded-lg border border-white/5 bg-dark-100/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">Video Feed</h3>
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={`p-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-accent/10 text-accent hover:bg-accent/20'
              : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          {isActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-dark-50 aspect-video">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/20 text-sm">Camera off</p>
          </div>
        )}
        {isActive && currentSentiment && (
          <div className="absolute bottom-2 left-2">
            <SentimentIndicator emotion={currentSentiment.emotion} confidence={currentSentiment.confidence} />
          </div>
        )}
      </div>
    </div>
  );
}
