"use client";

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DiagramRenderer from './DiagramRenderer'
import FormulaRenderer from './FormulaRenderer'

interface LessonContentProps {
  title?: string;
  contentHtml: string;
  diagrams: string[];
  formulas: string[];
  keyConcepts: string[];
  summary: string;
}

export default function LessonContent({ title, contentHtml, diagrams, formulas, keyConcepts, summary }: LessonContentProps) {
  // contentHtml is actually raw markdown text from the API
  const markdownText = contentHtml
    .replace(/<\/p><p>/g, '\n\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '')

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Key Concepts Pills */}
      {keyConcepts.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Key Concepts</p>
          <div className="flex flex-wrap gap-2">
            {keyConcepts.map((concept) => (
              <span
                key={concept}
                className="px-3 py-1 bg-accent/15 border border-accent/25 text-accent-light text-xs rounded-full font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Notes Content */}
      {markdownText && (
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-8 shadow-xl">
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3
            prose-h2:text-xl prose-h2:mt-8 prose-h2:text-accent-light
            prose-h3:text-base prose-h3:text-white/80 prose-h3:font-semibold
            prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-sm
            prose-strong:text-white prose-strong:font-semibold
            prose-em:text-white/60
            prose-ul:text-white/70 prose-ul:text-sm
            prose-ol:text-white/70 prose-ol:text-sm
            prose-li:my-1
            prose-code:text-neon-green prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl
            prose-blockquote:border-l-accent prose-blockquote:text-white/50 prose-blockquote:bg-accent/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1
            prose-hr:border-white/10
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownText}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Diagrams */}
      {diagrams.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Diagrams</p>
          {diagrams.map((code, i) => (
            <DiagramRenderer key={i} mermaidCode={code} />
          ))}
        </div>
      )}

      {/* Formulas */}
      {formulas.length > 0 && (
        <div className="bg-[#111827] border border-accent/20 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-light">Key Formulas</p>
          {formulas.map((f, i) => (
            <FormulaRenderer key={i} latex={f} block />
          ))}
        </div>
      )}

      {/* Summary Card */}
      {summary && (
        <div className="relative rounded-2xl border border-neon-purple/20 bg-neon-purple/5 p-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple rounded-l-2xl" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neon-purple mb-3">Summary</p>
          <p className="text-white/70 leading-relaxed text-sm">{summary}</p>
        </div>
      )}
    </div>
  )
}
