'use client'

import { useState } from 'react'
import { Play, Pause, Volume2, Maximize, Settings, FileText, BookmarkPlus, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function VideoLearningPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes'>('transcript')

  return (
    <div className="min-h-screen bg-dark p-6 px-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-3rem)]">
        {/* Main Video Section */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div>
            <h1 className="text-xl font-bold text-white">Understanding Newton&apos;s Laws of Motion</h1>
            <p className="text-white/40 text-sm">Chapter 3: Physics — Mechanics & Thermodynamics</p>
          </div>

          {/* Video Player */}
          <div className="bg-black rounded-xl aspect-video relative group overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 flex items-center justify-center bg-dark-100">
              <span className="text-white/20 font-medium text-sm">Video Player</span>
            </div>

            {/* Video Controls overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-full bg-white/20 h-1 rounded-full mb-4 cursor-pointer">
                <div className="bg-accent h-1 rounded-full w-1/3 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-accent transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <div className="w-16 bg-white/20 h-1 rounded-full">
                      <div className="bg-white w-2/3 h-1 rounded-full" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-white/60">12:34 / 45:00</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="hover:text-accent transition-colors"><Settings className="w-4 h-4" /></button>
                  <button className="hover:text-accent transition-colors"><Maximize className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Link href="/chatbot">
              <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors">
                <MessageSquare className="w-4 h-4" /> Ask AI Tutor
              </button>
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/50 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors border border-white/5">
              <BookmarkPlus className="w-4 h-4" /> Save
            </button>
          </div>
          
          {/* AI Tutor CTA */}
          <div className="rounded-xl bg-gradient-to-r from-accent/10 to-neon-purple/10 border border-white/5 p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Need help understanding this concept?</h3>
              <p className="text-xs text-white/40">Your AI tutor is ready to answer questions</p>
            </div>
            <Link href="/chatbot">
              <button className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shrink-0">
                Ask AI Tutor
              </button>
            </Link>
          </div>
        </div>

        {/* Side Panel */}
        <div className="glass rounded-xl flex flex-col h-full overflow-hidden">
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'transcript' ? 'border-accent text-accent' : 'border-transparent text-white/30 hover:text-white/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Transcript
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'notes' ? 'border-accent text-accent' : 'border-transparent text-white/30 hover:text-white/50'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> My Notes
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'transcript' ? (
              <div className="space-y-2">
                {[
                  { time: '12:30', text: "Now let's look at how force relates to acceleration.", active: false },
                  { time: '12:34', text: "Newton's second law states F = ma, force equals mass times acceleration.", active: true },
                  { time: '12:45', text: "This is fundamental to understanding how objects move in our physical world.", active: false },
                  { time: '13:10', text: "Let's work through a practical example using a car on a frictionless surface.", active: false },
                ].map((item, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    item.active ? 'bg-accent/10 border border-accent/20' : 'hover:bg-white/5'
                  }`}>
                    <span className={`text-xs font-mono shrink-0 mt-0.5 ${item.active ? 'text-accent' : 'text-white/20'}`}>{item.time}</span>
                    <p className={`text-xs leading-relaxed ${item.active ? 'text-white' : 'text-white/40'}`}>{item.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 h-full flex flex-col">
                <textarea 
                  placeholder="Type your notes here..."
                  className="w-full flex-1 p-3 bg-dark-50 border border-white/5 rounded-lg resize-none text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
                  Save Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
