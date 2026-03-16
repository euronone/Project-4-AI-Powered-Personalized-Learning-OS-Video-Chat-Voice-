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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className={`h-40 ${imageClass}`} />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          {category && <p className="text-xs font-semibold tracking-wide uppercase text-indigo-600">{category}</p>}
          {level && <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{level}</span>}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        {instructor && <p className="text-sm text-gray-500 mb-2">by {instructor}</p>}
        
        {description && <p className="text-sm text-gray-600 mb-4 flex-grow">{description}</p>}
        
        {progress !== undefined && (
          <div className="space-y-2 mb-4 mt-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Link href={href} className="mt-auto block">
          <button className="w-full py-2.5 px-4 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors text-center">
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  )
}
