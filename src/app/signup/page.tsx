import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden flex items-center justify-center px-4 py-12">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/4 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/4 rounded-full blur-3xl" />

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800/70 mb-5 shadow-xl">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
            Hi <span className="text-amber-400">Golf</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Premium golf training platform</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest">Invitation Only</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Join Hi Golf</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Hi Golf is a coach-issued platform. Access requires an invitation from your golf academy or coach.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
              <span className="text-amber-400 mt-0.5">⭐</span>
              <div>
                <p className="text-sm font-medium text-white">Earn rewards every round</p>
                <p className="text-xs text-zinc-500 mt-0.5">Points for every session, booking, and milestone</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
              <span className="text-amber-400 mt-0.5">🎬</span>
              <div>
                <p className="text-sm font-medium text-white">Dated swing analysis library</p>
                <p className="text-xs text-zinc-500 mt-0.5">Upload, date, and track every swing with coach feedback</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
              <span className="text-amber-400 mt-0.5">📈</span>
              <div>
                <p className="text-sm font-medium text-white">Handicap & progress tracking</p>
                <p className="text-xs text-zinc-500 mt-0.5">Log rounds, monitor your handicap trend over time</p>
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full text-center py-3 px-4 rounded-xl bg-amber-500 text-zinc-950 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
          >
            Sign in with your invitation
          </Link>

          <p className="text-center text-xs text-zinc-600 mt-4">
            Don&apos;t have an invitation?{' '}
            <a href="mailto:hello@hi.golf" className="text-zinc-400 hover:text-white transition-colors">Contact your academy</a>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          &copy; 2025 Hi Golf. All rights reserved.
        </p>
      </div>
    </div>
  )
}
