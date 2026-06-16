import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { 
  useGetCourseQuery, 
  useGetLessonsQuery, 
  useCreateLessonMutation, 
  useUpdateLessonMutation, 
  useDeleteLessonMutation 
} from '../services/api'
import { 
  BookOpen, 
  ChevronLeft, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Video, 
  FileText,
  Plus
} from 'lucide-react'
import { LoadingScreen } from '../App'
const lessonSchema = zod.object({
  title: zod.string().min(1, 'Title is required').max(255),
  content: zod.string().min(10, 'Content must be at least 10 characters'),
  video_url: zod.string().url('Invalid URL format').or(zod.literal('')),
  order: zod.preprocess(
    (val) => Number(val),
    zod.number().int().min(1, 'Order must be a positive integer')  // Changed from .integer() to .int()
  ),
})
type LessonFormInputs = zod.infer<typeof lessonSchema>

export const ManageLessons: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(courseId)
  const { data: lessons, isLoading: lessonsLoading } = useGetLessonsQuery({ course_id: courseId })
  
  const [createLesson, { isLoading: creating }] = useCreateLessonMutation()
  const [updateLesson, { isLoading: updating }] = useUpdateLessonMutation()
  const [deleteLesson] = useDeleteLessonMutation()

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LessonFormInputs>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      order: 1,
      video_url: '',
    }
  })

  const handleEdit = (lesson: any) => {
    reset({
      title: lesson.title,
      content: lesson.content,
      video_url: lesson.video_url || '',
      order: lesson.order,
    })
    setEditingLessonId(lesson.id)
    setErrorMsg(null)
  }

  const handleCancelEdit = () => {
    reset({
      title: '',
      content: '',
      video_url: '',
      order: (lessons?.length || 0) + 1,
    })
    setEditingLessonId(null)
    setErrorMsg(null)
  }

  const handleDelete = async (lessonId: number) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await deleteLesson(lessonId).unwrap()
        handleCancelEdit()
      } catch (err: any) {
        console.error('Delete error:', err)
        alert('Failed to delete lesson.')
      }
    }
  }

  const onSubmit = async (data: LessonFormInputs) => {
    setErrorMsg(null)
    try {
      if (editingLessonId) {
        await updateLesson({ 
          id: editingLessonId, 
          data: { ...data, course: courseId } 
        }).unwrap()
        setEditingLessonId(null)
      } else {
        await createLesson({ 
          ...data, 
          course: courseId 
        }).unwrap()
      }
      reset({
        title: '',
        content: '',
        video_url: '',
        order: (lessons?.length || 0) + 1, // Default order to next index
      })
    } catch (err: any) {
      console.error('Submit error:', err)
      setErrorMsg(err.data?.detail || 'Failed to save lesson. Please verify course permission.')
    }
  }

  if (courseLoading) return <LoadingScreen />

  if (!course) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-5 text-rose-400">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <p>Course not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link 
          to="/manage-courses" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to Manage Courses
        </Link>
      </div>

      {/* Course Title Context */}
      <div className="border-b border-slate-850 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Syllabus Builder</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">{course.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Syllabus / Lessons Listing (Left Panel) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white mb-1">Lessons Outline</h3>
          
          {lessonsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-900/40 border border-slate-800 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : !lessons || lessons.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-850 text-slate-450 mx-auto mb-3 border border-slate-700">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-1">No lessons added yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Use the form on the right to start building your course outline. Add text-based instructions or video URLs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className={`
                    flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200
                    ${editingLessonId === lesson.id 
                      ? 'bg-brand-600/5 border-brand-500/50 shadow-inner' 
                      : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/40 hover:border-slate-800'}
                  `}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700 select-none">
                      {lesson.order}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-200 text-sm sm:text-base truncate">{lesson.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                        {lesson.video_url ? (
                          <>
                            <Video className="h-3.5 w-3.5 text-brand-400" />
                            <span className="truncate max-w-[200px]">{lesson.video_url}</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            <span>Text lesson</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4 shrink-0">
                    <button
                      onClick={() => handleEdit(lesson)}
                      className="p-2 text-slate-400 hover:text-slate-250 bg-slate-800 rounded-lg hover:bg-slate-750 border border-slate-700 transition-colors"
                      title="Edit Lesson"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="p-2 text-rose-450 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 rounded-lg transition-colors"
                      title="Delete Lesson"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Panel (Right Panel) */}
        <div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5 lg:sticky lg:top-24">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <PlusCircle className="h-4.5 w-4.5 text-brand-400" />
                {editingLessonId ? 'Modify Lesson' : 'Add New Lesson'}
              </h3>
              {editingLessonId && (
                <button 
                  onClick={handleCancelEdit}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Lesson Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lesson Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g. Setting up django REST framework"
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xs"
                />
                {errors.title && (
                  <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Order Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Display Order / Number
                </label>
                <input
                  type="number"
                  {...register('order')}
                  placeholder="e.g. 1"
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xs"
                />
                {errors.order && (
                  <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.order.message}</p>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Video URL (Optional)
                </label>
                <input
                  type="text"
                  {...register('video_url')}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xs"
                />
                <p className="mt-1 text-[10px] text-slate-500 font-medium leading-normal">
                  Supports YouTube, Vimeo, or standard video link URLs. Leave empty for text-only lessons.
                </p>
                {errors.video_url && (
                  <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.video_url.message}</p>
                )}
              </div>

              {/* Content text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lesson Content (Text / Markdown)
                </label>
                <textarea
                  {...register('content')}
                  rows={6}
                  placeholder="Write instructions, code snippets, or reading materials..."
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xs resize-none"
                />
                {errors.content && (
                  <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.content.message}</p>
                )}
              </div>

              {/* Actions */}
              <button
                type="submit"
                disabled={creating || updating}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs shadow-lg shadow-brand-600/15"
              >
                {editingLessonId ? (
                  updating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  ) : (
                    'Save Changes'
                  )
                ) : creating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
