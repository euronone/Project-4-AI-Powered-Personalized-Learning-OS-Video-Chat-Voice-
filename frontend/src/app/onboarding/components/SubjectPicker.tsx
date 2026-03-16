'use client'

interface SubjectPickerProps {
  selected: string[]
  onChange: (subjects: string[]) => void
}

const availableSubjects = [
  { name: 'Mathematics', icon: '📐', color: 'bg-indigo-50 border-indigo-200' },
  { name: 'Physics', icon: '⚡', color: 'bg-blue-50 border-blue-200' },
  { name: 'Chemistry', icon: '🧪', color: 'bg-green-50 border-green-200' },
  { name: 'Biology', icon: '🧬', color: 'bg-emerald-50 border-emerald-200' },
  { name: 'English', icon: '📖', color: 'bg-pink-50 border-pink-200' },
  { name: 'Computer Science', icon: '💻', color: 'bg-purple-50 border-purple-200' },
  { name: 'History', icon: '🏛️', color: 'bg-amber-50 border-amber-200' },
  { name: 'Geography', icon: '🌍', color: 'bg-teal-50 border-teal-200' },
  { name: 'Economics', icon: '📊', color: 'bg-violet-50 border-violet-200' },
  { name: 'Hindi', icon: '🔤', color: 'bg-red-50 border-red-200' },
  { name: 'Environmental Science', icon: '🌿', color: 'bg-lime-50 border-lime-200' },
  { name: 'Art & Design', icon: '🎨', color: 'bg-fuchsia-50 border-fuchsia-200' },
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Choose your subjects</h2>
      <p className="text-white/40 text-sm">Select the subjects you want to study. You can change these later.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {availableSubjects.map((subject) => (
          <button
            key={subject.name}
            onClick={() => toggle(subject.name)}
            className={`p-4 rounded-lg border text-left transition-all ${
              selected.includes(subject.name)
                ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                : 'border-white/5 hover:border-white/10 bg-dark-50'
            }`}
          >
            <span className="text-2xl">{subject.icon}</span>
            <p className="mt-2 font-medium text-sm text-white/70">{subject.name}</p>
          </button>
        ))}
      </div>
      <p className="text-sm text-white/20">{selected.length} selected</p>
    </div>
  )
}
