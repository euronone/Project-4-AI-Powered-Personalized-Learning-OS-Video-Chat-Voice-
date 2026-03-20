"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Dna,
  Flame,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  Music,
  Paintbrush,
  PenLine,
  Pi,
  Play,
  Rocket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, API_URL } from "@/lib/api";

interface RecommendedVideo {
  chapter_id: string;
  subject_name: string;
  title: string;
  difficulty: string;
  content_score: number;
  collab_score: number;
  hybrid_score: number;
}

interface SubjectProgress {
  subject_id: string;
  subject_name: string;
  chapters_completed: number;
  total_chapters: number;
  average_score: number | null;
}

interface ProgressResponse {
  student_id: string;
  subjects: SubjectProgress[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-400/20 text-green-300 border border-green-400/30",
  intermediate: "bg-amber-400/20 text-amber-300 border border-amber-400/30",
  advanced: "bg-red-400/20 text-red-300 border border-red-400/30",
};

const SUBJECT_GRADIENTS: Record<string, string> = {
  "Mathematics": "from-indigo-600 via-blue-600 to-cyan-500",
  "Physics": "from-violet-600 via-purple-600 to-fuchsia-500",
  "Chemistry": "from-emerald-600 via-teal-600 to-cyan-500",
  "Biology": "from-green-600 via-emerald-500 to-lime-400",
  "Computer Science": "from-blue-600 via-indigo-600 to-violet-500",
  "English": "from-rose-600 via-pink-500 to-fuchsia-400",
  "History": "from-amber-600 via-orange-500 to-yellow-400",
  "Geography": "from-teal-600 via-cyan-500 to-sky-400",
  "Economics": "from-slate-600 via-zinc-500 to-neutral-400",
  "Art & Design": "from-pink-600 via-rose-500 to-red-400",
  "Music": "from-purple-600 via-violet-500 to-indigo-400",
  "Psychology": "from-fuchsia-600 via-pink-500 to-rose-400",
};

const SUBJECT_ICON_MAP: Record<string, React.ElementType> = {
  "Mathematics": Pi,
  "Physics": Atom,
  "Chemistry": FlaskConical,
  "Biology": Dna,
  "Computer Science": Code2,
  "English": PenLine,
  "History": Landmark,
  "Geography": Globe,
  "Economics": TrendingUp,
  "Art & Design": Paintbrush,
  "Music": Music,
  "Psychology": BrainCircuit,
};

const DEFAULT_GRADIENT = "from-slate-600 via-slate-500 to-slate-400";

const STAT_ICONS = [BookOpen, CheckCircle2, Target, TrendingUp];
const STAT_COLORS = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

/* ── Animated number counter ── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!value) { setDisplay(0); return; }
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedVideo[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState(false);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  /* ── Mock data for demo / when API is unavailable ── */
  const MOCK_PROGRESS: SubjectProgress[] = [
    { subject_id: "math-101", subject_name: "Mathematics", chapters_completed: 12, total_chapters: 20, average_score: 87 },
    { subject_id: "phys-101", subject_name: "Physics", chapters_completed: 8, total_chapters: 16, average_score: 79 },
    { subject_id: "cs-101", subject_name: "Computer Science", chapters_completed: 15, total_chapters: 18, average_score: 92 },
    { subject_id: "chem-101", subject_name: "Chemistry", chapters_completed: 5, total_chapters: 14, average_score: 74 },
    { subject_id: "bio-101", subject_name: "Biology", chapters_completed: 10, total_chapters: 12, average_score: 88 },
    { subject_id: "eng-101", subject_name: "English", chapters_completed: 7, total_chapters: 10, average_score: 81 },
  ];

  const MOCK_RECOMMENDATIONS: RecommendedVideo[] = [
    { chapter_id: "ch-001", subject_name: "Mathematics", title: "Calculus: Limits & Continuity", difficulty: "intermediate", content_score: 0.9, collab_score: 0.85, hybrid_score: 0.88 },
    { chapter_id: "ch-002", subject_name: "Physics", title: "Quantum Mechanics Fundamentals", difficulty: "advanced", content_score: 0.82, collab_score: 0.78, hybrid_score: 0.80 },
    { chapter_id: "ch-003", subject_name: "Computer Science", title: "Data Structures: Trees & Graphs", difficulty: "intermediate", content_score: 0.95, collab_score: 0.91, hybrid_score: 0.93 },
    { chapter_id: "ch-004", subject_name: "Chemistry", title: "Organic Chemistry: Reaction Mechanisms", difficulty: "advanced", content_score: 0.76, collab_score: 0.72, hybrid_score: 0.74 },
    { chapter_id: "ch-005", subject_name: "Biology", title: "Cell Division & Mitosis", difficulty: "beginner", content_score: 0.88, collab_score: 0.84, hybrid_score: 0.86 },
    { chapter_id: "ch-006", subject_name: "English", title: "Shakespeare: Hamlet Analysis", difficulty: "intermediate", content_score: 0.81, collab_score: 0.77, hybrid_score: 0.79 },
    { chapter_id: "ch-007", subject_name: "Mathematics", title: "Linear Algebra: Eigenvalues", difficulty: "advanced", content_score: 0.87, collab_score: 0.83, hybrid_score: 0.85 },
    { chapter_id: "ch-008", subject_name: "Computer Science", title: "Introduction to Neural Networks", difficulty: "beginner", content_score: 0.92, collab_score: 0.88, hybrid_score: 0.90 },
  ];

  useEffect(() => {
    if (!user) {
      // Use mock data when no user is authenticated
      setProgress(MOCK_PROGRESS);
      setProgressLoading(false);
      setRecommendations(MOCK_RECOMMENDATIONS);
      setRecsLoading(false);
      return;
    }
    const studentId = user.id;

    apiGet<ProgressResponse>(`/api/progress/${studentId}`)
      .then((data) => setProgress(data.subjects))
      .catch(() => setProgress(MOCK_PROGRESS))
      .finally(() => setProgressLoading(false));

    fetch(`${API_URL}/api/recommendations/chapters/${studentId}?top_k=8&include_sentiment=true`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data: RecommendedVideo[]) => {
        setRecommendations(data);
        setRecsError(false);
      })
      .catch(() => {
        setRecommendations(MOCK_RECOMMENDATIONS);
        setRecsError(false);
      })
      .finally(() => setRecsLoading(false));
  }, [user]);

  const totalSubjects = progress.length;
  const totalCompleted = progress.reduce((sum, s) => sum + s.chapters_completed, 0);
  const totalChapters = progress.reduce((sum, s) => sum + s.total_chapters, 0);
  const avgScore = progress.length
    ? Math.round(progress.reduce((sum, s) => sum + (s.average_score ?? 0), 0) / progress.length)
    : 0;

  const stats = [
    { label: "Subjects", value: totalSubjects, suffix: "" },
    { label: "Chapters Done", value: totalCompleted, suffix: "" },
    { label: "Total Chapters", value: totalChapters, suffix: "" },
    { label: "Average Score", value: avgScore, suffix: "%" },
  ];

  const continueLearning = progress
    .filter((s) => s.total_chapters > 0 && s.chapters_completed < s.total_chapters)
    .slice(0, 4)
    .map((s) => ({
      id: s.subject_id,
      title: s.subject_name,
      chapter: `${s.chapters_completed} of ${s.total_chapters} chapters`,
      progress: Math.round((s.chapters_completed / s.total_chapters) * 100),
      gradient: SUBJECT_GRADIENTS[s.subject_name] ?? DEFAULT_GRADIENT,
      icon: SUBJECT_ICON_MAP[s.subject_name] ?? BookOpen,
    }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="app-shell space-y-8">
      {/* ━━ Dark Hero Banner with Glow & Floating Elements ━━ */}
      <section className="animate-fade-in hero-gradient relative overflow-hidden rounded-3xl">
        {/* Background effects */}
        <div className="hero-dots absolute inset-0 opacity-40" />
        <div className="hero-glow absolute -left-20 -top-20 h-72 w-72 bg-indigo-500/30" />
        <div className="hero-glow absolute -bottom-16 right-10 h-56 w-56 bg-blue-600/20" style={{ animationDelay: "1.5s" }} />
        <div className="hero-glow absolute right-1/3 top-8 h-40 w-40 bg-purple-500/15" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 grid gap-6 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
          <div className="animate-slide-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="text-xs font-semibold text-white/80">AI Tutor Ready</span>
            </div>

            <h1 className="display-title text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {greeting},{" "}
              <span className="text-gradient bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                {user?.email?.split("@")[0] || "Learner"}
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300/90">
              Your AI tutor has prepared a personalized learning path. Dive in and keep building momentum.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-white/10 transition-all hover:shadow-xl hover:shadow-white/20"
              >
                <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                Resume Learning
              </Link>
              <Link
                href="/chatbot"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Sparkles className="h-4 w-4" />
                Ask AI Tutor
              </Link>
            </div>

            {/* Quick social-proof stats inline */}
            <div className="mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-6">
              <div className="animate-slide-up-2">
                <p className="text-2xl font-bold text-white">
                  <AnimatedNumber value={totalCompleted} />
                </p>
                <p className="text-xs text-slate-400">Chapters Completed</p>
              </div>
              <div className="animate-slide-up-3">
                <p className="text-2xl font-bold text-white">
                  {avgScore > 0 ? <AnimatedNumber value={avgScore} suffix="%" /> : "—"}
                </p>
                <p className="text-xs text-slate-400">Average Score</p>
              </div>
              <div className="animate-slide-up-4">
                <p className="text-2xl font-bold text-white">
                  <AnimatedNumber value={totalSubjects} />
                </p>
                <p className="text-xs text-slate-400">Active Subjects</p>
              </div>
            </div>
          </div>

          {/* Floating visual card */}
          <div className="animate-scale-in relative hidden md:block">
            <div className="floating-badge relative flex h-full min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-blue-700/20 shadow-2xl shadow-black/40">
              {/* Decorative circles */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-xl" />

              {/* Central icon cluster */}
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm">
                  <BrainCircuit className="h-10 w-10 text-indigo-400" />
                </div>
                <div className="absolute -right-4 -top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 shadow-md backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </div>
                <div className="absolute -bottom-2 -left-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 shadow-md backdrop-blur-sm">
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute right-4 top-4 animate-slide-up-3 rounded-xl border border-white/20 bg-black/60 px-3 py-2 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">AI Powered</span>
                </div>
              </div>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-lg">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Your Progress</p>
                  <p className="mt-1 text-sm font-bold text-white">Keep the momentum going!</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="progress-bar-animated h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-400" style={{ width: `${totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0}%` }} />
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-300">{totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0}% overall</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Stat Cards with Glow Border ━━ */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, i) => {
          const Icon = STAT_ICONS[i];
          const animClass = `animate-slide-up-${i + 1}` as const;
          return (
            <article
              key={item.label}
              className={`stat-glow card-reveal rounded-2xl border border-white/[0.06] bg-[#111118] p-5 ${animClass}`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${STAT_COLORS[i]} shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">
                    {item.value ? <AnimatedNumber value={item.value} suffix={item.suffix} /> : "—"}
                  </p>
                  <p className="text-xs font-medium text-slate-500">{item.label}</p>
                </div>
              </div>
              <div className="shimmer-bar mt-4 h-1 rounded-full bg-white/[0.04]" />
            </article>
          );
        })}
      </section>

      {/* ━━ Continue Learning Section ━━ */}
      <section className="animate-slide-up-5 surface-card overflow-hidden p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-500/30">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Continue Learning</h2>
              <p className="text-sm text-slate-500">Pick up exactly where you paused</p>
            </div>
          </div>
          <Link href="/courses" className="group inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
            View all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continueLearning.map((course, i) => {
            const SubjectIcon = course.icon;
            return (
              <Link
                key={course.id}
                href={`/learn/${course.id}`}
                className={`card-reveal group overflow-hidden rounded-xl border border-white/[0.06] bg-[#111118] animate-slide-up-${i + 5}`}
              >
                <div className={`relative flex h-40 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${course.gradient}`}>
                  {/* Decorative bg elements */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                  <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/20 blur-lg" />
                  <SubjectIcon className="h-16 w-16 text-white/20 transition-transform duration-500 group-hover:scale-125 group-hover:text-white/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110">
                      <Play className="h-5 w-5 fill-slate-900 text-slate-900" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-bold text-white drop-shadow-lg">{course.title}</p>
                    <p className="mt-0.5 text-xs text-white/70">{course.chapter}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="progress-bar-animated h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-400">{course.progress}% complete</span>
                    <span className="inline-flex items-center gap-1 text-indigo-400">
                      <ArrowRight className="h-3 w-3" /> Continue
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ━━ AI Recommended Videos ━━ */}
      <section className="animate-slide-up-6 surface-card overflow-hidden p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Recommended for You</h2>
              <p className="text-sm text-slate-500">AI-powered picks based on your learning patterns</p>
            </div>
          </div>
          <Link href="/video" className="group inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
            Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111118]">
                <div className="shimmer-bar h-40 bg-white/[0.03]" />
                <div className="space-y-3 p-4">
                  <div className="shimmer-bar h-4 w-3/4 rounded bg-white/[0.06]" />
                  <div className="shimmer-bar h-3 w-1/2 rounded bg-white/[0.04]" />
                  <div className="shimmer-bar h-3 w-1/3 rounded bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        ) : recsError || recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06]">
              <Sparkles className="h-7 w-7 text-slate-500" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-300">
              {recsError ? "Unable to load recommendations right now" : "No recommendations available yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {recsError ? "Please check if the recommendation engine is running" : "Complete a few lessons and we'll personalize your feed"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((rec, i) => (
              <Link
                key={rec.chapter_id}
                href={`/video?chapter=${rec.chapter_id}`}
                className={`card-reveal group overflow-hidden rounded-xl border border-white/[0.06] bg-[#111118] animate-slide-up-${Math.min(i + 5, 8)}`}
              >
                <div className="relative">
                  <div className={`relative flex h-40 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${SUBJECT_GRADIENTS[rec.subject_name] ?? DEFAULT_GRADIENT}`}>
                    {(() => { const SIcon = SUBJECT_ICON_MAP[rec.subject_name] ?? BookOpen; return <SIcon className="h-16 w-16 text-white/20 transition-transform duration-500 group-hover:scale-125 group-hover:text-white/30" />; })()}
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                    <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/20 blur-lg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-2xl backdrop-blur-sm transition-transform group-hover:scale-110">
                      <Play className="h-6 w-6 fill-slate-900 text-slate-900" />
                    </div>
                  </div>
                  <span className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase backdrop-blur-sm ${DIFFICULTY_COLORS[rec.difficulty] ?? "bg-slate-100/20 text-slate-300 border border-slate-400/30"}`}>
                    {rec.difficulty}
                  </span>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 font-bold text-white transition-colors group-hover:text-indigo-400">{rec.title}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{rec.subject_name}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {(rec.hybrid_score * 5).toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                      {(rec.hybrid_score * 100).toFixed(0)}% Match
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
