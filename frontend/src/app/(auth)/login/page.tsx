"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message)
        return
      }
      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-8 sm:pt-24 sm:pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:grid-cols-2">
          <section className="relative hidden min-h-[620px] lg:block">
            <Image
              src="/subjects/english.jpg"
              alt="Student reading and learning"
              fill
              className="object-cover subject-image"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-slate-900/35 to-transparent" />
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

          <section className="bg-gradient-to-b from-white to-slate-50 px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <div className="relative mb-6 h-28 overflow-hidden rounded-2xl border border-slate-200 lg:hidden">
                <Image
                  src="/subjects/english.jpg"
                  alt="Learning journey"
                  fill
                  className="object-cover subject-image"
                />
                <div className="subject-image-overlay absolute inset-0" />
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-300/40">
                <LogIn className="h-5 w-5" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:mt-6 sm:text-3xl">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-600">Sign in to continue your personalized learning journey.</p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-4 sm:mt-8">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-brand-700 transition hover:text-brand-800">
                  Create one
                </Link>
              </p>

              <div className="mt-7 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs text-slate-500 sm:mt-8">
                <div>
                  <p className="font-semibold text-slate-800">Adaptive</p>
                  <p>Lessons</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Voice</p>
                  <p>Tutoring</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Live</p>
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
