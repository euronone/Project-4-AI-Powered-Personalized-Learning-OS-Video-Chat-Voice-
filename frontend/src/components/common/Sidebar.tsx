'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  MessageSquare, 
  BarChart3, 
  User,
  GraduationCap,
  ChevronRight
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Courses', href: '/courses', icon: BookOpen },
  { name: 'Video Learning', href: '/video', icon: Video },
  { name: 'AI Tutor', href: '/chatbot', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[240px] bg-dark-100/60 backdrop-blur-xl border-r border-white/5 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-5 pb-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-neon-purple flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AI Learning OS</h1>
          </div>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-3">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
              )}
              <Icon className={cn("w-[18px] h-[18px] transition-colors", isActive ? "text-accent" : "text-white/40 group-hover:text-white/70")} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/30" />}
            </Link>
          )
        })}
      </nav>
      
      {/* User section */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-neon-purple flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">Alex Johnson</span>
            <span className="text-[11px] text-white/30">Grade 10 • Pro</span>
          </div>
        </div>
      </div>
    </div>
  )
}
