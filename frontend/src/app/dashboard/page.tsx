"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock3, Flame, Play, Sparkles, Star, TrendingUp } from "lucide-react";
import { API_URL } from "@/lib/constants";

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
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

const SUBJECT_IMAGES: Record<string, string> = {
  "Mathematics": "/subjects/math.jpg",
  "Physics": "/subjects/physics.jpg",
  "Chemistry": "/subjects/chemistry.jpg",
  "Biology": "/subjects/biology.jpg",
  "Computer Science": "/subjects/cs.jpg",
  "English": "/subjects/english.jpg",
  "History": "/subjects/history.jpg",
  "Geography": "/subjects/geography.jpg",
  "Economics": "/subjects/economics.jpg",
  "Art & Design": "/subjects/art.jpg",
  "Music": "/subjects/music.jpg",
  "Psychology": "/subjects/psychology.jpg",
};

const DEMO_STUDENT_ID = "e750d9e1-621f-4d30-84e5-2763b84562ff";

const continueLearning = [
  { id: "mathematics", title: "Mathematics", chapter: "Quadratic Equations", progress: 72, time: "2h left", image: "/subjects/math.jpg" },
  { id: "physics", title: "Physics", chapter: "Newton's Laws", progress: 45, time: "4h left", image: "/subjects/physics.jpg" },
  { id: "chemistry", title: "Chemistry", chapter: "Periodic Table", progress: 60, time: "3h left", image: "/subjects/chemistry.jpg" },
  { id: "english", title: "English", chapter: "Shakespeare's Sonnets", progress: 85, time: "1h left", image: "/subjects/english.jpg" },
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
            <p className="mb-3 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              Personalized Track
            </p>
            <h1 className="display-title text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Continue your learning momentum
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
              Your AI tutor has prepared the next lesson sequence with focused practice and recap activities.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/learn/physics"
                className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Resume Lesson
              </Link>
              <Link
                href="/chatbot"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ask AI Tutor
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200">
            <Image src="/subjects/physics.jpg" alt="Physics" fill className="object-cover subject-image" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 p-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Focus</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Newton&apos;s Laws of Motion</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="surface-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-600 p-2 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
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
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continueLearning.map((course) => (
            <Link key={course.id} href={`/learn/${course.id}`} className="card-hover overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="relative h-36 w-full">
                <Image src={course.image} alt={course.title} fill className="object-cover subject-image" />
                <div className="subject-image-overlay absolute inset-0" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-900">{course.title}</p>
                <p className="mt-1 text-xs text-slate-500">{course.chapter}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${course.progress}%` }} />
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
              <h2 className="text-lg font-bold text-slate-900">Recommended Videos</h2>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-sm text-slate-500">AI-powered picks based on your learning patterns</p>
          </div>
          <Link href="/video" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
            Explore <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="h-36 bg-slate-200" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : recsError || recommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-600">
              {recsError ? "Unable to load recommendations right now" : "No recommendations available yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {recsError ? "Please check if the recommendation engine is running" : "Complete a few lessons and we'll personalize your feed"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.chapter_id}
                href={`/video?chapter=${rec.chapter_id}`}
                className="card-hover group overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="relative">
                  <div className="relative h-36 w-full">
                    <Image
                      src={SUBJECT_IMAGES[rec.subject_name] ?? "/subjects/default.jpg"}
                      alt={rec.title}
                      fill
                      className="object-cover subject-image"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-white/90 p-3 shadow-lg">
                      <Play className="h-5 w-5 fill-slate-900 text-slate-900" />
                    </div>
                  </div>
                  <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${DIFFICULTY_COLORS[rec.difficulty] ?? "bg-slate-100 text-slate-600"}`}>
                    {rec.difficulty}
                  </span>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 font-semibold text-slate-900">{rec.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{rec.subject_name}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {(rec.hybrid_score * 5).toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium">
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
