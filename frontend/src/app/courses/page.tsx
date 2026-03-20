'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, BookOpen, SlidersHorizontal } from 'lucide-react'
import { apiGet } from '@/lib/api'

interface Chapter {
  id: string
  status: string
}

interface Subject {
  subject_id: string
  subject_name: string
  chapters: Chapter[]
}

export default function CoursesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    apiGet<Subject[]>('/api/curriculum/')
      .then((data) => setSubjects(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setError(`Failed to load courses: ${msg}`)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return subjects
    return subjects.filter((s) =>
      s.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [subjects, searchQuery])

  return (
    <div className="app-shell space-y-6">
      <section className="surface-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="display-title text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">My Courses</h1>
            <p className="mt-1 text-sm text-slate-500">Your personalized AI-generated curriculum.</p>
          </div>

          <div className="flex w-full gap-3 lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none ring-0 transition-all focus:border-slate-300 focus:shadow-sm"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <section className="surface-card p-10 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
            <p className="text-sm">Loading your courses…</p>
          </div>
        </section>
      )}

      {error && (
        <section className="surface-card p-6">
          <p className="text-sm text-red-500">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSubjects.map((subject) => {
            const completedCount = subject.chapters.filter(c => c.status === 'completed').length
            const totalChapters = subject.chapters.length
            const progress = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0

            return (
              <Link
                key={subject.subject_id}
                href={`/learn/${subject.subject_id}`}
                className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="flex items-center justify-center h-40 bg-gradient-to-br from-brand-700/10 to-brand-700/20">
                  <BookOpen className="h-12 w-12 text-brand-700/60" />
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{subject.subject_name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{totalChapters} chapters</p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-700" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-600">{progress}% completed</p>
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {!loading && !error && filteredSubjects.length === 0 && (
        <section className="surface-card p-10 text-center">
          <p className="text-sm text-slate-500">
            {subjects.length === 0
              ? 'No courses yet. Complete onboarding to generate your curriculum.'
              : 'No courses match your search.'}
          </p>
          {subjects.length === 0 && (
            <Link href="/onboarding" className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm text-white hover:bg-brand-600">
              Go to Onboarding
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
