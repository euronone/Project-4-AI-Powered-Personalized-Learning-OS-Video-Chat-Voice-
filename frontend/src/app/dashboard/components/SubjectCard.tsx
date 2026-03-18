'use client'

import Link from 'next/link'

interface SubjectCardProps {
  name: string
  progress: number
  href?: string
}

const colorMap: Record<string, string> = {
  'Mathematics': 'from-indigo-500 to-purple-600',
  'Physics': 'from-blue-500 to-cyan-600',
  'Chemistry': 'from-green-400 to-emerald-600',
  'Biology': 'from-orange-400 to-red-500',
  'English': 'from-pink-500 to-rose-600',
  'Computer Science': 'from-yellow-400 to-amber-600',
  'History': 'from-amber-500 to-orange-600',
  'Geography': 'from-teal-400 to-cyan-600',
  'Economics': 'from-violet-500 to-purple-700',
  'Hindi': 'from-red-400 to-pink-600',
  'Environmental Science': 'from-lime-400 to-green-600',
  'Art & Design': 'from-fuchsia-400 to-purple-600',
}

export default function SubjectCard({ name, progress, href }: SubjectCardProps) {
  const gradient = colorMap[name] || 'from-gray-400 to-gray-600'

  const card = (
    <div className="bg-[#0f1629] rounded-xl shadow-sm border border-white/[0.06] overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <h3 className="text-base font-semibold text-white">{name}</h3>
        <div className="mt-3 w-full bg-white/[0.06] rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2">{progress}% complete</p>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }
  return card
}
