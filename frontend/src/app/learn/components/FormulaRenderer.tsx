"use client";

import { useEffect, useRef } from 'react'

interface FormulaRendererProps {
  latex: string;
  block?: boolean;
}

export default function FormulaRenderer({ latex, block = false }: FormulaRendererProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    async function render() {
      try {
        const katex = (await import('katex')).default
        if (ref.current) {
          katex.render(latex, ref.current, {
            throwOnError: false,
            displayMode: block,
          })
        }
      } catch {
        if (ref.current) ref.current.textContent = latex
      }
    }
    render()
  }, [latex, block])

  return (
    <span
      ref={ref}
      className={block ? "block my-4 text-center overflow-x-auto" : "inline"}
    />
  )
}
