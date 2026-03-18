"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Flame, Play, Sparkles, Star, TrendingUp } from "lucide-react";
import { API_URL } from "@/lib/constants";
import SubjectVisual from "@/components/common/SubjectVisual";

interface RecommendedVideo {
  chapter_id: string;
  subject_name: string;
  title: string;
  difficulty: string;
  content_score: number;
  collab_score: number;
  hybrid_score: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-900/40 text-emerald-400",
  intermediate: "bg-amber-900/40 text-amber-400",
  advanced: "bg-rose-900/40 text-rose-400",
};

const SUBJECT_SLUG: Record<string, string> = {
  "Mathematics": "mathematics",
  "Physics": "physics",
  "Chemistry": "chemistry",
  "Biology": "biology",
  "Computer Science": "cs",
  "English": "english",
  "History": "history",
  "Geography": "geography",
  "Economics": "economics",
  "Art & Design": "art",
  "Music": "art",
  "Psychology": "biology",
};

const DEMO_STUDENT_ID = "e750d9e1-621f-4d30-84e5-2763b84562ff";

const continueLearning = [
  { id: "mathematics", title: "Mathematics", chapter: "Quadratic Equations", progress: 72, time: "2h left" },
  { id: "physics", title: "Physics", chapter: "Newton's Laws", progress: 45, time: "4h left" },
  { id: "chemistry", title: "Chemistry", chapter: "Periodic Table", progress: 60, time: "3h left" },
  { id: "english", title: "English", chapter: "Shakespeare's Sonnets", progress: 85, time: "1h left" },
];

const stats = [
  { label: "Subjects", value: "12", icon: BookOpen },
  { label: "Hours This Week", value: "24.5", icon: Clock3 },
  { label: "Learning Streak", value: "12 days", icon: Flame },
  { label: "Average Score", value: "92%", icon: TrendingUp },
];

export default function DashboardPage() {
  const [recommendations, setRecommendations] = useState<RecommendedVideo[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch(
          `${API_URL}/api/recommendations/chapters/${DEMO_STUDENT_ID}?top_k=8&include_sentiment=true`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: RecommendedVideo[] = await res.json();
        setRecommendations(data);
        setRecsError(false);
      } catch {
        setRecsError(true);
      } finally {
        setRecsLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  return (
    <div className="app-shell space-y-8">
      <section className="surface-card overflow-hidden">
        <div className="relative grid gap-6 p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              Personalized Track
            </p>
            <h1 className="display-title text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Continue your learning momentum
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
              Your AI tutor has prepared the next lesson sequence with focused practice and recap activities.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/learn/physics"
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Resume Lesson
              </Link>
              <Link
                href="/chatbot"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
              >
                Ask AI Tutor
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
            <SubjectVisual subject="physics" className="h-56 md:h-full w-full" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-[#0f1629]/90 p-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current Focus</p>
              <p className="mt-1 text-sm font-semibold text-white">Newton&apos;s Laws of Motion</p>
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
                <div className="rounded-xl bg-blue-600 p-2 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-slate-400">{item.label}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Continue Learning</h2>
            <p className="text-sm text-slate-500">Pick up exactly where you paused</p>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continueLearning.map((course) => (
            <Link key={course.id} href={`/learn/${course.id}`} className="card-hover overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827]">
              <SubjectVisual subject={course.id} className="h-36 w-full" />
              <div className="p-4">
                <p className="font-semibold text-white">{course.title}</p>
                <p className="mt-1 text-xs text-slate-500">{course.chapter}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${course.progress}%` }} />
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Recommended Videos</h2>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-sm text-slate-500">AI-powered picks based on your learning patterns</p>
          </div>
          <Link href="/video" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white">
            Explore <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827]">
                <div className="h-36 bg-white/[0.04]" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                  <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        ) : recsError || recommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-2 text-sm font-medium text-slate-300">
              {recsError ? "Unable to load recommendations right now" : "No recommendations available yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {recsError ? "Please check if the recommendation engine is running" : "Complete a few lessons and we'll personalize your feed"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.chapter_id}
                href={`/video?chapter=${rec.chapter_id}`}
                className="card-hover group overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827]"
              >
                <div className="relative">
                  <SubjectVisual subject={SUBJECT_SLUG[rec.subject_name] ?? "default"} className="h-36 w-full" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-white/90 p-3 shadow-lg">
                      <Play className="h-5 w-5 fill-slate-900 text-slate-900" />
                    </div>
                  </div>
                  <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${DIFFICULTY_COLORS[rec.difficulty] ?? "bg-slate-800 text-slate-400"}`}>
                    {rec.difficulty}
                  </span>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 font-semibold text-white">{rec.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{rec.subject_name}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {(rec.hybrid_score * 5).toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      Match {(rec.hybrid_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
