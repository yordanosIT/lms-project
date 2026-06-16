import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../features/authSlice'
import { 
  useGetCourseQuery, 
  useGetLessonsQuery, 
  useEnrollMutation 
} from '../services/api'
import { 
  BookOpen, 
  User, 
  Calendar, 
  CheckCircle, 
  Lock, 
  AlertCircle, 
  Play, 
  ChevronRight, 
  Settings 
} from 'lucide-react'
import { LoadingScreen } from '../App'

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  const { data: course, isLoading: courseLoading, error: courseError } = useGetCourseQuery(courseId)
  const { data: lessons, isLoading: lessonsLoading } = useGetLessonsQuery({ course_id: courseId })
  const [enroll, { isLoading: enrolling }] = useEnrollMutation()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (courseLoading) return <LoadingScreen />

  if (courseError || !course) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-5 text-rose-400">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <p>Failed to load course details. The course may have been removed.</p>
      </div>
    )
  }

  const handleEnroll = async () => {
    setErrorMsg(null)
    try {
      await enroll({ course: courseId }).unwrap()
      // Enrolling will invalidate the Course lists tags, updating course.is_enrolled to true
    } catch (err: any) {
      console.error('Enrollment error:', err)
      setErrorMsg(err.data?.detail || 'Failed to enroll in the course. Please try again.')
    }
  }

  const isOwner = currentUser?.role === 'instructor' && course.instructor.id === currentUser.id

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Course Info (Left Columns) */}
      <div className="lg:col-span-2 space-y-8">
        {/* Banner Card */}
<div className="relative aspect-video w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
  {course.image_url ? (
    <img src={course.image_url || ''} alt={course.title} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
      <BookOpen className="h-20 w-20" />
    </div>
  )}
  <span className="absolute top-4 left-4 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-slate-900/90 text-brand-400 border border-slate-800 backdrop-blur-sm">
    {course.category_name}
  </span>
</div>

        {/* Course Details Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{course.title}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-slate-350">{course.instructor.full_name} (Instructor)</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Created on {new Date(course.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-850">
            <h3 className="text-lg font-bold text-white mb-2.5">About this Course</h3>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {course.description}
            </p>
          </div>
        </div>

        {/* Lessons List Outline */}
        <div className="pt-4 space-y-4">
          <h3 className="text-lg font-bold text-white">Syllabus ({lessons?.length || 0} Lessons)</h3>
          
          {lessonsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-slate-900/40 border border-slate-800 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : !lessons || lessons.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
              <p className="text-slate-400 text-sm">No lessons have been added to this course yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-850 border border-slate-800 bg-slate-900/20 rounded-2xl overflow-hidden">
              {lessons.map((lesson, index) => {
                const canAccess = course.is_enrolled || isOwner
                return (
                  <div 
                    key={lesson.id} 
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-900/35 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm sm:text-base line-clamp-1">{lesson.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">Lesson {lesson.order}</p>
                      </div>
                    </div>

                    <div>
                      {canAccess ? (
                        currentUser?.role === 'student' ? (
                          <Link 
                            to={`/courses/${course.id}/learn`}
                            className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
                          >
                            View
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">Instructor Access</span>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none">
                          <Lock className="h-3.5 w-3.5" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action sidebar (Right Column) */}
      <div className="space-y-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6 lg:sticky lg:top-24">
          <h3 className="text-base font-bold text-white border-b border-slate-850 pb-3">Course Access</h3>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="space-y-4">
            {currentUser?.role === 'student' && (
              <>
                {course.is_enrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold justify-center">
                      <CheckCircle className="h-5 w-5" />
                      <span>You are Enrolled!</span>
                    </div>
                    <Link
                      to={`/courses/${course.id}/learn`}
                      className="flex w-full items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold rounded-xl hover:from-brand-500 hover:to-brand-400 transition-all shadow-lg shadow-brand-600/15 text-sm"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Start Learning
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="flex w-full items-center justify-center px-5 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold rounded-xl hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-600/15 text-sm"
                  >
                    {enrolling ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    ) : (
                      'Enroll in Course'
                    )}
                  </button>
                )}
              </>
            )}

            {currentUser?.role === 'instructor' && (
              <div className="space-y-3">
                {isOwner ? (
                  <>
                    <div className="text-center p-2 rounded-lg bg-brand-500/5 border border-brand-500/15 text-xs font-semibold text-brand-400">
                      You are the Instructor
                    </div>
                    <Link
                      to={`/manage-courses/${course.id}/lessons`}
                      className="flex w-full items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl border border-slate-700 hover:border-slate-600 transition-colors text-sm"
                    >
                      <Settings className="h-4.5 w-4.5" />
                      Manage Syllabus
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-4 text-xs font-semibold text-slate-500 border border-slate-850 rounded-xl bg-slate-900/10">
                    Syllabus restricted to owner.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-850 pt-4 space-y-3 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Syllabus Access</span>
              <span className="font-semibold text-slate-200">Lifetime</span>
            </div>
            <div className="flex justify-between">
              <span>Lessons Type</span>
              <span className="font-semibold text-slate-200">Text & Video</span>
            </div>
            <div className="flex justify-between">
              <span>Certificate</span>
              <span className="font-semibold text-slate-200">Included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
