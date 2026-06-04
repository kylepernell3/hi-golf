'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Inner component uses useSearchParams (needs Suspense boundary) ──
function LoginForm() {
  const router      = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode]       = useState<'magic' | 'password'>(
    searchParams.get('mode') === 'password' ? 'password' : 'magic'
  )
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  const supabase = createClient()

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard')
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function switchMode(next: 'magic' | 'password') {
    setMode(next)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) setError(error.message)
      else setSuccess("Check your inbox — we've sent a magic link.")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.replace('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* ── Brand ───────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          {/* Decorative mark */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-amber-500" aria-hidden>
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 11.5V20M8 20h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M6 15.5c1.5-1 3.5-1.5 6-1.5s4.5.5 6 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>

          <h1
            className="text-4xl font-bold tracking-tight text-white leading-none"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Hi<span className="text-amber-500"> Golf</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2.5 leading-relaxed">
            Your golf operations platform.
          </p>
        </div>

        {/* ── Card ────────────────────────────────────────────────── */}
        <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-8 shadow-2xl shadow-black/40">

          {/* Tab toggles */}
          <div
            className="flex bg-zinc-800/60 rounded-xl p-1 mb-7"
            role="tablist"
            aria-label="Sign-in method"
          >
            {(['magic', 'password'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                onClick={() => switchMode(tab)}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${mode === tab
                    ? 'bg-zinc-700 text-white shadow-sm shadow-black/30'
                    : 'text-zinc-400 hover:text-zinc-200'}
                `}
              >
                {tab === 'magic' ? 'Magic Link' : 'Password'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="
                    w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                    px-4 py-3 text-white text-sm placeholder-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50
                    transition-all duration-150
                  "
                />
              </div>

              {/* Password (conditional) */}
              {mode === 'password' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
                      px-4 py-3 text-white text-sm placeholder-zinc-600
                      focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50
                      transition-all duration-150
                    "
                  />
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400 mt-0.5 shrink-0" aria-hidden>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-red-400 text-sm leading-snug">{error}</p>
                </div>
              )}

              {/* Success state */}
              {success && (
                <div className="flex items-start gap-2.5 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" aria-hidden>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-emerald-400 text-sm leading-snug">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full mt-1 py-3 rounded-xl bg-amber-500 text-zinc-950
                  text-sm font-semibold transition-all duration-150
                  hover:opacity-90 active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
              >
                {loading
                  ? 'Please wait…'
                  : mode === 'magic'
                    ? 'Send Magic Link'
                    : 'Sign In'}
              </button>

            </div>
          </form>

          {/* Mode hint */}
          {mode === 'magic' && !success && (
            <p className="text-center text-zinc-600 text-xs mt-5 leading-relaxed">
              We'll email you a one-click sign-in link.
              <br />No password needed.
            </p>
          )}

        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <p className="text-center text-zinc-700 text-xs mt-7 leading-relaxed px-2">
          Hi Golf is an <span className="text-zinc-500">invitation-only</span> platform.
          <br />
          Access requires a valid account issued by your coach.
        </p>

      </div>
    </div>
  )
}

// ── Suspense wrapper required for useSearchParams ────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
