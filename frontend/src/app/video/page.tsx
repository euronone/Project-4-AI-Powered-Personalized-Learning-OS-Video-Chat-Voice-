'use client'

import { useState } from 'react'
import { Play, Pause, Volume2, Maximize, Settings, FileText, BookmarkPlus, MessageSquare, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

const upNextVideos = [
  { id: 'v1', title: "Newton's Third Law — Action & Reaction", subject: "Physics", duration: "28:15", views: "14.2K", coverImg: "/subjects/physics.jpg" },
  { id: 'v2', title: "Solving Quadratic Equations Step by Step", subject: "Mathematics", duration: "35:40", views: "18.7K", coverImg: "/subjects/math.jpg" },
  { id: 'v3', title: "Chemical Bonding — Ionic vs Covalent", subject: "Chemistry", duration: "24:30", views: "11.3K", coverImg: "/subjects/chemistry.jpg" },
  { id: 'v4', title: "Cell Division — Mitosis & Meiosis", subject: "Biology", duration: "42:10", views: "16.5K", coverImg: "/subjects/biology.jpg" },
  { id: 'v5', title: "Introduction to Python Programming", subject: "Computer Science", duration: "55:00", views: "25.1K", coverImg: "/subjects/cs.jpg" },
  { id: 'v6', title: "World War II — Key Turning Points", subject: "History", duration: "48:20", views: "9.8K", coverImg: "/subjects/history.jpg" },
  { id: 'v7', title: "Shakespeare's Sonnets — Literary Analysis", subject: "English", duration: "31:45", views: "7.4K", coverImg: "/subjects/english.jpg" },
  { id: 'v8', title: "Supply & Demand Fundamentals", subject: "Economics", duration: "26:50", views: "8.9K", coverImg: "/subjects/economics.jpg" },
]

export default function VideoLearningPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'recommendations'>('recommendations')

  return (
    <div className="min-h-screen bg-dark pt-20 px-6 lg:px-14 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-7rem)]">
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
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'recommendations' ? 'border-accent text-accent' : 'border-transparent text-white/30 hover:text-white/50'
              }`}
            >
              <Play className="w-3.5 h-3.5" /> Up Next
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'transcript' ? 'border-accent text-accent' : 'border-transparent text-white/30 hover:text-white/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Transcript
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'notes' ? 'border-accent text-accent' : 'border-transparent text-white/30 hover:text-white/50'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> Notes
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'recommendations' ? (
              <div className="space-y-3">
                {upNextVideos.map((vid, i) => (
                  <Link key={vid.id} href="/video" className="flex gap-3 group cursor-pointer rounded-lg hover:bg-white/5 p-1.5 transition-colors">
                    <div className="w-[120px] h-[68px] rounded-md overflow-hidden relative shrink-0">
                      <img src={vid.coverImg} alt={vid.title} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-semibold bg-black/70 text-white px-1 py-0.5 rounded">
                        {vid.duration}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-3 h-3 text-dark fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white leading-tight line-clamp-2 mb-1 group-hover:text-accent transition-colors">{vid.title}</p>
                      <p className="text-[10px] text-white/30">{vid.subject}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-white/20">
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{vid.views}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{vid.duration}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : activeTab === 'transcript' ? (
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
