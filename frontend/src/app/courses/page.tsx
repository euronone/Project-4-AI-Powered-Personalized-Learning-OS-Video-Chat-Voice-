'use client'

import { useState } from 'react'
import { Search, Filter, Play, Star, Clock, Users } from 'lucide-react'
import Link from 'next/link'

const courses = [
  {
    id: 1,
    title: 'Mathematics — Algebra & Calculus',
    category: 'Mathematics',
    level: 'Intermediate',
    duration: '16 weeks',
    rating: 4.9,
    students: 4200,
    image: 'from-red-600 to-orange-500',
    progress: 72
  },
  {
    id: 2,
    title: 'Physics — Mechanics & Thermodynamics',
    category: 'Science',
    level: 'Intermediate',
    duration: '14 weeks',
    rating: 4.8,
    students: 3100,
    image: 'from-blue-600 to-cyan-400',
    progress: 45
  },
  {
    id: 3,
    title: 'Chemistry — Organic & Inorganic',
    category: 'Science',
    level: 'Intermediate',
    duration: '14 weeks',
    rating: 4.7,
    students: 2800,
    image: 'from-green-500 to-emerald-400',
    progress: 60
  },
  {
    id: 4,
    title: 'Biology — Cell Biology & Genetics',
    category: 'Science',
    level: 'Beginner',
    duration: '12 weeks',
    rating: 4.8,
    students: 3500,
    image: 'from-orange-500 to-amber-400',
    progress: 33
  },
  {
    id: 5,
    title: 'English — Literature & Composition',
    category: 'Language Arts',
    level: 'Intermediate',
    duration: '16 weeks',
    rating: 4.9,
    students: 5600,
    image: 'from-pink-500 to-rose-400',
    progress: 85
  },
  {
    id: 6,
    title: 'Computer Science — Programming Fundamentals',
    category: 'Computer Science',
    level: 'Beginner',
    duration: '10 weeks',
    rating: 4.8,
    students: 6200,
    image: 'from-indigo-500 to-purple-500',
    progress: 20
  },
  {
    id: 7,
    title: 'History — World Civilizations',
    category: 'Social Studies',
    level: 'Beginner',
    duration: '12 weeks',
    rating: 4.6,
    students: 2400,
    image: 'from-amber-600 to-orange-500',
    progress: 55
  },
  {
    id: 8,
    title: 'Geography — Physical & Human',
    category: 'Social Studies',
    level: 'Beginner',
    duration: '10 weeks',
    rating: 4.7,
    students: 1900,
    image: 'from-teal-500 to-cyan-400',
    progress: 40
  },
  {
    id: 9,
    title: 'Economics — Micro & Macroeconomics',
    category: 'Social Studies',
    level: 'Intermediate',
    duration: '12 weeks',
    rating: 4.5,
    students: 1500,
    image: 'from-violet-600 to-purple-500',
    progress: 28
  },
  {
    id: 10,
    title: 'Hindi — Literature & Grammar',
    category: 'Language Arts',
    level: 'Intermediate',
    duration: '14 weeks',
    rating: 4.7,
    students: 3800,
    image: 'from-red-500 to-pink-500',
    progress: 68
  },
  {
    id: 11,
    title: 'Environmental Science — Ecology & Conservation',
    category: 'Science',
    level: 'Beginner',
    duration: '8 weeks',
    rating: 4.6,
    students: 2200,
    image: 'from-lime-500 to-green-500',
    progress: 50
  },
  {
    id: 12,
    title: 'Art & Design — Visual Arts Foundations',
    category: 'Creative Arts',
    level: 'Beginner',
    duration: '8 weeks',
    rating: 4.8,
    students: 1700,
    image: 'from-fuchsia-500 to-purple-500',
    progress: 15
  },
  {
    id: 13,
    title: 'Physical Education & Health',
    category: 'Health & PE',
    level: 'Beginner',
    duration: '10 weeks',
    rating: 4.4,
    students: 2900,
    image: 'from-sky-500 to-blue-500',
    progress: 0
  },
  {
    id: 14,
    title: 'Civics & Government',
    category: 'Social Studies',
    level: 'Beginner',
    duration: '10 weeks',
    rating: 4.5,
    students: 1300,
    image: 'from-slate-500 to-zinc-500',
    progress: 0
  }
]

const categories = ['All', 'Mathematics', 'Science', 'Language Arts', 'Computer Science', 'Social Studies', 'Creative Arts', 'Health & PE']

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-dark p-8 px-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Courses</h1>
          <p className="text-white/40 mt-1 text-sm">Discover and continue your learning journey</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-100 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-white text-sm placeholder:text-white/30"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-100 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-dark-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories — pill style */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-white text-dark'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Course Grid — Udemy/Netflix hybrid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredCourses.map((course) => (
          <Link key={course.id} href={`/learn/${course.category.toLowerCase().replace(/ /g, '-')}`}>
            <div className="card-hover rounded-lg overflow-hidden bg-dark-100 border border-white/5 group cursor-pointer">
              <div className={`h-[130px] bg-gradient-to-br ${course.image} relative`}>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
                    <Play className="w-4 h-4 text-dark fill-current ml-0.5" />
                  </div>
                </div>
                {/* Level badge */}
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                  {course.level}
                </span>
                {/* Progress bar */}
                {course.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
                    <div className="h-full bg-accent" style={{ width: `${course.progress}%` }} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-[13px] font-semibold text-white leading-tight line-clamp-2 mb-2">{course.title}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{course.rating}</span>
                  <span>•</span>
                  <Users className="w-3 h-3" />
                  <span>{(course.students / 1000).toFixed(1)}K</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{course.duration}</span>
                </div>
                {course.progress > 0 && (
                  <p className="text-[11px] text-accent font-semibold mt-2">{course.progress}% complete</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/30">No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
