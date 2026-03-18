'use client'

import { useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface MarksheetUploadProps {
  file: File | null
  onChange: (file: File | null) => void
}

export default function MarksheetUpload({ file, onChange }: MarksheetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (selected.size > maxSize) {
        alert('File size must be under 10MB')
        return
      }
      onChange(selected)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Upload your marksheet (optional)</h2>
      <p className="text-sm text-slate-400">
        Upload your latest marksheet so we can better understand your strengths and areas to improve.
      </p>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="mt-4 cursor-pointer rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] p-12 text-center transition-colors hover:border-blue-500/30 hover:bg-blue-500/5"
        >
          <Upload className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <p className="text-sm font-medium text-slate-300">Click to upload or drag and drop</p>
          <p className="mt-1 text-xs text-slate-500">PDF, JPG, or PNG (max 10MB)</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-900/20 p-4">
          <FileText className="h-8 w-8 text-emerald-400" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-emerald-300">{file.name}</p>
            <p className="text-xs text-emerald-400/70">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={() => onChange(null)}
            className="p-1 text-emerald-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
