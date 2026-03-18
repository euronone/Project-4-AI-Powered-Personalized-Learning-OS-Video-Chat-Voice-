/** Subject → gradient + icon map for the dark-blue theme */
export const subjectTheme: Record<string, { gradient: string; icon: string }> = {
  math:          { gradient: 'from-blue-600/20  via-indigo-500/10 to-transparent', icon: '📐' },
  mathematics:   { gradient: 'from-blue-600/20  via-indigo-500/10 to-transparent', icon: '📐' },
  physics:       { gradient: 'from-violet-600/20 via-purple-500/10 to-transparent', icon: '⚛️' },
  chemistry:     { gradient: 'from-emerald-600/20 via-teal-500/10 to-transparent', icon: '🧪' },
  biology:       { gradient: 'from-green-600/20 via-lime-500/10   to-transparent', icon: '🧬' },
  english:       { gradient: 'from-amber-600/20 via-orange-500/10 to-transparent', icon: '📖' },
  cs:            { gradient: 'from-cyan-600/20  via-sky-500/10    to-transparent', icon: '💻' },
  history:       { gradient: 'from-rose-600/20  via-pink-500/10   to-transparent', icon: '🏛️' },
  geography:     { gradient: 'from-teal-600/20  via-cyan-500/10   to-transparent', icon: '🌍' },
  economics:     { gradient: 'from-yellow-600/20 via-amber-500/10 to-transparent', icon: '📊' },
  hindi:         { gradient: 'from-orange-600/20 via-red-500/10   to-transparent', icon: '🔤' },
  environmental: { gradient: 'from-lime-600/20  via-green-500/10  to-transparent', icon: '🌿' },
  art:           { gradient: 'from-fuchsia-600/20 via-pink-500/10 to-transparent', icon: '🎨' },
  civics:        { gradient: 'from-sky-600/20   via-blue-500/10   to-transparent', icon: '⚖️' },
  pe:            { gradient: 'from-red-600/20   via-orange-500/10 to-transparent', icon: '🏃' },
}

const fallback = { gradient: 'from-blue-600/20 via-indigo-500/10 to-transparent', icon: '📚' }

export function getSubjectTheme(slug: string) {
  return subjectTheme[slug.toLowerCase()] ?? fallback
}
