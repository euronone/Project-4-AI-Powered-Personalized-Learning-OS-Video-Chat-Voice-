import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColorClass: string
  iconBgClass: string
}

export default function StatCard({ title, value, icon: Icon, iconColorClass, iconBgClass }: StatCardProps) {
  return (
    <div className="bg-[#0f1629] p-6 rounded-2xl shadow-sm border border-white/[0.06] hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className={`w-12 h-12 ${iconBgClass} ${iconColorClass} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}
