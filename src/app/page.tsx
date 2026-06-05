import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">

      {/* ── Ambient glows ── */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-amber-500/[0.06] blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-3xl" />

      {/* ── Top gradient rule ── */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3) 40%, rgba(245,158,11,0.3) 60%, transparent)' }} />

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
          Hi<span className="text-amber-500"> Golf</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-zinc-400 hover:text-white text-sm transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative z-10 text-center px-6 pt-20 pb-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.08] text-amber-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Earn rewards every round
        </div>

        <h1
          className="text-5xl sm:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Your Golf Game,{' '}
          <span className="text-amber-500">Finally Rewarded</span>
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Track every session, hit your goals, and earn real rewards — all in one place built for golfers who love the game.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
          >
            Start Earning Free
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-all"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-zinc-800/60 bg-zinc-900/30 py-5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { stat: '100%',        label: 'Free to join' },
            { stat: 'Every round', label: 'Earns points' },
            { stat: 'Real rewards', label: 'You can redeem' },
            { stat: 'Your pace',   label: 'Track & improve' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-white font-bold text-lg">{stat}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Built for the way you play
          </h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Whether you play twice a week or twice a year, Hi Golf keeps you motivated and moving forward.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: '🏌️',
              title: 'Log Your Rounds',
              desc: 'Record scores, track stats, and build a history of every session — from the driving range to tournament day.',
            },
            {
              icon: '⭐',
              title: 'Earn Points',
              desc: 'Every round played, lesson booked, or goal hit earns you points. The more you play, the more you earn.',
            },
            {
              icon: '🎁',
              title: 'Redeem Rewards',
              desc: 'Turn your points into real value — free lessons, gear discounts, club credits, and more from your golf academy.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 hover:border-zinc-700/80 transition-colors"
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-6 max-w-4xl mx-auto">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-8 sm:p-12 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2
              className="text-3xl font-bold text-white mb-4 leading-snug"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Everything your golf journey needs
            </h2>
            <ul className="space-y-3">
              {[
                'Track scores, handicap & progress over time',
                'Set personal goals and get notified when you hit them',
                'Book sessions with your coach in seconds',
                'Earn and redeem a loyalty rewards balance',
                'See your full history — rounds, lessons, milestones',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-emerald-400" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { label: 'Rounds Logged',   value: '47',    sub: 'this season' },
              { label: 'Reward Points',   value: '1,240', sub: 'ready to redeem' },
              { label: 'Handicap Trend',  value: '↓ 2.1', sub: 'last 90 days' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-zinc-950/60 border border-zinc-800/50 rounded-xl px-5 py-4">
                <p className="text-zinc-500 text-xs mb-1">{label}</p>
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BOTTOM CTA
      ════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 text-center max-w-2xl mx-auto">
        <h2
          className="text-4xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Ready to level up your game?
        </h2>
        <p className="text-zinc-500 text-sm mb-8">
          Join golfers already earning rewards for every round they play.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
        >
          Create Your Free Account
        </Link>
        <p className="text-zinc-700 text-xs mt-4">No credit card required. Free forever.</p>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-zinc-600 text-sm font-medium" style={{ fontFamily: 'var(--font-playfair)' }}>
            Hi<span className="text-amber-500/70"> Golf</span>
          </span>
          <p className="text-zinc-700 text-xs">&copy; 2025 Hi Golf. All rights reserved.</p>
          <Link href="/login" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
            Sign in
          </Link>
        </div>
      </footer>

    </div>
  )
}
