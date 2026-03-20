"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle, Lock, Sparkles } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'

interface Chapter {
  id: string
  order_index: number
  title: string
  description: string
  status: string
}

interface CurriculumResponse {
  subject_id: string
  subject_name: string
  chapters: Chapter[]
}

export default function SubjectPage({ params }: { params: { subjectId: string } }) {
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const fetchCurriculum = () => {
    setLoading(true)
    setError('')
    apiGet<CurriculumResponse>(`/api/curriculum/${params.subjectId}`)
      .then((data) => setCurriculum(data))
      .catch(() => setError('Failed to load subject. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCurriculum() }, [params.subjectId])

  const generateCurriculum = async () => {
    if (!curriculum) return
    setGenerating(true)
    setError('')
    try {
      await apiPost('/api/curriculum/generate', { subject_name: curriculum.subject_name })
      fetchCurriculum()
    } catch {
      setError('Failed to generate curriculum. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-dark px-6 md:px-10 pt-20 pb-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 text-white/50 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm">Loading subject…</p>
        </div>
      </main>
    )
  }

  if (error || !curriculum) {
    return (
      <main className="min-h-screen bg-dark px-6 md:px-10 pt-20 pb-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/courses" className="text-sm text-accent hover:text-accent-hover mb-4 inline-block">&larr; All Courses</Link>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error || 'Subject not found.'}
          </div>
        </div>
      </main>
    )
  }

  const completedCount = curriculum.chapters.filter(c => c.status === 'completed').length

  return (
    <main className="min-h-screen bg-dark px-6 md:px-10 pt-20 pb-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/courses" className="text-sm text-accent hover:text-accent-hover mb-4 inline-block">&larr; All Courses</Link>
        <h1 className="text-2xl font-bold text-white mb-1">{curriculum.subject_name}</h1>
        <p className="text-white/40 text-sm mb-8">{completedCount} of {curriculum.chapters.length} chapters completed</p>

        {curriculum.chapters.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/40 text-sm mb-4">No chapters yet. Generate your AI curriculum to get started.</p>
            <button
              onClick={generateCurriculum}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Generating…' : 'Generate Curriculum'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {curriculum.chapters.map((ch) => {
            const isAccessible = ch.status !== 'locked'
            const Wrapper = isAccessible ? Link : 'div' as any
            return (
              <Wrapper
                key={ch.id}
                href={isAccessible ? `/learn/${params.subjectId}/${ch.id}` : undefined}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  ch.status === 'in_progress' || ch.status === 'available'
                    ? 'bg-accent/10 border-accent/20 hover:bg-accent/15'
                    : ch.status === 'completed'
                    ? 'bg-dark-100 border-white/5 hover:bg-dark-50'
                    : 'bg-dark-100/50 border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ch.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  ch.status === 'in_progress' || ch.status === 'available' ? 'bg-accent text-white' :
                  'bg-white/5 text-white/20'
                }`}>
                  {ch.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                   ch.status === 'locked' ? <Lock className="w-4 h-4" /> :
                   <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-white">{ch.title}</p>
                  <p className="text-xs text-white/30 capitalize">{ch.status.replace('_', ' ')}</p>
                </div>
              </Wrapper>
            )
          })}
        </div>
      </div>
    </main>
  )
}
