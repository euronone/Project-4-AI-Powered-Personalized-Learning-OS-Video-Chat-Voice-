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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Upload your marksheet (optional)</h2>
      <p className="text-white/40 text-sm">
        Upload your latest marksheet so we can better understand your strengths and areas to improve.
      </p>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="mt-4 border-2 border-dashed border-white/10 rounded-lg p-12 text-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-colors"
        >
          <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-white/50">Click to upload or drag & drop</p>
          <p className="text-xs text-white/20 mt-1">PDF, JPG, or PNG (max 10MB)</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <FileText className="w-8 h-8 text-green-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-300 truncate">{file.name}</p>
            <p className="text-xs text-green-400/60">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={() => onChange(null)}
            className="p-1 text-green-400 hover:text-accent transition-colors"
          >
            <X className="w-5 h-5" />
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
