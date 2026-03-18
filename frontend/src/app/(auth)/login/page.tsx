"use client";

import { useState } from 'react'
import Link from 'next/link'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { getSubjectTheme } from '@/lib/subjectGradients'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // TODO: Replace with Supabase auth call
    // const { error } = await supabase.auth.signInWithPassword({ email, password })
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/dashboard'
    }, 1000)
  }

  return (
    <main className="min-h-screen pt-20 pb-8 sm:pt-24 sm:pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0f1629] shadow-[0_28px_80px_rgba(0,0,0,0.4)] lg:grid-cols-2">
          <section className="relative hidden min-h-[620px] lg:block">
            <div className={`absolute inset-0 bg-gradient-to-br ${getSubjectTheme('english').gradient}`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(59,130,246,0.10),transparent_60%)]" />
            <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
              <path d="M200 50 Q140 40 80 55 L80 160 Q140 145 200 155" stroke="rgba(245,158,11,0.25)" strokeWidth="2" fill="rgba(245,158,11,0.03)" />
              <path d="M200 50 Q260 40 320 55 L320 160 Q260 145 200 155" stroke="rgba(245,158,11,0.25)" strokeWidth="2" fill="rgba(245,158,11,0.03)" />
              <line x1="200" y1="50" x2="200" y2="155" stroke="rgba(245,158,11,0.15)" strokeWidth="1.5" />
              {[72,84,96,108,120,132].map((y,i) => <line key={`tl${i}`} x1="100" y1={y} x2={155-i*4} y2={y} stroke="rgba(245,158,11,0.10)" strokeWidth="1.5" strokeLinecap="round" />)}
              {[72,84,96,108,120,132].map((y,i) => <line key={`tr${i}`} x1="220" y1={y} x2={290-i*3} y2={y} stroke="rgba(245,158,11,0.10)" strokeWidth="1.5" strokeLinecap="round" />)}
              <path d="M340 30 L350 120 L345 125 L335 120 Z" stroke="rgba(251,191,36,0.20)" strokeWidth="1.5" fill="rgba(251,191,36,0.04)" />
              <text x="30" y="60" fill="rgba(251,191,36,0.15)" fontSize="36" fontFamily="serif">&ldquo;</text>
              <text x="360" y="190" fill="rgba(251,191,36,0.12)" fontSize="36" fontFamily="serif">&rdquo;</text>
              <text x="40" y="170" fill="rgba(245,158,11,0.08)" fontSize="40" fontFamily="serif">A</text>
            </svg>
            <div className="absolute left-8 right-8 top-8 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-100/90">Learning OS</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Pick up where you left off</h2>
              <p className="mt-2 text-sm text-slate-200/90">Continue your AI-guided sessions with saved progress, lesson analytics, and smart revision cues.</p>
            </div>
            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-xs text-slate-200">Weekly completion</p>
                <p className="mt-1 text-2xl font-semibold text-white">92%</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-xs text-slate-200">AI feedback score</p>
                <p className="mt-1 text-2xl font-semibold text-white">A+</p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-b from-[#131b30] to-[#0f1629] px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <div className="relative mb-6 h-28 overflow-hidden rounded-2xl border border-white/[0.06] lg:hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getSubjectTheme('english').gradient}`} />
                <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
                  <path d="M200 50 Q140 40 80 55 L80 160 Q140 145 200 155" stroke="rgba(245,158,11,0.25)" strokeWidth="2" fill="rgba(245,158,11,0.03)" />
                  <path d="M200 50 Q260 40 320 55 L320 160 Q260 145 200 155" stroke="rgba(245,158,11,0.25)" strokeWidth="2" fill="rgba(245,158,11,0.03)" />
                  <line x1="200" y1="50" x2="200" y2="155" stroke="rgba(245,158,11,0.15)" strokeWidth="1.5" />
                  <text x="30" y="60" fill="rgba(251,191,36,0.15)" fontSize="36" fontFamily="serif">&ldquo;</text>
                  <text x="360" y="190" fill="rgba(251,191,36,0.12)" fontSize="36" fontFamily="serif">&rdquo;</text>
                </svg>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <LogIn className="h-5 w-5" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:mt-6 sm:text-3xl">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-400">Sign in to continue your personalized learning journey.</p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-4 sm:mt-8">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-blue-400 transition hover:text-blue-300">
                  Create one
                </Link>
              </p>

              <div className="mt-7 grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center text-xs text-slate-500 sm:mt-8">
                <div>
                  <p className="font-semibold text-slate-300">Adaptive</p>
                  <p>Lessons</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Voice</p>
                  <p>Tutoring</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Live</p>
                  <p>Insights</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
