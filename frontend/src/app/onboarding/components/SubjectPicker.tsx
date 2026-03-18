'use client'

interface SubjectPickerProps {
  selected: string[]
  onChange: (subjects: string[]) => void
}

const availableSubjects = [
  { name: 'Mathematics', icon: '📐' },
  { name: 'Physics', icon: '⚡' },
  { name: 'Chemistry', icon: '🧪' },
  { name: 'Biology', icon: '🧬' },
  { name: 'English', icon: '📖' },
  { name: 'Computer Science', icon: '💻' },
  { name: 'History', icon: '🏛️' },
  { name: 'Geography', icon: '🌍' },
  { name: 'Economics', icon: '📊' },
  { name: 'Hindi', icon: '🔤' },
  { name: 'Environmental Science', icon: '🌿' },
  { name: 'Art & Design', icon: '🎨' },
]

export default function SubjectPicker({ selected, onChange }: SubjectPickerProps) {
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name))
    } else {
      onChange([...selected, name])
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Choose your subjects</h2>
      <p className="text-sm text-slate-400">Pick your focus areas. You can adjust these later as goals evolve.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {availableSubjects.map((subject) => (
          <button
            key={subject.name}
            onClick={() => toggle(subject.name)}
            className={`rounded-xl border p-4 text-left transition-all ${
              selected.includes(subject.name)
                ? 'border-blue-500/30 bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20'
                : 'border-white/10 bg-white/[0.04] hover:border-white/20'
            }`}
          >
            <span className="text-2xl">{subject.icon}</span>
            <p className="mt-2 text-sm font-medium text-slate-300">{subject.name}</p>
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500">{selected.length} selected</p>
    </div>
  )
}
