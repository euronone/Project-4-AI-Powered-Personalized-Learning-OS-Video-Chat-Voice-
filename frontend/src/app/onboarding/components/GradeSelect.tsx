'use client'

interface GradeSelectProps {
  value: string
  onChange: (grade: string) => void
}

const grades = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
]

export default function GradeSelect({ value, onChange }: GradeSelectProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-slate-900">What grade are you in?</h2>
      <p className="text-sm text-slate-600">This helps us calibrate lesson depth and the right pace from day one.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {grades.map((grade) => (
          <button
            key={grade.value}
            onClick={() => onChange(grade.value)}
            className={`rounded-xl border p-3.5 text-center text-sm font-medium transition-all ${
              value === grade.value
                ? 'border-brand-300 bg-brand-50 text-brand-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            {grade.label}
          </button>
        ))}
      </div>
    </div>
  )
}
