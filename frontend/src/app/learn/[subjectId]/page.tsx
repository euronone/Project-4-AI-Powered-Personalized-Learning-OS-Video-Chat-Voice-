"use client";

import Link from 'next/link'
import { BookOpen, CheckCircle, Lock } from 'lucide-react'

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
  biology: {
    name: 'Biology',
    chapters: [
      { id: '1', title: 'Cell Structure & Function', status: 'completed' },
      { id: '2', title: 'Genetics & Heredity', status: 'current' },
      { id: '3', title: 'Human Physiology', status: 'locked' },
      { id: '4', title: 'Ecology & Environment', status: 'locked' },
    ],
  },
  english: {
    name: 'English',
    chapters: [
      { id: '1', title: 'Grammar Fundamentals', status: 'completed' },
      { id: '2', title: 'Reading Comprehension', status: 'completed' },
      { id: '3', title: 'Creative Writing', status: 'completed' },
      { id: '4', title: 'Literature Analysis', status: 'current' },
      { id: '5', title: 'Essay & Composition', status: 'locked' },
    ],
  },
  cs: {
    name: 'Computer Science',
    chapters: [
      { id: '1', title: 'Introduction to Programming', status: 'completed' },
      { id: '2', title: 'Data Types & Variables', status: 'current' },
      { id: '3', title: 'Control Flow & Loops', status: 'locked' },
      { id: '4', title: 'Functions & Modules', status: 'locked' },
      { id: '5', title: 'Data Structures Basics', status: 'locked' },
    ],
  },
  history: {
    name: 'History',
    chapters: [
      { id: '1', title: 'Ancient Civilizations', status: 'completed' },
      { id: '2', title: 'Medieval Period', status: 'completed' },
      { id: '3', title: 'Modern World History', status: 'current' },
      { id: '4', title: 'Indian Independence Movement', status: 'locked' },
    ],
  },
  geography: {
    name: 'Geography',
    chapters: [
      { id: '1', title: 'Physical Geography', status: 'completed' },
      { id: '2', title: 'Climate & Weather', status: 'current' },
      { id: '3', title: 'Human Geography', status: 'locked' },
      { id: '4', title: 'Map Skills & GIS', status: 'locked' },
    ],
  },
  economics: {
    name: 'Economics',
    chapters: [
      { id: '1', title: 'Introduction to Economics', status: 'completed' },
      { id: '2', title: 'Supply & Demand', status: 'current' },
      { id: '3', title: 'Money & Banking', status: 'locked' },
      { id: '4', title: 'Indian Economy', status: 'locked' },
    ],
  },
  hindi: {
    name: 'Hindi',
    chapters: [
      { id: '1', title: 'व्याकरण — Grammar Basics', status: 'completed' },
      { id: '2', title: 'गद्य — Prose Literature', status: 'completed' },
      { id: '3', title: 'पद्य — Poetry', status: 'current' },
      { id: '4', title: 'निबंध — Essay Writing', status: 'locked' },
    ],
  },
  environmental: {
    name: 'Environmental Science',
    chapters: [
      { id: '1', title: 'Ecosystems & Biodiversity', status: 'completed' },
      { id: '2', title: 'Pollution & Conservation', status: 'current' },
      { id: '3', title: 'Sustainable Development', status: 'locked' },
    ],
  },
  art: {
    name: 'Art & Design',
    chapters: [
      { id: '1', title: 'Elements of Art', status: 'completed' },
      { id: '2', title: 'Color Theory & Composition', status: 'current' },
      { id: '3', title: 'Drawing Techniques', status: 'locked' },
    ],
  },
  pe: {
    name: 'Physical Education',
    chapters: [
      { id: '1', title: 'Health & Nutrition', status: 'current' },
      { id: '2', title: 'Sports & Fitness', status: 'locked' },
      { id: '3', title: 'Yoga & Wellness', status: 'locked' },
    ],
  },
  civics: {
    name: 'Civics & Government',
    chapters: [
      { id: '1', title: 'Indian Constitution', status: 'current' },
      { id: '2', title: 'Democracy & Governance', status: 'locked' },
      { id: '3', title: 'Rights & Duties', status: 'locked' },
    ],
  },
}

export default function SubjectPage({ params }: { params: { subjectId: string } }) {
  const subject = SUBJECT_MAP[params.subjectId] || { name: params.subjectId, chapters: [] }
  const completedCount = subject.chapters.filter(c => c.status === 'completed').length

  return (
      <main className="min-h-screen bg-dark px-6 md:px-10 pt-20 pb-6">
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
  );
}
