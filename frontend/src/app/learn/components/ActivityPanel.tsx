"use client";

import { useState } from 'react'
import { Send, CheckCircle, Loader2 } from 'lucide-react'
import { API_URL } from '@/lib/constants'

interface Evaluation {
  score: number;
  feedback: string;
}

export default function ActivityPanel({ chapterId }: { chapterId: string }) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/activities/${chapterId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: answer }),
      })
      if (res.ok) {
        const data = await res.json()
        setEvaluation(data)
      }
    } catch {
      // Fallback evaluation for demo
      setEvaluation({ score: 75, feedback: 'Good attempt! Review the key concepts and try elaborating on your explanation.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Chapter Activity</h3>
      <p className="text-sm text-white/40">Answer the question below to test your understanding of this chapter.</p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={5}
        className="w-full bg-dark-50 border border-white/5 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={submitting || !answer.trim()}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? 'Evaluating...' : 'Submit'}
      </button>

      {evaluation && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-green-300">Score: {evaluation.score}%</span>
          </div>
          <p className="text-sm text-green-400/80">{evaluation.feedback}</p>
        </div>
      )}
    </div>
  )
}
