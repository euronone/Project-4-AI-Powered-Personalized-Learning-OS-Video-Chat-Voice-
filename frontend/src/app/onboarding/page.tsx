"use client";

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { getSubjectTheme } from '@/lib/subjectGradients'
import GradeSelect from './components/GradeSelect'
import SubjectPicker from './components/SubjectPicker'
import BackgroundForm from './components/BackgroundForm'
import MarksheetUpload from './components/MarksheetUpload'

const STEPS = ['Grade', 'Subjects', 'Background', 'Marksheet']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [grade, setGrade] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [background, setBackground] = useState('')
  const [marksheetFile, setMarksheetFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canAdvance =
    (step === 0 && grade !== '') ||
    (step === 1 && subjects.length > 0) ||
    (step === 2 && background.trim().length > 0) ||
    step === 3

  const handleSubmit = async () => {
    setSubmitting(true)
    // TODO: POST to /api/onboarding with { grade, subjects, background, marksheet }
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1000)
  }

  return (
    <main className="min-h-screen pt-20 pb-8 sm:pt-24 sm:pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="surface-card overflow-hidden border-white/[0.06] p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:mb-8">
              <span>Onboarding</span>
              <span className="rounded-full bg-blue-600/15 px-3 py-1 text-blue-400">Step {step + 1} of {STEPS.length}</span>
            </div>

            <div className="mb-8 flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    i < step
                      ? 'bg-emerald-900/40 text-emerald-400'
                      : i === step
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/[0.06] text-slate-500'
                  }`}>
                    {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className={`hidden text-xs sm:block ${i === step ? 'font-semibold text-white' : 'text-slate-500'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/[0.06]" />}
                </div>
              ))}
            </div>

            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Let&apos;s personalize your learning workspace</h1>
            <p className="mb-6 text-sm text-slate-400">A few quick details help us tailor pacing, content depth, and guidance style.</p>

            <div className="min-h-[300px]">
              {step === 0 && <GradeSelect value={grade} onChange={setGrade} />}
              {step === 1 && <SubjectPicker selected={subjects} onChange={setSubjects} />}
              {step === 2 && <BackgroundForm value={background} onChange={setBackground} />}
              {step === 3 && <MarksheetUpload file={marksheetFile} onChange={setMarksheetFile} />}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5 sm:mt-8 sm:pt-6">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {submitting ? 'Setting up...' : 'Start Learning'}
                </button>
              )}
            </div>
          </section>

          <aside className="relative hidden overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0a0e1a] shadow-[0_16px_40px_rgba(0,0,0,0.3)] lg:block">
            <div className="relative h-64 lg:h-72">
              <div className={`absolute inset-0 bg-gradient-to-br ${getSubjectTheme('mathematics').gradient}`} />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(59,130,246,0.10),transparent_60%)]" />
              <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
                {Array.from({length:12}).map((_,i) => <line key={`vg${i}`} x1={i*36} y1="0" x2={i*36} y2="200" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />)}
                {Array.from({length:6}).map((_,i) => <line key={`hg${i}`} x1="0" y1={i*40} x2="400" y2={i*40} stroke="rgba(99,102,241,0.06)" strokeWidth="1" />)}
                <path d="M60 180 Q120 20 180 100 Q240 180 300 40 Q340 -20 380 30" stroke="rgba(99,102,241,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M0 120 C40 60 80 60 120 120 C160 180 200 180 240 120 C280 60 320 60 360 120" stroke="rgba(59,130,246,0.25)" strokeWidth="2" fill="none" />
                <text x="30" y="50" fill="rgba(129,140,248,0.20)" fontSize="28" fontFamily="serif">∑</text>
                <text x="320" y="170" fill="rgba(129,140,248,0.18)" fontSize="24" fontFamily="serif">∫</text>
                <text x="200" y="45" fill="rgba(99,102,241,0.15)" fontSize="20" fontFamily="serif">π</text>
                <circle cx="280" cy="60" r="20" fill="rgba(99,102,241,0.08)" />
                <circle cx="80" cy="140" r="14" fill="rgba(59,130,246,0.06)" />
              </svg>
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
