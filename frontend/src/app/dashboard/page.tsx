"use client";

import React from "react";
import Link from "next/link";
import { Play, Clock, Flame, TrendingUp, BookOpen, ChevronRight, Star, Video } from "lucide-react";

const continueWatching = [
  { id: 'mathematics', name: "Mathematics", chapter: "Quadratic Equations", progress: 72, image: "from-red-600 to-orange-500", time: "2h left", coverImg: "/subjects/math.jpg" },
  { id: 'physics', name: "Physics", chapter: "Newton's Laws", progress: 45, image: "from-blue-600 to-cyan-400", time: "4h left", coverImg: "/subjects/physics.jpg" },
  { id: 'chemistry', name: "Chemistry", chapter: "Periodic Table", progress: 60, image: "from-green-500 to-emerald-400", time: "3h left", coverImg: "/subjects/chemistry.jpg" },
  { id: 'english', name: "English", chapter: "Shakespeare's Sonnets", progress: 85, image: "from-pink-500 to-rose-400", time: "1h left", coverImg: "/subjects/english.jpg" },
  { id: 'hindi', name: "Hindi", chapter: "Premchand Literature", progress: 68, image: "from-amber-500 to-yellow-400", time: "2.5h left", coverImg: "/subjects/hindi.jpg" },
];

const trending = [
  { id: 'physics', name: "Physics — Mechanics", rating: 4.9, students: "3.1K", image: "from-violet-600 to-blue-500", coverImg: "/subjects/physics.jpg" },
  { id: 'mathematics', name: "Mathematics — Calculus", rating: 4.8, students: "4.2K", image: "from-red-600 to-pink-500", coverImg: "/subjects/math.jpg" },
  { id: 'chemistry', name: "Chemistry — Organic", rating: 4.7, students: "2.8K", image: "from-emerald-500 to-teal-400", coverImg: "/subjects/chemistry.jpg" },
  { id: 'biology', name: "Biology — Genetics", rating: 4.8, students: "3.5K", image: "from-orange-500 to-amber-400", coverImg: "/subjects/biology.jpg" },
  { id: 'cs', name: "CS — Programming", rating: 4.9, students: "6.2K", image: "from-indigo-500 to-purple-500", coverImg: "/subjects/cs.jpg" },
  { id: 'history', name: "History — Civilizations", rating: 4.6, students: "2.4K", image: "from-yellow-600 to-orange-400", coverImg: "/subjects/history.jpg" },
];

const newSubjects = [
  { name: "Environmental Science", desc: "Ecology & Conservation", image: "from-green-600 to-lime-400", coverImg: "/subjects/environmental.jpg" },
  { name: "Art & Design", desc: "Visual Arts Foundations", image: "from-fuchsia-500 to-purple-400", coverImg: "/subjects/art.jpg" },
  { name: "Economics", desc: "Micro & Macro", image: "from-cyan-500 to-blue-400", coverImg: "/subjects/economics.jpg" },
  { name: "Geography", desc: "Physical & Human", image: "from-teal-500 to-green-400", coverImg: "/subjects/geography.jpg" },
  { name: "Civics & Government", desc: "Democracy & Rights", image: "from-slate-500 to-zinc-400", coverImg: "/subjects/civics.jpg" },
];

const recommendedVideos = [
  { id: 'v1', title: "Understanding Quadratic Equations", subject: "Mathematics", duration: "32:15", views: "12.4K", coverImg: "/subjects/math.jpg" },
  { id: 'v2', title: "Newton's Laws — Visual Experiments", subject: "Physics", duration: "45:00", views: "18.2K", coverImg: "/subjects/physics.jpg" },
  { id: 'v3', title: "Organic Chemistry — Bonding Explained", subject: "Chemistry", duration: "28:40", views: "9.7K", coverImg: "/subjects/chemistry.jpg" },
  { id: 'v4', title: "DNA Replication & Protein Synthesis", subject: "Biology", duration: "38:20", views: "14.1K", coverImg: "/subjects/biology.jpg" },
  { id: 'v5', title: "Python Basics — Variables & Loops", subject: "Computer Science", duration: "52:10", views: "22.5K", coverImg: "/subjects/cs.jpg" },
  { id: 'v6', title: "Ancient Rome — Rise & Fall", subject: "History", duration: "41:30", views: "8.3K", coverImg: "/subjects/history.jpg" },
  { id: 'v7', title: "Macroeconomics — Supply & Demand", subject: "Economics", duration: "35:45", views: "6.8K", coverImg: "/subjects/economics.jpg" },
  { id: 'v8', title: "Shakespeare's Hamlet — Deep Dive", subject: "English", duration: "47:20", views: "11.6K", coverImg: "/subjects/english.jpg" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Banner */}
      <div className="relative h-[420px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-dark-100 to-neon-purple/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-end h-full px-10 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-accent text-white text-[11px] font-bold rounded uppercase tracking-wider">Continue</span>
            <span className="text-white/50 text-sm">•</span>
            <span className="text-white/50 text-sm flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" /> 12 day streak</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight leading-tight max-w-2xl">
            Physics — Newton&apos;s<br/>Laws of Motion
          </h1>
          <p className="text-white/60 text-base max-w-xl mb-6 leading-relaxed">
            Continue where you left off. Master the fundamental laws governing motion and force in the physical universe.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/learn/physics/3" className="flex items-center gap-2 px-7 py-3 bg-white text-black rounded-md font-bold text-sm hover:bg-white/90 transition-colors">
              <Play className="w-5 h-5 fill-current" /> Resume
            </Link>
            <Link href="/chatbot" className="flex items-center gap-2 px-7 py-3 bg-white/20 text-white rounded-md font-semibold text-sm hover:bg-white/30 transition-colors backdrop-blur-sm">
              Ask AI Tutor
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-10 -mt-2 mb-8">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Subjects Active", val: "12", icon: BookOpen, color: "text-accent" },
            { label: "Hours This Week", val: "24.5", icon: Clock, color: "text-neon-blue" },
            { label: "Day Streak", val: "12", icon: Flame, color: "text-neon-orange" },
            { label: "Avg. Score", val: "92%", icon: TrendingUp, color: "text-neon-green" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl px-5 py-4 flex items-center gap-4">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-xl font-bold text-white">{s.val}</p>
                <p className="text-[12px] text-white/40">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Watching Row — Netflix style */}
      <section className="px-10 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Continue Learning</h2>
          <Link href="/courses" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="scroll-row">
          {continueWatching.map((item) => (
            <Link key={item.id} href={`/learn/${item.id}`} className="w-[280px] group">
              <div className="card-hover rounded-lg overflow-hidden bg-dark-100 border border-white/5">
                <div className="h-[140px] relative overflow-hidden">
                  <img src={item.coverImg} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-5 h-5 text-dark fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Progress bar at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-accent" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.chapter} • {item.time}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now Row */}
      <section className="px-10 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> Trending Now
          </h2>
          <Link href="/courses" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="scroll-row">
          {trending.map((item, i) => (
            <Link key={item.id} href={`/learn/${item.id}`} className="w-[200px] group">
              <div className="card-hover rounded-lg overflow-hidden bg-dark-100 border border-white/5">
                <div className="h-[120px] relative overflow-hidden">
                  <img src={item.coverImg} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {/* Rank badge */}
                  <div className="absolute bottom-2 left-2 text-[28px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-none">
                    #{i + 1}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-4 h-4 text-dark fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-white truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[11px] text-white/50">{item.rating} • {item.students} students</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Videos Row */}
      <section className="px-10 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-neon-purple" /> Recommended Videos
          </h2>
          <Link href="/video" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="scroll-row">
          {recommendedVideos.map((vid) => (
            <Link key={vid.id} href="/video" className="w-[260px] group">
              <div className="card-hover rounded-lg overflow-hidden bg-dark-100 border border-white/5">
                <div className="h-[146px] relative overflow-hidden">
                  <img src={vid.coverImg} alt={vid.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {vid.duration}
                  </span>
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-5 h-5 text-dark fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-white leading-tight line-clamp-2 mb-1">{vid.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-white/40">
                    <span>{vid.subject}</span>
                    <span>•</span>
                    <span>{vid.views} views</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New to AI Powered Personalized Learning OS Row */}
      <section className="px-10 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">New to Explore</h2>
        </div>
        <div className="scroll-row">
          {newSubjects.map((item) => (
            <Link key={item.name} href="/courses" className="w-[240px] group">
              <div className="card-hover rounded-lg overflow-hidden bg-dark-100 border border-white/5">
                <div className="h-[100px] relative overflow-hidden">
                  <img src={item.coverImg} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-4 h-4 text-dark fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-white">{item.name}</p>
                  <p className="text-[11px] text-white/40">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}