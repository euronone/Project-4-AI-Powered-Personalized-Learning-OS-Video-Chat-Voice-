'use client'

interface BackgroundFormProps {
  value: string
  onChange: (background: string) => void
}

export default function BackgroundForm({ value, onChange }: BackgroundFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Tell us about yourself</h2>
      <p className="text-white/40 text-sm">
        Share your learning background so the AI tutor can personalize explanations for you.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., I enjoy science experiments, I struggle with algebra, I learn best through visuals..."
        rows={5}
        className="w-full px-4 py-3 bg-dark-50 border border-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-white placeholder:text-white/20 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        {['Visual learner', 'Hands-on learner', 'Need extra practice', 'Fast-paced preferred'].map((tag) => (
          <button
            key={tag}
            onClick={() => onChange(value ? `${value}, ${tag.toLowerCase()}` : tag.toLowerCase())}
            className="px-3 py-1.5 text-xs font-medium bg-white/5 text-white/40 rounded-full hover:bg-accent/10 hover:text-accent transition-colors border border-white/5"
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
