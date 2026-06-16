import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectCurrentUser } from '../features/authSlice'
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  GraduationCap, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  Video
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['student', 'instructor']
    },
    {
      name: 'Browse Courses',
      path: '/courses',
      icon: BookOpen,
      roles: ['student', 'instructor']
    },
    {
      name: 'My Courses',
      path: '/my-courses',
      icon: GraduationCap,
      roles: ['student']
    },
    {
      name: 'Manage Courses',
      path: '/manage-courses',
      icon: PlusCircle,
      roles: ['instructor']
    }
  ]

  const activeItem = navItems.find(item => item.path === location.pathname)

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 border-r border-slate-800/60 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/60">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 shadow-md shadow-brand-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Brothers LMS
            </span>
          </Link>
          <button 
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems
            .filter(item => currentUser && item.roles.includes(currentUser.role))
            .map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}
                  `}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {item.name}
                </Link>
              )
            })}
        </nav>

        {/* Sidebar User Info & Logout */}
        {currentUser && (
          <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
            <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-850/60 mb-2 border border-slate-850">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-brand-400 border border-slate-700">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-slate-200 truncate">{currentUser.full_name}</h4>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 font-medium transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-20 items-center justify-between px-6 bg-slate-900/40 border-b border-slate-800/60 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-100 capitalize">
              {activeItem ? activeItem.name : 'LMS'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium capitalize px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                {currentUser?.role || 'Guest'}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Root */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-8">
          <div className="mx-auto max-w-7xl animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
