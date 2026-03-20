"use client";

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import GradeSelect from './components/GradeSelect'
import SubjectPicker from './components/SubjectPicker'
import BackgroundForm from './components/BackgroundForm'
import MarksheetUpload from './components/MarksheetUpload'
import { useAuth } from '@/context/AuthContext'
import { apiPost, apiPostFormData } from '@/lib/api'

const STEPS = ['Grade', 'Subjects', 'Background', 'Marksheet']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [grade, setGrade] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [background, setBackground] = useState('')
  const [marksheetFile, setMarksheetFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const canAdvance =
    (step === 0 && grade !== '') ||
    (step === 1 && subjects.length > 0) ||
    (step === 2 && background.trim().length > 0) ||
    step === 3

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await apiPost('/api/onboarding', {
        name: user?.user_metadata?.name || user?.email || 'Student',
        grade,
        background: background || null,
        interests: subjects,
      })

      if (marksheetFile) {
        const formData = new FormData()
        formData.append('file', marksheetFile)
        await apiPostFormData('/api/onboarding/marksheet', formData)
      }

      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-8 sm:pt-24 sm:pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="surface-card overflow-hidden border-slate-200 p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:mb-8">
              <span>Onboarding</span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">Step {step + 1} of {STEPS.length}</span>
            </div>

            <div className="mb-8 flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    i < step
                      ? 'bg-emerald-100 text-emerald-700'
                      : i === step
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className={`hidden text-xs sm:block ${i === step ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
                </div>
              ))}
            </div>

            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Let&apos;s personalize your learning workspace</h1>
            <p className="mb-6 text-sm text-slate-600">A few quick details help us tailor pacing, content depth, and guidance style.</p>

            <div className="min-h-[300px]">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
              {step === 0 && <GradeSelect value={grade} onChange={setGrade} />}
              {step === 1 && <SubjectPicker selected={subjects} onChange={setSubjects} />}
              {step === 2 && <BackgroundForm value={background} onChange={setBackground} />}
              {step === 3 && <MarksheetUpload file={marksheetFile} onChange={setMarksheetFile} />}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 sm:mt-8 sm:pt-6">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {submitting ? 'Setting up...' : 'Start Learning'}
                </button>
              )}
            </div>
          </section>

          <aside className="relative hidden overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-[0_16px_40px_rgba(15,23,42,0.2)] lg:block">
            <div className="relative h-64 lg:h-72">
              <Image
                src="/subjects/math.jpg"
                alt="Mathematics notebook and planning"
                fill
                className="object-cover subject-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">AI Companion</p>
                <p className="mt-2 text-sm text-slate-100">Your plan updates every week based on performance trends and confidence signals.</p>
              </div>
            </div>
            <div className="space-y-4 p-5 text-slate-200">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">What you get</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200/90">
                  <li>Adaptive lesson sequencing</li>
                  <li>Voice-driven tutoring sessions</li>
                  <li>Weekly progress snapshots</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Current setup</p>
                <p className="mt-2 text-sm text-slate-100">Grade: {grade || 'Not selected'}</p>
                <p className="mt-1 text-sm text-slate-100">Subjects: {subjects.length}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
