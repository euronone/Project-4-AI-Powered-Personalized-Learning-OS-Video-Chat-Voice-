'use client'

interface BackgroundFormProps {
  value: string
  onChange: (background: string) => void
}

export default function BackgroundForm({ value, onChange }: BackgroundFormProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Tell us about yourself</h2>
      <p className="text-sm text-slate-400">
        Share your learning background so the AI tutor can personalize explanations for you.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., I enjoy science experiments, I struggle with algebra, I learn best through visuals..."
        rows={5}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10"
      />
      <div className="flex flex-wrap gap-2">
        {['Visual learner', 'Hands-on learner', 'Need extra practice', 'Fast-paced preferred'].map((tag) => (
          <button
            key={tag}
            onClick={() => onChange(value ? `${value}, ${tag.toLowerCase()}` : tag.toLowerCase())}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
