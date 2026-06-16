import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useGetProfileQuery } from './services/api'
import { logout, selectCurrentUser, selectIsAuthenticated } from './features/authSlice'
import { Layout } from './components/Layout'

// Page components
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { CourseList } from './pages/CourseList'
import { CourseDetail } from './pages/CourseDetail'
import { CourseLearning } from './pages/CourseLearning'
import { ManageCourses } from './pages/ManageCourses'
import { ManageLessons } from './pages/ManageLessons'

// Loading Spinner Component
export const LoadingScreen: React.FC = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500"></div>
      <p className="text-slate-400 font-medium animate-pulse text-sm">Loading LMS dashboard...</p>
    </div>
  </div>
)

interface RouteProps {
  children: React.ReactElement
  allowedRoles?: ('student' | 'instructor')[]
}

const ProtectedRoute: React.FC<RouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token')
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const dispatch = useDispatch()
  
  // Trigger profile query if token exists but user info is missing
  const { data: profile, isLoading, error } = useGetProfileQuery(undefined, {
    skip: !token || !!currentUser,
  })

  useEffect(() => {
    if (error) {
      dispatch(logout())
    }
  }, [error, dispatch])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  const user = currentUser || profile

  if (!user) {
    return <LoadingScreen />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Layout>{children}</Layout>
}

const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('access_token')
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (token && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Combined Layout Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/courses" element={
        <ProtectedRoute>
          <CourseList />
        </ProtectedRoute>
      } />

      <Route path="/courses/:id" element={
        <ProtectedRoute>
          <CourseDetail />
        </ProtectedRoute>
      } />

      {/* Course learning page (Only for students enrolled or anyone authenticated) */}
      <Route path="/courses/:id/learn" element={
        <ProtectedRoute allowedRoles={['student']}>
          <CourseLearning />
        </ProtectedRoute>
      } />

      {/* Student enrolled courses page */}
      <Route path="/my-courses" element={
        <ProtectedRoute allowedRoles={['student']}>
          <CourseList myCoursesOnly />
        </ProtectedRoute>
      } />

      {/* Instructor management pages */}
      <Route path="/manage-courses" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <ManageCourses />
        </ProtectedRoute>
      } />

      <Route path="/manage-courses/:id/lessons" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <ManageLessons />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
