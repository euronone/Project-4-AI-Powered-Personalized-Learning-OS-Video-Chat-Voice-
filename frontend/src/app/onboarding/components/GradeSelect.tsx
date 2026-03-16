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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">What grade are you in?</h2>
      <p className="text-white/40 text-sm">This helps us tailor content to your level.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {grades.map((grade) => (
          <button
            key={grade.value}
            onClick={() => onChange(grade.value)}
            className={`p-3.5 rounded-lg border text-center text-sm font-medium transition-all ${
              value === grade.value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-white/5 hover:border-white/10 text-white/50 bg-dark-50'
            }`}
          >
            {grade.label}
          </button>
        ))}
      </div>
    </div>
  )
}
