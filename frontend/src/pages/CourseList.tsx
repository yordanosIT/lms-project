import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../features/authSlice'
import { 
  useGetCoursesQuery, 
  useGetCategoriesQuery, 
  useGetMyCoursesQuery 
} from '../services/api'
import { BookOpen, Search, Filter, AlertCircle, Play, User } from 'lucide-react'

interface CourseListProps {
  myCoursesOnly?: boolean
}

export const CourseList: React.FC<CourseListProps> = ({ myCoursesOnly = false }) => {
  const currentUser = useSelector(selectCurrentUser)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)

  const { data: categories } = useGetCategoriesQuery()
  
  // Conditionally fetch courses
  const { 
    data: allCourses, 
    isLoading: allLoading, 
    error: allError 
  } = useGetCoursesQuery(
    myCoursesOnly 
      ? undefined 
      : { search: searchQuery, category: selectedCategory },
    { skip: myCoursesOnly }
  )

  const { 
    data: myCourses, 
    isLoading: myLoading, 
    error: myError 
  } = useGetMyCoursesQuery(undefined, { skip: !myCoursesOnly })

  const isLoading = myCoursesOnly ? myLoading : allLoading
  const error = myCoursesOnly ? myError : allError
  
  // Filter myCourses locally by search and category for consistent experience if myCoursesOnly
  const displayedCourses = myCoursesOnly && myCourses
    ? myCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              course.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory ? course.category.id === selectedCategory : true
        return matchesSearch && matchesCategory
      })
    : allCourses

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {myCoursesOnly ? 'My Courses Portfolio' : 'Courses Directory'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {myCoursesOnly 
              ? 'Resume learning or check your enrolled classes.' 
              : 'Discover learning courses taught by professional instructors.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 p-4 border border-slate-800/60 rounded-2xl backdrop-blur-xl">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title or keyword..."
            className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Filter className="h-5 w-5" />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
            className="block w-full pl-11 pr-8 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-900/40 border border-slate-800 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-5 text-rose-400">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p>Failed to retrieve courses. Please try again later.</p>
        </div>
      ) : !displayedCourses || displayedCourses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mx-auto mb-4 border border-slate-700">
            <BookOpen className="h-7 w-7" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">No courses found</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            We couldn't find any courses matching your filters. Try checking spelling or using other categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((course) => (
            <div 
              key={course.id} 
              className="group flex flex-col bg-slate-900/30 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/50 rounded-2xl overflow-hidden transition-all duration-300"
            >
              {/* Image Thumbnail */}
<div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
  {course.image_url ? (
  <img src={course.image_url || ''} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-slate-850 text-slate-500">
      <BookOpen className="h-12 w-12" />
    </div>
  )}
  <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-md bg-slate-900/90 text-brand-400 border border-slate-800/80 backdrop-blur-sm">
    {course.category_name}
  </span>
</div>
              {/* Course Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <Link to={`/courses/${course.id}`}>
                    <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate max-w-[120px] font-medium">{course.instructor.full_name}</span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {course.lessons_count} Lessons
                  </span>
                </div>

                <div className="pt-2">
                  {currentUser?.role === 'student' && course.is_enrolled ? (
                    <Link
                      to={`/courses/${course.id}/learn`}
                      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-brand-600/10 hover:bg-brand-600 text-brand-400 hover:text-white font-bold rounded-xl border border-brand-500/20 hover:border-transparent transition-colors text-sm"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Learn Now
                    </Link>
                  ) : (
                    <Link
                      to={`/courses/${course.id}`}
                      className="flex w-full items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl border border-slate-700 hover:border-slate-600 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
