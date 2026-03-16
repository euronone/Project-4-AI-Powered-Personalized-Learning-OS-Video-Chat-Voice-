"use client";

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    // TODO: Replace with Supabase auth call
    // const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/onboarding'
    }, 1000)
  }

  return (
    <main className="min-h-screen pt-20 pb-8 sm:pt-24 sm:pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:grid-cols-2">
          <section className="order-2 bg-gradient-to-b from-white to-slate-50 px-5 py-8 sm:px-10 sm:py-10 lg:order-1 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-300/40">
                <UserPlus className="h-5 w-5" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:mt-6 sm:text-3xl">Create your account</h1>
              <p className="mt-2 text-sm text-slate-600">Set up your profile and start a personalized learning path in under a minute.</p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="mt-6 space-y-4 sm:mt-8">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                    />
                  </div>
                </div>

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
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
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
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-brand-700 transition hover:text-brand-800">
                  Sign in
                </Link>
              </p>
            </div>
          </section>

          <section className="relative order-1 min-h-[240px] sm:min-h-[300px] lg:order-2 lg:min-h-[620px]">
            <Image
              src="/subjects/physics.jpg"
              alt="Student solving advanced coursework"
              fill
              className="object-cover subject-image"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-slate-900/30 to-transparent" />
            <div className="absolute left-4 right-4 top-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-100/90">Personalized start</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Built for your pace</h2>
              <p className="mt-2 text-xs text-slate-200/90 sm:text-sm">Instant diagnostics, dynamic lesson plans, and live mentorship support from day one.</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2 sm:bottom-8 sm:left-8 sm:right-8 sm:gap-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
                <p className="text-xs text-slate-200">Setup time</p>
                <p className="mt-1 text-lg font-semibold text-white sm:text-2xl">&lt; 1 min</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
                <p className="text-xs text-slate-200">Recommended plan</p>
                <p className="mt-1 text-lg font-semibold text-white sm:text-2xl">Auto</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
