"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Flame, Star, TrendingUp } from "lucide-react";

const continueLearning = [
  { id: "mathematics", title: "Mathematics", chapter: "Quadratic Equations", progress: 72, image: "/subjects/math.jpg", time: "2h left" },
  { id: "physics", title: "Physics", chapter: "Newton's Laws", progress: 45, image: "/subjects/physics.jpg", time: "4h left" },
  { id: "chemistry", title: "Chemistry", chapter: "Periodic Table", progress: 60, image: "/subjects/chemistry.jpg", time: "3h left" },
  { id: "english", title: "English", chapter: "Shakespeare's Sonnets", progress: 85, image: "/subjects/english.jpg", time: "1h left" },
];

const recommended = [
  { id: "physics", title: "Physics — Mechanics", rating: 4.9, students: "3.1K", image: "/subjects/physics.jpg" },
  { id: "mathematics", title: "Mathematics — Calculus", rating: 4.8, students: "4.2K", image: "/subjects/math.jpg" },
  { id: "chemistry", title: "Chemistry — Organic", rating: 4.7, students: "2.8K", image: "/subjects/chemistry.jpg" },
  { id: "biology", title: "Biology — Genetics", rating: 4.8, students: "3.5K", image: "/subjects/biology.jpg" },
];

const stats = [
  { label: "Subjects", value: "12", icon: BookOpen },
  { label: "Hours This Week", value: "24.5", icon: Clock3 },
  { label: "Learning Streak", value: "12 days", icon: Flame },
  { label: "Average Score", value: "92%", icon: TrendingUp },
];

export default function DashboardPage() {
  return (
    <div className="app-shell space-y-8">
      <section className="surface-card overflow-hidden">
        <div className="relative grid gap-6 p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#dbc8a6] bg-[#fbf6ec] px-3 py-1 text-xs font-semibold text-[#755e37]">
              Personalized Track
            </p>
            <h1 className="display-title text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Continue your learning momentum
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
              Your AI tutor has prepared the next lesson sequence with focused practice and recap activities.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/learn/physics"
                className="inline-flex items-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Resume Lesson
              </Link>
              <Link
                href="/chatbot"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#f8f5ee]"
              >
                Ask AI Tutor
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200">
            <img src="/subjects/physics.jpg" alt="Learning banner" className="subject-image h-56 w-full object-cover md:h-full" />
            <div className="subject-image-overlay absolute inset-0" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/85 p-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Focus</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Newton's Laws of Motion</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="surface-card-soft p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-900 p-2 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-600">{item.label}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
            <p className="text-sm text-slate-500">Pick up exactly where you paused</p>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continueLearning.map((course) => (
            <Link key={course.id} href={`/learn/${course.id}`} className="card-hover overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="relative">
                <img src={course.image} alt={course.title} className="subject-image h-36 w-full object-cover" />
                <div className="subject-image-overlay absolute inset-0" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-900">{course.title}</p>
                <p className="mt-1 text-xs text-slate-500">{course.chapter}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-700" style={{ width: `${course.progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{course.progress}% complete</span>
                  <span>{course.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Tracks</h2>
            <p className="text-sm text-slate-500">Chosen for your pace and strengths</p>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900">
            Explore <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recommended.map((item) => (
            <Link key={item.id} href={`/learn/${item.id}`} className="card-hover overflow-hidden rounded-xl border border-slate-200 bg-white">
              <img src={item.image} alt={item.title} className="subject-image h-32 w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {item.rating}
                  </span>
                  <span>{item.students} learners</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
