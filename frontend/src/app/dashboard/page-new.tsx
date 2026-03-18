'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Clock, Flame, TrendingUp, BookOpen, ChevronRight, Star, Video, Award } from 'lucide-react';

const continueWatching = [
  { id: 'mathematics', name: 'Mathematics', chapter: 'Quadratic Equations', progress: 72, time: '2h left' },
  { id: 'physics', name: 'Physics', chapter: "Newton's Laws", progress: 45, time: '4h left' },
  { id: 'chemistry', name: 'Chemistry', chapter: 'Periodic Table', progress: 60, time: '3h left' },
  { id: 'english', name: 'English', chapter: "Shakespeare's Sonnets", progress: 85, time: '1h left' },
];

const stats = [
  { label: 'Subjects Active', val: '12', icon: BookOpen, color: 'text-primary-600' },
  { label: 'Hours This Week', val: '24.5', icon: Clock, color: 'text-blue-600' },
  { label: 'Day Streak', val: '12', icon: Flame, color: 'text-orange-600' },
  { label: 'Avg. Score', val: '92%', icon: Award, color: 'text-green-600' },
];

const trendingCourses = [
  { id: 'physics', name: 'Physics — Mechanics', rating: 4.9, students: '3.1K' },
  { id: 'mathematics', name: 'Mathematics — Calculus', rating: 4.8, students: '4.2K' },
  { id: 'chemistry', name: 'Chemistry — Organic', rating: 4.7, students: '2.8K' },
  { id: 'biology', name: 'Biology — Genetics', rating: 4.8, students: '3.5K' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Hero Section */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome back, Alex!</h1>
              <p className="text-slate-600 mt-1">Continue learning and earn your certifications</p>
            </div>
            <Link
              href="/chatbot"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              Ask AI Tutor
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <Icon className={`w-8 h-8 mb-3 ${stat.color}`} />
                <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
                <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
            <p className="text-sm text-slate-600 mt-1">Pick up where you left off</p>
          </div>
          <Link
            href="/courses"
            className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {continueWatching.map((item) => (
            <Link
              key={item.id}
              href={`/learn/${item.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all">
                <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden flex items-center justify-center group-hover:from-primary-200 group-hover:to-secondary-200 transition-colors">
                  <Play className="w-8 h-8 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-300">
                    <div className="h-full bg-primary-600" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.chapter}</p>
                  <p className="text-xs text-slate-500 mt-2">{item.time}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Courses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Trending Now
            </h2>
            <p className="text-sm text-slate-600 mt-1">Popular among learners</p>
          </div>
          <Link
            href="/courses"
            className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingCourses.map((course, i) => (
            <Link
              key={course.id}
              href={`/learn/${course.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all p-4">
                <div className="relative mb-4">
                  <div className="absolute -top-2 -left-2 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    #{i + 1}
                  </div>
                </div>
                <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{course.name}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {course.rating}
                  </div>
                  <div>{course.students} students</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
