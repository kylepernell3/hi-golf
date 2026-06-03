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
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-amber-500/[0.07] blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full bg-emerald-500/[0.04] blur-3xl" />

      {/* ── Top gradient rule ── */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(180,83,9,0.45) 30%, rgba(245,158,11,0.45) 50%, rgba(180,83,9,0.45) 70%, transparent 100%)' }} />

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <header className="relative z-40 w-full">
        <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 select-none group">
            <GolfFlagIcon className="w-6 h-6" />
            <span
              className="text-white font-serif tracking-tight text-xl leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              HI GOLF
            </span>
          </Link>
          {/* Nav actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-zinc-400 hover:text-amber-400 text-sm transition-colors duration-150 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold px-4 py-2 transition-colors duration-150"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-76px)] px-6 text-center">
        {/* Background glow centred on hero */}
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-amber-500/[0.08] blur-3xl" />

        {/* Decorative thin horizontal rule above eyebrow */}
        <div aria-hidden className="mb-6 flex items-center gap-3">
          <span className="block w-10 h-px bg-gradient-to-r from-transparent to-amber-600/50" />
          <GolfFlagIcon className="w-4 h-4 opacity-60" />
          <span className="block w-10 h-px bg-gradient-to-l from-transparent to-amber-600/50" />
        </div>

        {/* Eyebrow */}
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-5 select-none">
          Private Golf Instruction
        </p>

        {/* Headline */}
        <h1
          className="font-serif text-5xl md:text-7xl text-white leading-[1.05] tracking-tight max-w-3xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Elevate Your Game
          <br />
          <span className="text-amber-400">with a Pro</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-zinc-400 text-lg max-w-md leading-relaxed">
          Personalized lessons, swing analysis, and credit-based booking&nbsp;— all in one place.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm px-8 py-3 transition-colors duration-150"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.14)' }}
          >
            ⛳ Book a Session
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-zinc-700 text-zinc-300 hover:border-amber-500/50 hover:text-amber-400 text-sm font-medium px-8 py-3 transition-colors duration-150"
          >
            Learn More
          </a>
        </div>

        {/* Scroll indicator */}
        <div aria-hidden className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30">
          <span className="text-zinc-500 text-[9px] uppercase tracking-[0.2em]">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" className="relative py-24 px-6">
        {/* Section label */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-3">What's included</p>
            <h2
              className="font-serif text-3xl md:text-4xl text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Everything you need to improve
            </h2>
            <div aria-hidden className="mt-5 mx-auto w-12 h-px bg-gradient-to-r from-amber-600/0 via-amber-500/60 to-amber-600/0" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card 1 — Personalized Lessons */}
            <div className="group rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-6 flex flex-col gap-5 hover:border-amber-500/25 hover:bg-zinc-900/80 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <GolfFlagIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-2">Personalized Lessons</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Tailored instruction from a certified PGA professional focused on your specific game.
                </p>
              </div>
              <div aria-hidden className="mt-auto h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Card 2 — Swing Analysis */}
            <div className="group rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-6 flex flex-col gap-5 hover:border-emerald-500/25 hover:bg-zinc-900/80 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <PlayIcon />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-2">Swing Analysis</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Review instructor-uploaded swing recordings and notes after every session.
                </p>
              </div>
              <div aria-hidden className="mt-auto h-px w-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Card 3 — Credit System */}
            <div className="group rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-6 flex flex-col gap-5 hover:border-amber-500/25 hover:bg-zinc-900/80 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <CreditIcon />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-2">Credit System</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Purchase credits and book sessions at your convenience. No subscription required.
                </p>
              </div>
              <div aria-hidden className="mt-auto h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SOCIAL PROOF STRIP (subtle)
      ════════════════════════════════════════ */}
      <div className="relative px-6 py-4">
        <div className="max-w-5xl mx-auto border-y border-zinc-800/50 py-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { value: '1-on-1', label: 'Private sessions' },
            { value: 'PGA', label: 'Certified instructor' },
            { value: 'HD', label: 'Swing recordings' },
            { value: 'Flex', label: 'Credit booking' },
          ].map((stat) => (
            <div key={stat.value} className="flex flex-col items-center gap-0.5 select-none">
              <span
                className="text-amber-400 font-serif text-xl leading-none"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </span>
              <span className="text-zinc-600 text-[10px] uppercase tracking-[0.15em]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM CTA BANNER
      ════════════════════════════════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 px-8 py-14 text-center relative overflow-hidden">
            {/* Inner glow */}
            <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-amber-500/[0.06] blur-2xl" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600 mb-4 select-none">Invitation only</p>
              <h2
                className="font-serif text-2xl md:text-3xl text-white tracking-tight mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Ready to start?
              </h2>
              <p className="text-zinc-400 text-base mb-8">
                Join today and book your first lesson.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm px-10 py-3.5 transition-colors duration-150"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.14)' }}
              >
                Get Started →
              </Link>
              <p className="mt-5 text-zinc-700 text-[11px]">Access is by invitation only. Contact your instructor to get set up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="relative border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 select-none">
            <GolfFlagIcon className="w-4 h-4 opacity-50" />
            <span
              className="text-zinc-700 text-xs font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              HI GOLF
            </span>
          </div>
          <p className="text-zinc-700 text-xs text-center">
            © 2025 Hi Golf. All rights reserved.
          </p>
          <Link
            href="/login"
            className="text-zinc-700 hover:text-zinc-500 text-xs transition-colors duration-150"
          >
            Student portal →
          </Link>
        </div>
      </footer>

    </div>
  )
}

/* ── Icons ── */

function GolfFlagIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <line x1="12" y1="5" x2="12" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5 L32 12 L12 19 Z" fill="#f59e0b" opacity="0.9" />
      <line x1="6" y1="35" x2="34" y2="35" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="#10b981" strokeWidth="1.2" opacity="0.6" />
      <path d="M8 7.2l5 2.8-5 2.8V7.2Z" fill="#10b981" />
    </svg>
  )
}

function CreditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="#f59e0b" strokeWidth="1.2" opacity="0.6" />
      <path d="M10 5.5v1M10 13.5v1M7.5 8.5a2.5 1.5 0 0 1 5 0c0 .9-.7 1.4-2.5 1.5-1.8.1-2.5.7-2.5 1.5a2.5 1.5 0 0 0 5 0" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
