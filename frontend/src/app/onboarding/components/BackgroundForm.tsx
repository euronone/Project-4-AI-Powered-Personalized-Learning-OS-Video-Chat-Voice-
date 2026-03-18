'use client'

interface BackgroundFormProps {
  value: string
  onChange: (background: string) => void
}

export default function BackgroundForm({ value, onChange }: BackgroundFormProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-slate-900">Tell us about yourself</h2>
      <p className="text-sm text-slate-600">
        Share your learning background so the AI tutor can personalize explanations for you.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., I enjoy science experiments, I struggle with algebra, I learn best through visuals..."
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
      />
      <div className="flex flex-wrap gap-2">
        {['Visual learner', 'Hands-on learner', 'Need extra practice', 'Fast-paced preferred'].map((tag) => (
          <button
            key={tag}
            onClick={() => onChange(value ? `${value}, ${tag.toLowerCase()}` : tag.toLowerCase())}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
