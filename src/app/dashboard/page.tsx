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

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
        <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-medium">{title}</span>
        {count !== undefined && <span className="text-[10px] text-zinc-600 tabular-nums">{count} {count === 1 ? 'item' : 'items'}</span>}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-10 flex flex-col items-center gap-2 text-center">
      <div className="w-7 h-7 rounded-full border border-zinc-800 flex items-center justify-center mb-1">
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-zinc-700">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.6" fill="currentColor" />
        </svg>
      </div>
      <p className="text-xs text-zinc-600 max-w-[18rem] leading-relaxed">{message}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const raw = await getDashboardData()
  if (!raw) redirect('/login')

  const data = raw as unknown as DashboardData
  const { onboardingComplete, creditBalance, upcomingBookings = [], recentSessions = [], recentSwingUploads = [] } = data
  const balanceIsLow = creditBalance > 0 && creditBalance <= 2
  const balanceIsZero = creditBalance === 0

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(217,119,6,0.06) 0%, transparent 65%)' }} />

      {!onboardingComplete && (
        <div className="relative z-10 bg-amber-500 px-4 py-2.5 flex items-center justify-center gap-3 text-zinc-950">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z" /></svg>
          <span className="text-sm font-medium leading-none">Your profile isn't finished yet.</span>
          <Link href="/onboarding" className="text-sm font-semibold underline underline-offset-2 hover:no-underline transition-all">Complete setup →</Link>
        </div>
      )}

      <div className="relative z-0 max-w-3xl mx-auto px-5 py-10 flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GolfFlagIcon />
            <h1 className="text-white font-light tracking-[0.22em] text-lg leading-none" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>HI GOLF</h1>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-600">Student Dashboard</span>
        </header>

        <section className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
          <div className="px-7 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-500">Lesson Credits</span>
              <div className="flex items-end gap-3 mt-1">
                <span className={['text-[5rem] leading-none font-light tabular-nums tracking-tight', balanceIsZero ? 'text-zinc-600' : balanceIsLow ? 'text-amber-300' : 'text-amber-400'].join(' ')} style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{creditBalance}</span>
                <span className="text-zinc-500 text-sm mb-2.5 leading-tight">{creditBalance === 1 ? 'credit remaining' : 'credits remaining'}</span>
              </div>
              {balanceIsZero && <p className="text-xs text-zinc-600 mt-0.5">You're out of credits. Add some to book your next session.</p>}
              {balanceIsLow && <p className="text-xs text-amber-600/80 mt-0.5">Running low — top up before your next booking.</p>}
            </div>
            <div className="shrink-0">
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold tracking-wide px-7 py-3.5 transition-colors duration-150 shadow-lg shadow-amber-900/20">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 1.5a.75.75 0 0 1 .75.75V7h4.75a.75.75 0 0 1 0 1.5H8.75v4.75a.75.75 0 0 1-1.5 0V8.5H2.5a.75.75 0 0 1 0-1.5h4.75V2.25A.75.75 0 0 1 8 1.5z" /></svg>
                Buy Credits
              </Link>
            </div>
          </div>
          {creditBalance > 0 && (
            <div className="h-px bg-zinc-800">
              <div className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400/30 transition-all duration-700" style={{ width: `${Math.min(100, (creditBalance / 10) * 100)}%` }} />
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Section title="Upcoming Sessions" count={upcomingBookings.length}>
            {upcomingBookings.length === 0 ? <EmptyState message="No sessions scheduled yet. Your instructor will book your next one." /> : (
              <div className="divide-y divide-zinc-800/50">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="px-5 py-4 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-white font-medium leading-tight">{fmtDate(b.starts_at)}</span>
                        <span className="text-xs text-zinc-500">{fmtTime(b.starts_at)}</span>
                      </div>
                      <span className="shrink-0 rounded-md bg-zinc-800/80 border border-zinc-700/40 px-2 py-0.5 text-[11px] text-zinc-400 tabular-nums">{fmtDuration(b.duration_minutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section title="Recent Sessions" count={recentSessions.length}>
            {recentSessions.length === 0 ? <EmptyState message="No completed sessions yet. History appears here after your first lesson." /> : (
              <div className="divide-y divide-zinc-800/50">
                {recentSessions.map((s) => (
                  <div key={s.id} className="px-5 py-4 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-white font-medium leading-tight">{fmtDate(s.completed_at)}</span>
                        <span className="text-xs text-zinc-500">{fmtRelative(s.completed_at)}</span>
                      </div>
                      <span className="shrink-0 rounded-md bg-zinc-800/80 border border-zinc-700/40 px-2 py-0.5 text-[11px] text-zinc-400 tabular-nums">{fmtDuration(s.duration_minutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <Section title="Swing Uploads" count={recentSwingUploads.length}>
          {recentSwingUploads.length === 0 ? <EmptyState message="No swings uploaded yet. Your instructor will add recordings after your sessions." /> : (
            <div className="divide-y divide-zinc-800/50">
              {recentSwingUploads.map((u, i) => (
                <div key={u.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-zinc-800/70 border border-zinc-700/40 flex items-center justify-center text-[11px] text-zinc-500 tabular-nums">{i + 1}</div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-sm text-zinc-200 truncate leading-tight">{u.label ?? 'Swing recording'}</span>
                    <span className="text-[11px] text-zinc-600">{fmtDateTime(u.created_at)}</span>
                  </div>
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-zinc-700 shrink-0"><path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function GolfFlagIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5 L32 12 L12 19 Z" fill="#f59e0b" opacity="0.9" />
      <line x1="6" y1="35" x2="34" y2="35" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
