"use client";

import DiagramRenderer from './DiagramRenderer'
import FormulaRenderer from './FormulaRenderer'

interface LessonContentProps {
  contentHtml: string;
  diagrams: string[];
  formulas: string[];
  keyConcepts: string[];
  summary: string;
}

export default function LessonContent({ contentHtml, diagrams, formulas, keyConcepts, summary }: LessonContentProps) {
  return (
    <div className="space-y-6">
      {/* Key concepts */}
      {keyConcepts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keyConcepts.map((concept) => (
            <span key={concept} className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full font-medium">
              {concept}
            </span>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />

      {/* Diagrams */}
      {diagrams.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Diagrams</h3>
          {diagrams.map((code, i) => (
            <DiagramRenderer key={i} mermaidCode={code} />
          ))}
        </div>
      )}

      {/* Formulas */}
      {formulas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Key Formulas</h3>
          {formulas.map((f, i) => (
            <FormulaRenderer key={i} latex={f} block />
          ))}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="glass rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
          <p className="text-white/60 leading-relaxed text-sm">{summary}</p>
        </div>
      )}
    </div>
  )
}
