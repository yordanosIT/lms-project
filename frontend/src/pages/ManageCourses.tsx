import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { 
  useGetCoursesQuery, 
  useGetCategoriesQuery, 
  useCreateCourseMutation, 
  useUpdateCourseMutation, 
  useDeleteCourseMutation 
} from '../services/api'
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  X, 
  Settings, 
  Video, 
  Image as ImageIcon 
} from 'lucide-react'
import { LoadingScreen } from '../App'

const courseSchema = zod.object({
  title: zod.string().min(1, 'Title is required').max(255),
  description: zod.string().min(10, 'Description must be at least 10 characters'),
  category_id: zod.string().min(1, 'Category is required'),
})

type CourseFormInputs = zod.infer<typeof courseSchema>

export const ManageCourses: React.FC = () => {
  const { data: courses, isLoading: coursesLoading } = useGetCoursesQuery({ instructor_only: true })
  const { data: categories } = useGetCategoriesQuery()
  
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation()
  const [deleteCourse] = useDeleteCourseMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CourseFormInputs>({
    resolver: zodResolver(courseSchema),
  })

  const handleOpenCreate = () => {
    reset({
      title: '',
      description: '',
      category_id: '',
    })
    setSelectedFile(null)
    setExistingThumbnail(null)
    setEditingCourseId(null)
    setErrorMsg(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (course: any) => {
    reset({
      title: course.title || '',
      description: course.description || '',
      category_id: course.category?.id?.toString() || '',
    })
    setSelectedFile(null)
    setEditingCourseId(course.id)
    setExistingThumbnail(course.image_url || null)
    setErrorMsg(null)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this course and all its lessons?')) {
      try {
        await deleteCourse(id).unwrap()
      } catch (err: any) {
        console.error('Delete error:', err)
        alert('Failed to delete course.')
      }
    }
  }

  const onSubmit = async (data: CourseFormInputs) => {
    setErrorMsg(null)
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('category', data.category_id)
    formData.append('price', '0')
    
    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    try {
      if (editingCourseId) {
        await updateCourse({ id: editingCourseId, data: formData }).unwrap()
      } else {
        await createCourse(formData).unwrap()
      }
      setFormOpen(false)
      reset()
      setSelectedFile(null)
    } catch (err: any) {
      console.error('Submit error:', err)
      setErrorMsg(err.data?.detail || 'Failed to save course. Please check fields.')
    }
  }

  if (coursesLoading) return <LoadingScreen />

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Manage Courses</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create, modify, or delete your courses, and access syllabus builder.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/15 transition-all text-sm shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Course
        </button>
      </div>

      {/* Courses List */}
      {!courses || courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-850 text-slate-400 mx-auto mb-4 border border-slate-700">
            <BookOpen className="h-7 w-7" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">No courses created yet</h4>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Click the button above to launch your first course. You can upload thumbnails, configure descriptions, and add lessons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="bg-slate-900/30 border border-slate-850 hover:border-slate-805 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:bg-slate-900/40 transition-colors"
            >
              {/* Image / Header */}
              <div className="aspect-video w-full bg-slate-950 relative rounded-xl overflow-hidden">
                {course.image_url ? (
                 <img src={course.image_url || ''} alt={course.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-650 bg-slate-850">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
                <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900/90 text-brand-400 border border-slate-800 backdrop-blur-sm">
                  {course.category?.name || 'Uncategorized'}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-extrabold text-base text-slate-100 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-850 space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{course.lessons_count || 0} Lessons</span>
                  <span>{new Date(course.created_at).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/manage-courses/${course.id}/lessons`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-brand-600/10 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/20 hover:border-transparent transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Syllabus
                  </Link>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="flex-1 flex items-center justify-center p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors border border-slate-700"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="flex-1 flex items-center justify-center p-2 text-rose-400 hover:text-rose-350 bg-rose-500/5 hover:bg-rose-500/15 rounded-lg transition-colors border border-rose-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog/Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 animate-[zoomIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingCourseId ? 'Edit Course Details' : 'Launch New Course'}
              </h3>
              <button 
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-350 mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g. Intro to Django REST Framework"
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-350 mb-1.5">
                  Course Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Provide a comprehensive summary of syllabus, goals, and learning outcomes..."
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.description.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-350 mb-1.5">
                  Course Category
                </label>
                <select
                  {...register('category_id')}
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm cursor-pointer"
                >
                  <option value="">Select category...</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.category_id.message}</p>
                )}
              </div>

              {/* Thumbnail Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-350 mb-1.5">
                  Course Image
                </label>
                <div className="space-y-3">
                  {(selectedFile || existingThumbnail) && (
                    <div className="relative w-32 h-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                      <img 
                        src={selectedFile ? URL.createObjectURL(selectedFile) : existingThumbnail || ''} 
                        alt="Course thumbnail preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                      <ImageIcon className="h-4 w-4 text-brand-400" />
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex items-center justify-center px-4.5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs shadow-lg shadow-brand-600/15"
                >
                  {(creating || updating) ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  ) : editingCourseId ? (
                    'Save Changes'
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}