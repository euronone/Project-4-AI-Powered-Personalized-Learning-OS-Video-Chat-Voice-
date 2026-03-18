'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { BookOpen, Clock3, Flame, Target } from 'lucide-react'
import SubjectVisual from '@/components/common/SubjectVisual'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const studyTimeData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Hours Studied',
      data: [2.5, 3.8, 1.5, 4.2, 3.0, 5.5, 4.0],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#3b82f6',
    },
  ],
}

const progressData = {
  labels: ['Math', 'Physics', 'Chem', 'Biology', 'English', 'CS', 'History', 'Geo'],
  datasets: [
    {
      label: 'Progress (%)',
      data: [72, 45, 60, 33, 85, 20, 55, 40],
      backgroundColor: 'rgba(37, 99, 235, 0.80)',
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
}

const skillData = {
  labels: ['Problem Solving', 'Critical Thinking', 'Writing', 'Coding', 'Communication'],
  datasets: [
    {
      data: [28, 24, 16, 20, 12],
      backgroundColor: ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#93c5fd'],
      borderWidth: 0,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: { color: '#64748b', font: { size: 11 } },
    },
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.06)' },
      ticks: { color: '#64748b', font: { size: 11 } },
    },
  },
}

export default function AnalyticsPage() {
  return (
    <div className="app-shell space-y-6">
      <section className="surface-card overflow-hidden p-6 md:p-7">
        <div className="grid gap-4 md:grid-cols-[1.25fr_1fr] md:items-center">
          <div>
            <h1 className="display-title text-2xl font-semibold tracking-tight text-white md:text-3xl">Learning Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">Clear insights to help you plan smarter sessions and improve outcomes.</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
            <SubjectVisual subject="geography" className="h-28 w-full md:h-32" />
            <div className="absolute bottom-2 left-2 rounded-lg bg-[#0f1629]/90 px-2 py-1 text-[11px] font-semibold text-slate-300">
              Weekly trend overview
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Total Study Time', value: '124h', icon: Clock3 },
          { title: 'Current Streak', value: '12 Days', icon: Flame },
          { title: 'Courses Completed', value: '8', icon: BookOpen },
          { title: 'Average Score', value: '92%', icon: Target },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.title} className="surface-card-soft p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-600 p-2 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{stat.title}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="surface-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Study Time This Week</h2>
          <div className="h-[280px]">
            <Line data={studyTimeData} options={chartOptions} />
          </div>
        </article>

        <article className="surface-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Progress by Subject</h2>
          <div className="h-[280px]">
            <Bar
              data={progressData}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: { ...chartOptions.scales.y, max: 100 },
                },
              }}
            />
          </div>
        </article>

        <article className="surface-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Skill Distribution</h2>
          <div className="h-[280px]">
            <Doughnut
              data={skillData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', font: { size: 11 }, padding: 10 },
                  },
                },
              }}
            />
          </div>
        </article>

        <article className="surface-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">AI Insights</h2>
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#131b30] p-4">
              <SubjectVisual subject="physics" className="absolute inset-0 h-full w-full opacity-20" />
              <div className="relative">
              <p className="text-sm font-semibold text-white">Best Focus Window</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                You perform strongest between 10:00 AM and 12:00 PM. Reserve conceptual chapters for this window.
              </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#131b30] p-4">
              <SubjectVisual subject="mathematics" className="absolute inset-0 h-full w-full opacity-20" />
              <div className="relative">
              <p className="text-sm font-semibold text-white">Recommended Next Step</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Increase physics practice sets by 2 per week to improve confidence on numerical questions.
              </p>
              </div>
            </div>
            <button className="mt-1 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              View Personalized Plan
            </button>
          </div>
        </article>
      </section>
    </div>
  )
}
