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
      <h2 className="text-xl font-semibold text-white">What grade are you in?</h2>
      <p className="text-sm text-slate-400">This helps us calibrate lesson depth and the right pace from day one.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {grades.map((grade) => (
          <button
            key={grade.value}
            onClick={() => onChange(grade.value)}
            className={`rounded-xl border p-3.5 text-center text-sm font-medium transition-all ${
              value === grade.value
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm'
                : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {grade.label}
          </button>
        ))}
      </div>
    </div>
  )
}
