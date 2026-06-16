import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetCourseQuery, useGetLessonsQuery } from '../services/api'
import { BookOpen, Play, ChevronLeft, ArrowLeft, ArrowRight, Video, FileText } from 'lucide-react'
import { LoadingScreen } from '../App'

export const CourseLearning: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(courseId)
  const { data: lessons, isLoading: lessonsLoading } = useGetLessonsQuery({ course_id: courseId })
  
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)

  // Auto-redirect if student is not enrolled
  useEffect(() => {
    // Note: App.tsx wraps this page in a route guard checking if user is student,
    // but we can ensure they are enrolled or handle redirection gracefully if needed.
  }, [course])

  if (courseLoading || lessonsLoading) return <LoadingScreen />

  if (!course || !lessons || lessons.length === 0) {
    return (
      <div className="space-y-6 text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
        <ArrowLeft className="h-10 w-10 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">No lessons found</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          This course doesn't have any lessons uploaded yet. Please check back later.
        </p>
        <Link 
          to={`/courses/${courseId}`} 
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 text-sm transition-colors"
        >
          Back to Course Details
        </Link>
      </div>
    )
  }

  const activeLesson = lessons[activeLessonIndex]

  // Extract YouTube embed URL helper
  const getEmbedUrl = (url: string) => {
    if (!url) return null
    
    // YouTube
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const ytMatch = url.match(ytReg)
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}`
    }
    
    // Vimeo
    const vimeoReg = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/
    const vimeoMatch = url.match(vimeoReg)
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
    
    return url // Default fallback (e.g. if it is already an embed URL)
  }

  const embedUrl = activeLesson ? getEmbedUrl(activeLesson.video_url) : null

  const handleNext = () => {
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1)
    }
  }

  const handlePrev = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back to details link */}
      <div>
        <Link 
          to={`/courses/${courseId}`} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to Course Detail
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Active Lesson Display (Left Columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Player */}
          {activeLesson?.video_url ? (
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              {embedUrl && (embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com') || embedUrl.includes('player.vimeo.com')) ? (
                <iframe
                  src={embedUrl}
                  title={activeLesson.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  src={activeLesson.video_url} 
                  controls 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3">
              <FileText className="h-16 w-16 text-slate-600" />
              <p className="text-sm font-medium">Text-only lesson (No video included)</p>
            </div>
          )}

          {/* Lesson Metadata & Content */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 sm:p-8 rounded-2xl backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-850">
              <div>
                <span className="text-xs font-semibold text-brand-400 capitalize">
                  Lesson {activeLesson?.order} of {lessons.length}
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1 leading-tight">{activeLesson?.title}</h2>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={activeLessonIndex === 0}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeLessonIndex === lessons.length - 1}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Lesson Description</h4>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {activeLesson?.content}
              </p>
            </div>
          </div>
        </div>

        {/* Playlist / Sidebar (Right Column) */}
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl lg:sticky lg:top-24">
            <div className="p-5 border-b border-slate-850">
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-brand-400" />
                Course Outline
              </h3>
              <p className="text-xs text-slate-400 mt-1 truncate">{course.title}</p>
            </div>

            <div className="divide-y divide-slate-850 max-h-[450px] overflow-y-auto">
              {lessons.map((lesson, index) => {
                const isActive = index === activeLessonIndex
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIndex(index)}
                    className={`
                      w-full flex items-start gap-3 p-4 text-left transition-colors
                      ${isActive ? 'bg-brand-600/10 text-brand-400' : 'text-slate-300 hover:bg-slate-900/40'}
                    `}
                  >
                    <div className={`
                      flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold border
                      ${isActive 
                        ? 'bg-brand-500 border-brand-450 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-500'}
                    `}>
                      {index + 1}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold truncate leading-tight ${isActive ? 'text-brand-300' : 'text-slate-200'}`}>
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                        {lesson.video_url ? (
                          <>
                            <Video className="h-3 w-3 shrink-0" />
                            <span>Video content</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3 shrink-0" />
                            <span>Text only</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
