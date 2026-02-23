import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../api/hooks'
import { registerUser } from '../actions/authAction'
import { clearError } from '../slices/authSlice'

export default function SignUp() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((s) => s.auth)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    const result = await dispatch(registerUser({ name, email, password }))
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }
  return (
    <div className="w-full h-full bg-white relative flex">
      {/* Left Side: Branding + Pink Animation */}
      <div className="hidden lg:flex flex-col overflow-hidden bg-[#F5F2EF] w-1/2 h-full border-r border-stone-200 pt-12 pr-12 pb-12 pl-12 relative justify-between">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white">
              <span className="serif-font italic font-medium">J</span>
            </div>
            <span className="font-semibold tracking-tight text-lg">Journalia Admin</span>
          </div>
          <h1 className="serif-font text-5xl leading-tight text-stone-900 mb-4">
            Start creating<br />something beautiful.
          </h1>
          <p className="text-stone-500 max-w-sm text-lg">
            Join the team and begin crafting stunning journal templates.
          </p>
        </div>

        {/* Pink blur animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-linear-to-t from-stone-100 to-transparent pointer-events-none" />

        <div className="z-10 flex gap-4 text-xs font-medium text-stone-400">
          <span>© 2024 Journalia Inc.</span>
          <a href="#" className="hover:text-stone-900">Privacy</a>
          <a href="#" className="hover:text-stone-900">Terms</a>
        </div>
      </div>

      {/* Right Side: Sign Up Form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Create an account</h2>
            <p className="mt-2 text-sm text-stone-500">Start creating your digital journal templates</p>
          </div>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700">Full Name</label>
              <input
                type="text"
                placeholder="Isabella Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700">Email Address</label>
              <input
                type="email"
                placeholder="admin@journalia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all placeholder:text-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account…
                </span>
              ) : (
                <>Create Account <span className="group-hover:translate-x-0.5 transition-transform">→</span></>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
              GitHub
            </button>
          </div>

          <p className="text-center text-xs text-stone-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/sign-in')}
              className="text-stone-900 font-semibold hover:underline ml-1"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
