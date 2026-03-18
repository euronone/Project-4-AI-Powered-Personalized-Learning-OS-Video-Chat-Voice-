'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Star, Users, Clock3, SlidersHorizontal } from 'lucide-react'
import SubjectVisual from '@/components/common/SubjectVisual'

const courses = [
  { id: 1, slug: 'mathematics', title: 'Mathematics — Algebra & Calculus', category: 'Mathematics', level: 'Intermediate', duration: '16 weeks', rating: 4.9, students: 4200, progress: 72 },
  { id: 2, slug: 'physics', title: 'Physics — Mechanics & Thermodynamics', category: 'Science', level: 'Intermediate', duration: '14 weeks', rating: 4.8, students: 3100, progress: 45 },
  { id: 3, slug: 'chemistry', title: 'Chemistry — Organic & Inorganic', category: 'Science', level: 'Intermediate', duration: '14 weeks', rating: 4.7, students: 2800, progress: 60 },
  { id: 4, slug: 'biology', title: 'Biology — Cell Biology & Genetics', category: 'Science', level: 'Beginner', duration: '12 weeks', rating: 4.8, students: 3500, progress: 33 },
  { id: 5, slug: 'english', title: 'English — Literature & Composition', category: 'Language Arts', level: 'Intermediate', duration: '16 weeks', rating: 4.9, students: 5600, progress: 85 },
  { id: 6, slug: 'cs', title: 'Computer Science — Programming Fundamentals', category: 'Computer Science', level: 'Beginner', duration: '10 weeks', rating: 4.8, students: 6200, progress: 20 },
  { id: 7, slug: 'history', title: 'History — World Civilizations', category: 'Social Studies', level: 'Beginner', duration: '12 weeks', rating: 4.6, students: 2400, progress: 55 },
  { id: 8, slug: 'geography', title: 'Geography — Physical & Human', category: 'Social Studies', level: 'Beginner', duration: '10 weeks', rating: 4.7, students: 1900, progress: 40 },
  { id: 9, slug: 'economics', title: 'Economics — Micro & Macroeconomics', category: 'Social Studies', level: 'Intermediate', duration: '12 weeks', rating: 4.5, students: 1500, progress: 28 },
  { id: 10, slug: 'hindi', title: 'Hindi — Literature & Grammar', category: 'Language Arts', level: 'Intermediate', duration: '14 weeks', rating: 4.7, students: 3800, progress: 68 },
  { id: 11, slug: 'environmental', title: 'Environmental Science — Ecology & Conservation', category: 'Science', level: 'Beginner', duration: '8 weeks', rating: 4.6, students: 2200, progress: 50 },
  { id: 12, slug: 'art', title: 'Art & Design — Visual Arts Foundations', category: 'Creative Arts', level: 'Beginner', duration: '8 weeks', rating: 4.8, students: 1700, progress: 15 },
]

const categories = ['All', 'Mathematics', 'Science', 'Language Arts', 'Computer Science', 'Social Studies', 'Creative Arts']

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="app-shell space-y-6">
      <section className="surface-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="display-title text-2xl font-semibold tracking-tight text-white md:text-3xl">Course Library</h1>
            <p className="mt-1 text-sm text-slate-500">Structured paths designed for focused, measurable progress.</p>
          </div>

          <div className="flex w-full gap-3 lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none ring-0 transition-all placeholder:text-slate-600 focus:border-blue-500/40 focus:shadow-sm"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-400 hover:bg-white/[0.08]">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? 'rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white'
                  : 'subtle-chip px-3.5 py-1.5 text-xs font-semibold hover:bg-white/[0.08]'
              }
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => (
          <Link key={course.id} href={`/learn/${course.slug}`} className="card-hover overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]">
            <div className="relative">
              <SubjectVisual subject={course.slug} className="h-40 w-full" />
              <span className="absolute right-3 top-3 rounded-full bg-[#0f1629]/90 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                {course.level}
              </span>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-base font-semibold text-white">{course.title}</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{course.category}</p>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {course.rating}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {(course.students / 1000).toFixed(1)}K
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {course.duration}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${course.progress}%` }} />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-400">{course.progress}% completed</p>
            </div>
          </Link>
        ))}
      </section>

      {filteredCourses.length === 0 && (
        <section className="surface-card p-10 text-center">
          <p className="text-sm text-slate-500">No courses match your current search and category filters.</p>
        </section>
      )}
    </div>
  )
}
