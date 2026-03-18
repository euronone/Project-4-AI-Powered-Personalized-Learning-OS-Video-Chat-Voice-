'use client'

import { useState } from 'react'
import {
  BookmarkPlus,
  Clock3,
  Eye,
  FileText,
  Maximize,
  MessageSquare,
  Pause,
  Play,
  Settings,
  Volume2,
} from 'lucide-react'
import Link from 'next/link'
import SubjectVisual from '@/components/common/SubjectVisual'

const upNextVideos = [
  { id: 'v1', title: "Newton's Third Law — Action & Reaction", subject: 'Physics', duration: '28:15', views: '14.2K', slug: 'physics' },
  { id: 'v2', title: 'Solving Quadratic Equations Step by Step', subject: 'Mathematics', duration: '35:40', views: '18.7K', slug: 'mathematics' },
  { id: 'v3', title: 'Chemical Bonding — Ionic vs Covalent', subject: 'Chemistry', duration: '24:30', views: '11.3K', slug: 'chemistry' },
  { id: 'v4', title: 'Cell Division — Mitosis & Meiosis', subject: 'Biology', duration: '42:10', views: '16.5K', slug: 'biology' },
]

export default function VideoLearningPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'recommendations'>('recommendations')

  return (
    <div className="app-shell">
      <div className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
        <section className="space-y-4">
          <div className="surface-card p-5">
            <h1 className="text-xl font-bold text-white md:text-2xl">Understanding Newton's Laws of Motion</h1>
            <p className="mt-1 text-sm text-slate-500">Chapter 3 • Physics — Mechanics and Thermodynamics</p>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="relative aspect-video bg-slate-900">
              <SubjectVisual subject="physics" className="h-full w-full" />

              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="mb-3 h-1.5 w-full rounded-full bg-white/25">
                  <div className="h-1.5 w-1/3 rounded-full bg-white" />
                </div>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="rounded-lg bg-white/20 p-2 hover:bg-white/30">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Volume2 className="h-4 w-4" />
                      <div className="h-1 w-16 rounded-full bg-white/30">
                        <div className="h-1 w-2/3 rounded-full bg-white" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-white/85">12:34 / 45:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-white/20 p-2 hover:bg-white/30"><Settings className="h-4 w-4" /></button>
                    <button className="rounded-lg bg-white/20 p-2 hover:bg-white/30"><Maximize className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/chatbot" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                <MessageSquare className="h-4 w-4" />
                Ask AI Tutor
              </Link>
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]">
                <BookmarkPlus className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </section>

        <aside className="surface-card h-fit overflow-hidden">
          <div className="grid grid-cols-3 border-b border-white/[0.06] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={activeTab === 'recommendations' ? 'border-b-2 border-blue-500 px-2 py-3 text-blue-400' : 'px-2 py-3 text-slate-500 hover:text-slate-300'}
            >
              Up Next
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={activeTab === 'transcript' ? 'border-b-2 border-blue-500 px-2 py-3 text-blue-400' : 'px-2 py-3 text-slate-500 hover:text-slate-300'}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={activeTab === 'notes' ? 'border-b-2 border-blue-500 px-2 py-3 text-blue-400' : 'px-2 py-3 text-slate-500 hover:text-slate-300'}
            >
              Notes
            </button>
          </div>

          <div className="max-h-[560px] overflow-y-auto p-3">
            {activeTab === 'recommendations' ? (
              <div className="space-y-2">
                {upNextVideos.map((vid) => (
                  <Link key={vid.id} href="/video" className="card-hover flex gap-3 rounded-xl border border-white/[0.06] bg-[#131b30] p-2">
                    <div className="relative h-[72px] w-[126px] overflow-hidden rounded-lg">
                      <SubjectVisual subject={vid.slug} className="h-full w-full" />
                      <span className="absolute bottom-1 right-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold text-white">{vid.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{vid.subject}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{vid.views}</span>
                        <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{vid.duration}</span>
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
                  { time: '12:45', text: 'This relation explains how motion changes under applied force.', active: false },
                ].map((item, i) => (
                  <div key={i} className={item.active ? 'rounded-xl border border-blue-500/20 bg-blue-500/10 p-3' : 'rounded-xl border border-white/[0.06] bg-[#131b30] p-3'}>
                    <p className={item.active ? 'text-[11px] font-semibold text-blue-400' : 'text-[11px] font-semibold text-slate-500'}>{item.time}</p>
                    <p className={item.active ? 'mt-1 text-xs text-slate-200' : 'mt-1 text-xs text-slate-400'}>{item.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-xl border border-white/[0.06] bg-[#131b30] p-2">
                  <textarea
                    placeholder="Write your notes from this lesson..."
                    className="min-h-[220px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />
                </div>
                <button className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
