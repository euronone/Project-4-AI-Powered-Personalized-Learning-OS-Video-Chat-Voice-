'use client'

import { LucideIcon } from 'lucide-react'

interface WelcomeBannerProps {
  studentName: string
  streak?: number
}

export default function WelcomeBanner({ studentName, streak = 0 }: WelcomeBannerProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
      <h1 className="text-2xl font-bold">{greeting}, {studentName}! 👋</h1>
      <p className="mt-1 text-indigo-100">
        {streak > 0
          ? `You're on a ${streak}-day learning streak! Keep it up!`
          : 'Ready to continue your learning journey?'}
      </p>
    </div>
  )
}
