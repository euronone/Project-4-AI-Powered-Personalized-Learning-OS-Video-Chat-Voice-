"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LessonContent from '../../components/LessonContent'
import VoiceChat from '../../components/VoiceChat'
import VideoFeed from '../../components/VideoFeed'
import { apiGet } from '@/lib/api'

interface ChapterContent {
  text?: string;
  diagrams?: string[];
  formulas?: string[];
  key_concepts?: string[];
  summary?: string;
  title?: string;
}

export default function LessonPage({
  params,
}: {
  params: { subjectId: string; chapterId: string };
}) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [content, setContent] = useState<ChapterContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [chapterTitle, setChapterTitle] = useState('')

  useEffect(() => {
    // Fetch chapter metadata for the title
    apiGet<{ title: string }>(`/api/curriculum/${params.subjectId}/chapters/${params.chapterId}`)
      .then((data) => setChapterTitle(data.title))
      .catch(() => {})

    apiGet<ChapterContent>(`/api/lessons/${params.chapterId}/content`)
      .then((data) => setContent(data))
      .catch(() => setError('Failed to load lesson content. Please try again.'))
      .finally(() => setLoading(false))
  }, [params.chapterId, params.subjectId])

  const lesson = {
    title: chapterTitle || content?.title || 'Loading…',
    contentHtml: content?.text ? `<p>${content.text.replace(/\n/g, '</p><p>')}</p>` : '',
    diagrams: content?.diagrams || [],
    formulas: content?.formulas || [],
    keyConcepts: content?.key_concepts || [],
    summary: content?.summary || '',
  }

  return (
    <main className="min-h-screen bg-dark pt-20">
      <div className="border-b border-white/5 bg-dark-100/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/learn/${params.subjectId}`} className="text-sm text-accent hover:text-accent-hover">&larr; Back</Link>
          <h1 className="text-lg font-semibold text-white">{lesson.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-sm px-3 py-1.5 border border-white/5 rounded-lg text-white/40 hover:bg-white/5 transition-colors"
          >
            {showSidebar ? 'Hide' : 'Show'} Sidebar
          </button>
          <Link
            href={`/learn/${params.subjectId}/${params.chapterId}/activity`}
            className="text-sm px-4 py-1.5 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            Activity &rarr;
          </Link>
        </div>
      </div>

      <div className="flex">
        <div className={`flex-1 p-6 md:p-10 ${showSidebar ? 'max-w-3xl' : 'max-w-4xl mx-auto'}`}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-white/50 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm">Generating lesson content with AI…</p>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
          {!loading && !error && <LessonContent {...lesson} />}
        </div>

        {showSidebar && (
          <aside className="w-80 border-l border-white/5 bg-dark-100/60 p-4 space-y-4 hidden lg:block">
            <VideoFeed />
            <VoiceChat />
          </aside>
        )}
      </div>
    </main>
  );
}
