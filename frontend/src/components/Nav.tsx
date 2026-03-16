"use client";

import Link from 'next/link'
import { Bell, Search } from 'lucide-react'

export default function Nav() {
  return (
    <nav className="border-b border-white/5 bg-dark-100/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="font-bold text-xl text-accent">
        LearnOS
      </Link>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search subjects..."
            className="pl-9 pr-4 py-1.5 text-sm bg-dark-50 border border-white/5 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 w-56"
          />
        </div>
        <button className="relative p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-neon-purple rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-white">A</span>
        </div>
      </div>
    </nav>
  );
}
