"use client";

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
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
    <main className="flex min-h-screen items-center justify-center bg-dark pt-16">
      <div className="w-full max-w-2xl px-4">
        <div className="glass rounded-xl p-8">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  i < step ? 'bg-green-500/20 text-green-400' :
                  i === step ? 'bg-accent text-white' :
                  'bg-white/5 text-white/30'
                }`}>
                  {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-white font-medium' : 'text-white/30'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/5" />}
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome to AI Powered Personalized Learning OS</h1>
          <p className="text-white/40 text-sm mb-6">Let&apos;s personalize your learning experience</p>

          {/* Step content */}
          <div className="min-h-[280px]">
            {step === 0 && <GradeSelect value={grade} onChange={setGrade} />}
            {step === 1 && <SubjectPicker selected={subjects} onChange={setSubjects} />}
            {step === 2 && <BackgroundForm value={background} onChange={setBackground} />}
            {step === 3 && <MarksheetUpload file={marksheetFile} onChange={setMarksheetFile} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2 text-white/40 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance}
                className="flex items-center gap-1 px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Setting up...' : 'Start Learning'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
