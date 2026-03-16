"use client";

import Link from 'next/link'
import { BookOpen, CheckCircle, Lock } from 'lucide-react'
import Nav from '@/components/Nav'

const SUBJECT_MAP: Record<string, { name: string; chapters: { id: string; title: string; status: 'completed' | 'current' | 'locked' }[] }> = {
  mathematics: {
    name: 'Mathematics',
    chapters: [
      { id: '1', title: 'Number Systems & Real Numbers', status: 'completed' },
      { id: '2', title: 'Algebra — Linear Equations', status: 'completed' },
      { id: '3', title: 'Quadratic Equations', status: 'current' },
      { id: '4', title: 'Coordinate Geometry', status: 'locked' },
      { id: '5', title: 'Trigonometry', status: 'locked' },
      { id: '6', title: 'Statistics & Probability', status: 'locked' },
    ],
  },
  physics: {
    name: 'Physics',
    chapters: [
      { id: '1', title: 'Units & Measurements', status: 'completed' },
      { id: '2', title: 'Motion in a Straight Line', status: 'completed' },
      { id: '3', title: "Newton's Laws of Motion", status: 'current' },
      { id: '4', title: 'Work, Energy & Power', status: 'locked' },
      { id: '5', title: 'Thermodynamics', status: 'locked' },
    ],
  },
  chemistry: {
    name: 'Chemistry',
    chapters: [
      { id: '1', title: 'Structure of Atom', status: 'completed' },
      { id: '2', title: 'Periodic Table & Properties', status: 'current' },
      { id: '3', title: 'Chemical Bonding', status: 'locked' },
      { id: '4', title: 'States of Matter', status: 'locked' },
    ],
  },
}

export default function SubjectPage({ params }: { params: { subjectId: string } }) {
  const subject = SUBJECT_MAP[params.subjectId] || { name: params.subjectId, chapters: [] }
  const completedCount = subject.chapters.filter(c => c.status === 'completed').length

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-dark p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/courses" className="text-sm text-accent hover:text-accent-hover mb-4 inline-block">&larr; All Courses</Link>
          <h1 className="text-2xl font-bold text-white mb-1">{subject.name}</h1>
          <p className="text-white/40 text-sm mb-8">{completedCount} of {subject.chapters.length} chapters completed</p>

          <div className="space-y-3">
            {subject.chapters.map((ch) => {
              const isAccessible = ch.status !== 'locked'
              const Wrapper = isAccessible ? Link : 'div' as any
              return (
                <Wrapper
                  key={ch.id}
                  href={isAccessible ? `/learn/${params.subjectId}/${ch.id}` : undefined}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    ch.status === 'current'
                      ? 'bg-accent/10 border-accent/20 hover:bg-accent/15'
                      : ch.status === 'completed'
                      ? 'bg-dark-100 border-white/5 hover:bg-dark-50'
                      : 'bg-dark-100/50 border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ch.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    ch.status === 'current' ? 'bg-accent text-white' :
                    'bg-white/5 text-white/20'
                  }`}>
                    {ch.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                     ch.status === 'locked' ? <Lock className="w-4 h-4" /> :
                     <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{ch.title}</p>
                    <p className="text-xs text-white/30 capitalize">{ch.status}</p>
                  </div>
                </Wrapper>
              )
            })}
          </div>
        </div>
      </main>
    </>
  );
}
