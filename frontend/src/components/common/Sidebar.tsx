'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  MessageSquare, 
  BarChart3, 
  User,
  GraduationCap,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Videos', href: '/video', icon: Video },
  { name: 'AI Tutor', href: '/chatbot', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const main = document.querySelector('main')
      if (main) setScrolled(main.scrollTop > 20)
    }
    const main = document.querySelector('main')
    main?.addEventListener('scroll', handleScroll)
    return () => main?.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-dark/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20" 
          : "bg-gradient-to-b from-dark/80 to-transparent"
      )}>
        <div className="flex items-center justify-between px-6 lg:px-10 h-16">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-neon-purple flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight hidden sm:block">AI Learning OS</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200",
                      isActive 
                        ? "text-white" 
                        : "text-white/50 hover:text-white/80"
                    )}
                  >
                    {item.name}
                    {isActive && <div className="h-[2px] bg-accent rounded-full mt-0.5" />}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right: Search, notifications, profile */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <Search className="w-4.5 h-4.5" />
            </button>
            <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
            <Link href="/profile" className="flex items-center gap-2.5 ml-1 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-neon-purple flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-accent/30 transition-all">
                A
              </div>
            </Link>
            {/* Mobile menu toggle */}
            <button 
              className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="lg:hidden bg-dark/98 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-white/40")} />
                  {item.name}
                </Link>
              )
            })}
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <User className="w-4 h-4 text-white/40" />
              Profile
            </Link>
          </div>
        )}
      </nav>
    </>
  )
}
