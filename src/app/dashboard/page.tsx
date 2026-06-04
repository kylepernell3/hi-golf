import { getDashboardData } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending:   'bg-amber-500/10  text-amber-400  border-amber-500/20',
    cancelled: 'bg-red-500/10   text-red-400   border-red-500/20',
    completed: 'bg-zinc-700/40  text-zinc-400  border-zinc-600/30',
  }
  const cls = map[status.toLowerCase()] ?? map.pending
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium capitalize ${cls}`}>
      {status}
    </span>
  )
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{title}</h2>
      {action}
    </div>
  )
}

function EmptyState({ message, sub, cta, href }: { message: string; sub?: string; cta?: string; href?: string }) {
  return (
    <div className="text-center py-10">
      <p className="text-zinc-400 text-sm font-medium">{message}</p>
      {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
      {cta && href && (
        <Link
          href={href}
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
        >
          {cta}
        </Link>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/login')
  }
  const { creditBalance, upcomingBookings, recentSessions, recentSwings, onboardingComplete } = data

  // Credit bar: scale to 10 as a soft max; always show at least a sliver if balance > 0
  const creditMax = Math.max(10, creditBalance)
  const creditPct  = creditBalance === 0 ? 0 : Math.max(4, (creditBalance / creditMax) * 100)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-start justify-between mb-10">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Hi<span className="text-amber-500"> Golf</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1.5">Your private coaching portal</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60"
            >
              Sign out
            </button>
          </form>
        </header>

        {/* ── Onboarding Banner ───────────────────────────────────── */}
        {!onboardingComplete && (
          <div className="mb-8 rounded-2xl bg-amber-500/8 border border-amber-500/25 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-amber-400 font-semibold text-sm">Complete your player profile</p>
              <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                Help your coach tailor sessions to your game — takes under 3 minutes.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
            >
              Get started →
            </Link>
          </div>
        )}

        {/* ── Top row: Credits + Upcoming ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Credit Balance */}
          <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-6 flex flex-col">
            <SectionHeader
              title="Credit Balance"
              action={
                <Link
                  href="/credits/buy"
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Buy more →
                </Link>
              }
            />

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-end gap-2 mb-5">
                <span
                  className="text-6xl font-bold text-amber-500 leading-none"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {creditBalance}
                </span>
                <span className="text-zinc-500 text-sm mb-1.5">
                  credit{creditBalance !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${creditPct}%` }}
                />
              </div>
              <p className="text-zinc-600 text-xs mt-2">
                {creditBalance === 0
                  ? 'No credits — purchase to book sessions'
                  : `${creditBalance} session credit${creditBalance !== 1 ? 's' : ''} remaining`}
              </p>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-6">
            <SectionHeader
              title="Upcoming Sessions"
              action={
                <Link
                  href="/bookings/new"
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Book new →
                </Link>
              }
            />

            {upcomingBookings.length === 0 ? (
              <EmptyState
                message="No upcoming sessions"
                sub="Schedule time with your coach to keep improving"
                cta="Book your first session"
                href="/bookings/new"
              />
            ) : (
              <ul className="divide-y divide-zinc-800/50">
                {upcomingBookings.map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium">
                        {formatDateTime(booking.scheduled_at)}
                      </p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {booking.duration_mins} min ·{' '}
                        {booking.credits_debited} credit{booking.credits_debited !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">
                      <StatusBadge status={booking.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Bottom row: Recent Sessions + Swing Uploads ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Sessions */}
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-6">
            <SectionHeader title="Session History" />

            {recentSessions.length === 0 ? (
              <EmptyState
                message="No completed sessions yet"
                sub="Your session history will appear here after your first lesson"
              />
            ) : (
              <ul className="divide-y divide-zinc-800/50">
                {recentSessions.map((session) => (
                  <li key={session.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium">
                          {formatDateTime(session.scheduled_at)}
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {session.duration_mins} min ·{' '}
                          {session.credits_debited} credit{session.credits_debited !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0">
                        <StatusBadge status={session.status} />
                      </div>
                    </div>
                    {session.notes && (
                      <p className="mt-2 text-zinc-400 text-xs italic leading-relaxed bg-zinc-800/40 rounded-lg px-3 py-2">
                        "{session.notes}"
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Swing Uploads */}
          <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-6">
            <SectionHeader
              title="Swing Uploads"
              action={
                <Link
                  href="/swings/upload"
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Upload →
                </Link>
              }
            />

            {recentSwings.length === 0 ? (
              <EmptyState
                message="No uploads yet"
                sub="Upload a swing video for coach review"
              />
            ) : (
              <ul className="divide-y divide-zinc-800/50">
                {recentSwings.map((swing) => (
                  <li key={swing.id} className="py-4 first:pt-0 last:pb-0">
                    <a
                      href={swing.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                    >
                      View swing ↗
                    </a>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {formatShortDate(swing.created_at)}
                    </p>
                    {swing.coach_notes && (
                      <p className="mt-2 text-zinc-400 text-xs italic leading-relaxed bg-zinc-800/40 rounded-lg px-3 py-2">
                        "{swing.coach_notes}"
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
