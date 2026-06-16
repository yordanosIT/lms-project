import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectCurrentUser } from '../features/authSlice'
import { useGetStatsQuery, useGetMyCoursesQuery } from '../services/api'
import { BookOpen, Users, GraduationCap, PlusCircle, ArrowRight, Play, CheckCircle, Award } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const currentUser = useSelector(selectCurrentUser)
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery()
  const { data: myCourses, isLoading: coursesLoading } = useGetMyCoursesQuery()

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900/40 via-brand-800/10 to-transparent border border-slate-800/60 p-8 sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Welcome Back
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hello, {currentUser?.full_name || 'User'}!
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {currentUser?.role === 'instructor' 
              ? 'Manage your courses, customize lessons, and monitor enrollment statistics across the platform.'
              : 'Browse available courses, enroll in new subjects, and continue your learning path seamlessly.'}
          </p>
          
          <div className="pt-2 flex flex-wrap gap-4">
            {currentUser?.role === 'instructor' ? (
              <Link 
                to="/manage-courses" 
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/15 transition-all text-sm"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                Manage Courses
              </Link>
            ) : (
              <Link 
                to="/courses" 
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/15 transition-all text-sm"
              >
                Browse Catalog
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            )}
          </div>
        </div>
        
        {/* Abstract background glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl -z-1 pointer-events-none"></div>
      </div>

      {/* Statistics Cards - Different for Instructor vs Student */}
      {currentUser?.role === 'instructor' ? (
        // Instructor Statistics
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stat 1: Total Courses */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-inner">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">My Courses</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {statsLoading ? (
                  <span className="block h-8 w-12 animate-pulse bg-slate-800 rounded"></span>
                ) : (
                  stats?.total_courses || 0
                )}
              </h3>
            </div>
          </div>

          {/* Stat 2: Total Students */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Enrolled Students</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {statsLoading ? (
                  <span className="block h-8 w-12 animate-pulse bg-slate-800 rounded"></span>
                ) : (
                  stats?.total_students || 0
                )}
              </h3>
            </div>
          </div>

          {/* Stat 3: Total Lessons */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Total Lessons</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {statsLoading ? (
                  <span className="block h-8 w-12 animate-pulse bg-slate-800 rounded"></span>
                ) : (
                  stats?.total_lessons || 0
                )}
              </h3>
            </div>
          </div>
        </div>
      ) : (
        // Student Statistics
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stat 1: Enrolled Courses */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Enrolled Courses</p>
                <h3 className="text-2xl font-bold text-white">
                  {statsLoading ? <div className="h-6 w-12 animate-pulse bg-slate-700 rounded"></div> : stats?.enrolled_courses || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Stat 2: Completed */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <h3 className="text-2xl font-bold text-white">
                  {statsLoading ? <div className="h-6 w-12 animate-pulse bg-slate-700 rounded"></div> : stats?.completed_courses || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Stat 3: In Progress */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Play className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">In Progress</p>
                <h3 className="text-2xl font-bold text-white">
                  {statsLoading ? <div className="h-6 w-12 animate-pulse bg-slate-700 rounded"></div> : stats?.in_progress || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Stat 4: Certificates */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Certificates</p>
                <h3 className="text-2xl font-bold text-white">
                  {statsLoading ? <div className="h-6 w-12 animate-pulse bg-slate-700 rounded"></div> : stats?.completed_courses || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary User Dashboard Lists */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="h-5.5 w-5.5 text-brand-400" />
              {currentUser?.role === 'instructor' ? 'My Courses Portfolio' : 'My Active Enrollments'}
            </h3>
            
            <Link 
              to={currentUser?.role === 'instructor' ? '/manage-courses' : '/my-courses'} 
              className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 bg-slate-900/40 border border-slate-800 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : !myCourses || myCourses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
              <p className="text-slate-400 text-sm mb-4">
                {currentUser?.role === 'instructor' 
                  ? "You haven't created any courses yet." 
                  : "You haven't enrolled in any courses yet."}
              </p>
              <Link 
                to={currentUser?.role === 'instructor' ? '/manage-courses' : '/courses'} 
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 text-sm transition-colors"
              >
                {currentUser?.role === 'instructor' ? 'Create a Course' : 'Find a Course'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.slice(0, 3).map((course) => (
                <div 
                  key={course.id} 
                  className="group relative bg-slate-900/50 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-200"
                >
                  <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-850 text-slate-500">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/90 text-brand-400 border border-slate-800 backdrop-blur-sm">
                      {course.category_name || 'Uncategorized'}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                      <span className="text-xs text-slate-400">
                        {course.lessons_count || 0} Lessons
                      </span>
                      
                      {currentUser?.role === 'student' ? (
                        <Link 
                          to={`/courses/${course.id}/learn`} 
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-brand-600/10 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/20 hover:border-transparent transition-colors"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Learn
                        </Link>
                      ) : (
                        <Link 
                          to={`/manage-courses/${course.id}/lessons`} 
                          className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          Manage Lessons
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}