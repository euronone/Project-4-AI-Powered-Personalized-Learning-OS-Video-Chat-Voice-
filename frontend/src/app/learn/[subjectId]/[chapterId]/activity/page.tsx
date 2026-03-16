"use client";

import Link from 'next/link'
import ActivityPanel from '../../../components/ActivityPanel'

export default function ActivityPage({
  params,
}: {
  params: { subjectId: string; chapterId: string };
}) {
  return (
      <main className="min-h-screen bg-dark px-6 md:px-10 pt-20 pb-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/learn/${params.subjectId}/${params.chapterId}`}
            className="text-sm text-accent hover:text-accent-hover mb-4 inline-block"
          >
            &larr; Back to Lesson
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">Chapter {params.chapterId} Activity</h1>
          <p className="text-white/40 text-sm mb-6">Test your understanding of the concepts covered in this chapter.</p>

          <ActivityPanel chapterId={params.chapterId} />
        </div>
      </main>
  );
}
