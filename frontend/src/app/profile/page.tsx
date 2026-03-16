'use client'

import { useState } from 'react'
import { User, Mail, Book, Trophy, Settings, Camera, MapPin, Globe } from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-screen bg-dark p-8 px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Profile</h1>
          <p className="text-white/40 mt-1 text-sm">Manage your information and preferences</p>
        </div>

        {/* Header Profile */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-accent/40 via-neon-purple/30 to-dark-100" />
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-10 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-dark-100 rounded-full p-0.5 border-2 border-accent/50">
                  <div className="w-full h-full bg-dark-50 rounded-full flex items-center justify-center text-white/30">
                    <User className="w-10 h-10" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-dark-100 rounded-full border border-white/10 text-white/50 hover:text-accent transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isEditing ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Alex Johnson</h2>
              <p className="text-white/40 text-sm">Grade 10 Student</p>
              <div className="flex items-center gap-4 text-xs text-white/25 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> San Francisco, CA</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> English, Spanish</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-7">
              <h3 className="text-sm font-semibold text-white/70 mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/30">Full Name</label>
                  <input type="text" defaultValue="Alex Johnson" disabled={!isEditing}
                    className="w-full px-4 py-2.5 bg-dark-50 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:text-white/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/30">Email Address</label>
                  <input type="email" defaultValue="alex.j@example.com" disabled={!isEditing}
                    className="w-full px-4 py-2.5 bg-dark-50 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:text-white/30"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-white/30">Bio</label>
                  <textarea defaultValue="Passionate about science and mathematics. Always curious to explore new concepts and apply them to real-world problems." disabled={!isEditing} rows={3}
                    className="w-full px-4 py-2.5 bg-dark-50 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:text-white/30 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-7">
              <h3 className="text-sm font-semibold text-white/70 mb-5 flex items-center gap-2">
                <Settings className="w-4 h-4 text-neon-purple" />
                Learning Preferences
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-white/30 block mb-2">Primary Learning Goal</label>
                  <select disabled={!isEditing}
                    className="w-full px-4 py-2.5 bg-dark-50 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:text-white/30"
                  >
                    <option>Career Transition</option>
                    <option>Skill Enhancement</option>
                    <option>Academic Support</option>
                    <option>Personal Interest</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/30 block mb-2">Preferred Study Time</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                      <label key={time} className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer transition-colors text-sm ${time === 'Evening' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-white/5 bg-dark-50 text-white/40 hover:bg-white/5'}`}>
                        <input type="radio" name="studyTime" value={time} className="hidden" disabled={!isEditing} defaultChecked={time === 'Evening'} />
                        <span className="font-medium text-xs">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Achievements
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Fast Learner', desc: 'Completed 5 courses in a month', icon: '🚀' },
                  { title: 'Perfect Score', desc: '100% in Algebra Quiz', icon: '⭐' },
                  { title: '7 Day Streak', desc: 'Studied for 7 consecutive days', icon: '🔥' }
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-lg">{a.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{a.title}</p>
                      <p className="text-[11px] text-white/30">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Book className="w-4 h-4 text-neon-green" />
                Current Enrolled
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Mathematics — Algebra & Calculus', progress: 72 },
                  { title: 'Physics — Mechanics & Thermo.', progress: 45 },
                  { title: 'English — Literature & Comp.', progress: 85 },
                  { title: 'Hindi — Literature & Grammar', progress: 68 },
                  { title: 'Chemistry — Organic & Inorganic', progress: 60 },
                  { title: 'History — World Civilizations', progress: 55 }
                ].map((course, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white/50 truncate pr-3">{course.title}</span>
                      <span className="text-white/30">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="bg-accent h-1 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
