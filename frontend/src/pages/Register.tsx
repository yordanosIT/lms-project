import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useRegisterMutation } from '../services/api'
import { GraduationCap, Mail, Lock, User, AlertCircle, Shield } from 'lucide-react'

const registerSchema = zod.object({
  full_name: zod.string().min(1, 'Full name is required').max(100),
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  role: zod.enum(['student', 'instructor'], {
    required_error: 'Role is required',
  }),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterFormInputs = zod.infer<typeof registerSchema>

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    }
  })

  const onSubmit = async (data: RegisterFormInputs) => {
    setErrorMsg(null)
    try {
      await registerUser(data).unwrap()
      navigate('/')
    } catch (err: any) {
      console.error('Registration error:', err)
      setErrorMsg(err.data?.email?.[0] || err.data?.detail || 'Failed to register. Email may already be in use.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 shadow-xl shadow-brand-500/10">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Get started with Brothers LMS today
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="full_name"
                  type="text"
                  {...register('full_name')}
                  className={`
                    block w-full pl-11 pr-4 py-3 bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all
                    ${errors.full_name ? 'border-rose-500/50' : 'border-slate-800'}
                  `}
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`
                    block w-full pl-11 pr-4 py-3 bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all
                    ${errors.email ? 'border-rose-500/50' : 'border-slate-800'}
                  `}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900/60 cursor-pointer text-slate-300 select-none">
                  <input
                    type="radio"
                    value="student"
                    {...register('role')}
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="peer-checked:text-brand-400 peer-checked:border-brand-500 flex flex-col items-center gap-1">
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-xs font-semibold">Student</span>
                  </div>
                </label>

                <label className="relative flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900/60 cursor-pointer text-slate-300 select-none">
                  <input
                    type="radio"
                    value="instructor"
                    {...register('role')}
                    className="sr-only peer"
                  />
                  <div className="peer-checked:text-brand-400 peer-checked:border-brand-500 flex flex-col items-center gap-1">
                    <Shield className="h-5 w-5" />
                    <span className="text-xs font-semibold">Instructor</span>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.role.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className={`
                    block w-full pl-11 pr-4 py-3 bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all
                    ${errors.password ? 'border-rose-500/50' : 'border-slate-800'}
                  `}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-600/15"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Already have an account? </span>
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
