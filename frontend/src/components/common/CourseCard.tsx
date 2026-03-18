import Link from 'next/link'

interface CourseCardProps {
  title: string
  description?: string
  instructor?: string
  category?: string
  level?: string
  progress?: number
  imageClass: string
  href?: string
  buttonText?: string
}

export default function CourseCard({ 
  title, 
  description, 
  instructor,
  category, 
  level, 
  progress, 
  imageClass,
  href = '/courses',
  buttonText = 'Start Course'
}: CourseCardProps) {
  return (
    <div className="bg-[#0f1629] rounded-2xl shadow-sm border border-white/[0.06] overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className={`h-40 ${imageClass}`} />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          {category && <p className="text-xs font-semibold tracking-wide uppercase text-blue-400">{category}</p>}
          {level && <span className="text-xs font-medium bg-white/[0.06] text-slate-400 px-2 py-1 rounded-full">{level}</span>}
        </div>
        
        <h3 className="text-lg font-bold text-slate-100 mb-1">{title}</h3>
        {instructor && <p className="text-sm text-slate-500 mb-2">by {instructor}</p>}
        
        {description && <p className="text-sm text-slate-400 mb-4 flex-grow">{description}</p>}
        
        {progress !== undefined && (
          <div className="space-y-2 mb-4 mt-auto">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Progress</span>
              <span className="font-medium text-slate-200">{progress}%</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Link href={href} className="mt-auto block">
          <button className="w-full py-2.5 px-4 bg-blue-600/10 text-blue-400 font-medium rounded-xl hover:bg-blue-600/20 transition-colors text-center">
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  )
}
