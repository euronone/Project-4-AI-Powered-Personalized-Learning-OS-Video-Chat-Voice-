"use client";

import { useEffect, useRef, useState } from 'react'

interface DiagramRendererProps {
  mermaidCode: string;
}

export default function DiagramRenderer({ mermaidCode }: DiagramRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, theme: 'dark' })

        if (!containerRef.current || cancelled) return

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
        const { svg } = await mermaid.render(id, mermaidCode)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError('Failed to render diagram')
      }
    }

    render()
    return () => { cancelled = true }
  }, [mermaidCode])

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-400 mb-2">{error}</p>
        <pre className="text-xs text-white/40 overflow-x-auto">{mermaidCode}</pre>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="my-4 flex justify-center rounded-lg border border-white/5 bg-dark-50 p-4 overflow-x-auto" />
  )
}
