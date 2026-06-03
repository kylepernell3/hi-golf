import { getDashboardData } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import Link from 'next/link'

type UpcomingBooking = { id: string; starts_at: string; duration_minutes: number; location?: string | null }
type CompletedSession = { id: string; completed_at: string; duration_minutes: number; notes?: string | null }
type SwingUpload = { id: string; created_at: string; label?: string | null }
type DashboardData = {
  onboardingComplete: boolean
  creditBalance: number
  upcomingBookings: UpcomingBooking[]
  recentSessions: CompletedSession[]
  recentSwingUploads: SwingUpload[]
}

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
function fmtDateTime(iso: string) { return `${fmtDate(iso)} · ${fmtTime(iso)}` }
function fmtDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`
}
function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return fmtDate(iso)
}

export default async function DashboardPage() {
  const raw = await getDashboardData()
  if (!raw) redirect('/login')
  const data = raw as unknown as DashboardData
  const { onboardingComplete, creditBalance, upcomingBookings = [], recentSessions = [], recentSwingUploads = [] } = data
  const balanceIsLow = creditBalance > 0 && creditBalance <= 2
  const balanceIsZero = creditBalance === 0

  const creditColor = balanceIsZero
    ? 'text-red-400'
    : balanceIsLow
      ? 'text-yellow-500'
      : 'text-amber-400'

  const creditBarPct = Math.min(100, (creditBalance / 10) * 100)

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Ambient overlays */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-emerald-500/[0.04] blur-3xl" />

      <div className="relative max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex items-center gap-3 select-none mb-1">
          <GolfFlagIcon />
          <div>
            <h1
              className="text-white font-serif tracking-tight text-3xl leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              HI GOLF
            </h1>
            <p className="text-zinc-400 text-sm uppercase tracking-widest mt-0.5">Student Dashboard</p>
          </div>
        </div>

        {/* ── Onboarding banner ── */}
        {!onboardingComplete && (
          <div className="rounded-2xl border border-zinc-800/70 bg-amber-900/30 border-l-4 border-l-amber-400 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-amber-300 text-sm font-medium">Finish setting up your profile</p>
              <p className="text-amber-500/70 text-[12px] mt-0.5">Complete your onboarding to unlock all features.</p>
            </div>
            <Link
              href="/onboarding"
              className="shrink-0 text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors duration-150 whitespace-nowrap"
            >
              Complete setup →
            </Link>
          </div>
        )}

        {/* ── Credit card ── */}
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.18em] uppercase text-zinc-500 mb-1">Session Credits</p>
                <div className={`text-5xl font-light tabular-nums leading-none ${creditColor}`}>
                  {creditBalance}
                </div>
                {balanceIsZero && (
                  <p className="text-red-400/80 text-[12px] mt-1.5">No credits remaining.</p>
                )}
                {balanceIsLow && (
                  <p className="text-yellow-500/80 text-[12px] mt-1.5">Running low — top up soon.</p>
                )}
              </div>
              <Link
                href="/credits/buy"
                className="rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold px-4 py-2.5 transition-colors duration-150"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
              >
                Buy Credits
              </Link>
            </div>
            {/* Progress bar */}
            <div className="mt-5">
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${creditBarPct}%` }}
                />
              </div>
              <p className="text-zinc-600 text-[10px] mt-1.5 tracking-wide">{creditBalance} / 10 credits</p>
            </div>
          </div>
        </div>

        {/* ── Upcoming bookings ── */}
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-[10px] tracking-[0.18em] uppercase text-zinc-500">Upcoming Sessions</p>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="italic text-zinc-600 text-sm py-6 text-center">No upcoming sessions scheduled.</p>
          ) : (
            <ul>
              {upcomingBookings.map((b, i) => (
                <li
                  key={b.id}
                  className={[
                    'flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/40 transition-colors duration-150',
                    i < upcomingBookings.length - 1 ? 'border-b border-zinc-800/60' : '',
                  ].join(' ')}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 text-[11px] font-semibold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm font-medium truncate">{fmtDateTime(b.starts_at)}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">
                      {fmtDuration(b.duration_minutes)}{b.location ? ` · ${b.location}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-block text-[10px] tracking-wide uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                      Booked
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Recent sessions ── */}
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-[10px] tracking-[0.18em] uppercase text-zinc-500">Recent Sessions</p>
          </div>
          {recentSessions.length === 0 ? (
            <p className="italic text-zinc-600 text-sm py-6 text-center">No sessions completed yet.</p>
          ) : (
            <ul>
              {recentSessions.map((s, i) => (
                <li
                  key={s.id}
                  className={[
                    'px-5 py-3.5 hover:bg-zinc-800/40 transition-colors duration-150',
                    i < recentSessions.length - 1 ? 'border-b border-zinc-800/60' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-zinc-200 text-sm font-medium">{fmtRelative(s.completed_at)}</p>
                    <span className="text-zinc-500 text-xs shrink-0">{fmtDuration(s.duration_minutes)}</span>
                  </div>
                  {s.notes && (
                    <p className="text-zinc-600 text-xs mt-1 leading-relaxed line-clamp-2">{s.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Swing uploads ── */}
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/60">
            <p className="text-[10px] tracking-[0.18em] uppercase text-zinc-500">Swing Uploads</p>
          </div>
          {recentSwingUploads.length === 0 ? (
            <p className="italic text-zinc-600 text-sm py-6 text-center">No swing uploads yet.</p>
          ) : (
            <ul>
              {recentSwingUploads.map((u, i) => (
                <li
                  key={u.id}
                  className={[
                    'flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/40 transition-colors duration-150',
                    i < recentSwingUploads.length - 1 ? 'border-b border-zinc-800/60' : '',
                  ].join(' ')}
                >
                  {/* Numbered badge */}
                  <div className="shrink-0 w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 text-[11px] font-semibold leading-none">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm truncate">{u.label ?? 'Untitled swing'}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{fmtRelative(u.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}

function GolfFlagIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5 L32 12 L12 19 Z" fill="#f59e0b" opacity="0.9" />
      <line x1="6" y1="35" x2="34" y2="35" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
