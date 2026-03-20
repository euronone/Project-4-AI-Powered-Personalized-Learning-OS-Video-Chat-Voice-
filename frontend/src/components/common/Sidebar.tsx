'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Video,
  MessageSquare,
  BarChart3,
  User,
  GraduationCap,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Videos', href: '/video', icon: Video },
  { name: 'AI Tutor', href: '/chatbot', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/login'
  }

  // Don't render on auth pages or while loading
  if (pathname === '/login' || pathname === '/register') return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="leading-tight">
            <p className="display-title text-base font-semibold text-white">LearnOS</p>
            <p className="text-[11px] text-slate-500">AI personalized learning</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard')
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={handleLogout}
              className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 md:inline-flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          )}
          <Link
            href="/profile"
            className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 md:inline-flex"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#0a0a0f] px-4 py-3 lg:hidden">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard')
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/[0.06] hover:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            {user && (
              <button
                onClick={() => { setMobileOpen(false); handleLogout() }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
