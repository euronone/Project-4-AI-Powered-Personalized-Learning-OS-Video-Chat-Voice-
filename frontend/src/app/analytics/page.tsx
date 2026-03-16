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
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Clock, Target, BookOpen, Flame } from 'lucide-react'

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
      borderColor: '#e50914',
      backgroundColor: 'rgba(229, 9, 20, 0.1)',
      tension: 0.4,
      fill: true,
    }
  ]
}

const progressData = {
  labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'CS', 'History', 'Geography', 'Economics', 'Hindi', 'Env. Science', 'Art'],
  datasets: [
    {
      label: 'Subject Progress (%)',
      data: [72, 45, 60, 33, 85, 20, 55, 40, 28, 68, 50, 15],
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(217, 119, 6, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(124, 58, 237, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(132, 204, 22, 0.8)',
        'rgba(192, 38, 211, 0.8)',
      ],
      borderRadius: 8,
    }
  ]
}

const skillData = {
  labels: ['Problem Solving', 'Critical Thinking', 'Lab Skills', 'Writing', 'Coding', 'Research', 'Creativity', 'Communication'],
  datasets: [
    {
      data: [24, 20, 12, 14, 10, 6, 8, 6],
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(192, 38, 211, 0.8)',
        'rgba(20, 184, 166, 0.8)',
      ],
      borderWidth: 0,
    }
  ]
}

export default function AnalyticsPage() {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } } },
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } } }
    }
  }

  return (
    <div className="min-h-screen bg-dark pt-20 px-6 lg:px-14 pb-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
        <p className="text-white/40 mt-1 text-sm">Track your progress and study habits</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Study Time', value: '124h', icon: Clock, color: 'text-neon-blue' },
          { title: 'Current Streak', value: '12 Days', icon: Flame, color: 'text-neon-orange' },
          { title: 'Courses Completed', value: '8', icon: BookOpen, color: 'text-neon-green' },
          { title: 'Average Score', value: '92%', icon: Target, color: 'text-neon-purple' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="glass rounded-xl p-5 flex items-center gap-4">
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-[12px] text-white/40">{stat.title}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-5">Study Time (This Week)</h2>
          <div className="h-[280px]">
            <Line data={studyTimeData} options={chartOptions} />
          </div>
        </div>

        {/* Progress by Course */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-5">Course Progress</h2>
          <div className="h-[280px]">
            <Bar data={progressData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: 100 } } }} />
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-5">Skills Distribution</h2>
          <div className="h-[280px] flex items-center justify-center relative">
            <Doughnut 
              data={skillData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, padding: 12 } }
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center pr-24">
                <p className="text-2xl font-bold text-white">5</p>
                <p className="text-[11px] text-white/30">Key Skills</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Learning Insights */}
        <div className="rounded-xl bg-gradient-to-br from-accent/20 to-neon-purple/20 border border-white/5 p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-4">AI Learning Insights</h2>
          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <p className="font-semibold text-white text-sm mb-1">Optimal Study Time</p>
              <p className="text-white/40 text-xs leading-relaxed">You are most productive between 10 AM and 12 PM. Consider scheduling difficult topics during this window.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <p className="font-semibold text-white text-sm mb-1">Skill Gap Identified</p>
              <p className="text-white/40 text-xs leading-relaxed">Your Physics progress is improving. Adding more problem-solving practice would strengthen your understanding.</p>
            </div>
            <button className="w-full py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/15 transition-colors text-sm mt-2 border border-white/5">
              View Personalized Learning Path
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
