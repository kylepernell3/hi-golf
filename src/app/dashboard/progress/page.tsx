import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Goal = {
  id: string
  type: string
  title: string
  description: string | null
  target_value: number
  current_value: number
  unit: string | null
  deadline: string | null
  achieved_at: string | null
  points_on_achieve: number
}

type Round = {
  played_date: string
  gross_score: number
  handicap_differential: number | null
}

function progressPct(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100))
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: goalsData }, { data: roundsData }, { data: profileData }] = await Promise.all([
    supabase.from('goals').select('id, type, title, description, target_value, current_value, unit, deadline, achieved_at, points_on_achieve').eq('student_id', user.id).order('created_at', { ascending: false }),
    supabase.from('rounds').select('played_date, gross_score, handicap_differential').eq('student_id', user.id).order('played_date', { ascending: true }).limit(20),
    supabase.from('student_profiles').select('handicap_index').eq('user_id', user.id).maybeSingle(),
  ])

  const goals: Goal[] = goalsData ?? []
  const rounds: Round[] = roundsData ?? []

  const activeGoals = goals.filter(g => !g.achieved_at)
  const completedGoals = goals.filter(g => !!g.achieved_at)

  const recentDiffs = rounds.slice(-8).filter(r => r.handicap_differential !== null)
  const liveHandicap = recentDiffs.length > 0
    ? (recentDiffs.reduce((s, r) => s + (r.handicap_differential ?? 0), 0) / recentDiffs.length).toFixed(1)
    : : (profileData as { handicap_index?: number | null } | null)?.handicap_index?.toFixed(1) ?? null

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/4 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-sm">&larr; Dashboard</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-white text-sm font-medium">Progress</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Your Progress</h1>
          <p className="text-zinc-500 text-sm mt-1">Handicap trend, goals, and milestones</p>
        </div>

        {/* Handicap trend */}
        <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-6 mb-6">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Handicap Index (calculated)</p>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-5xl font-bold text-amber-400">{liveHandicap ?? '--'}</p>
              <p className="text-xs text-zinc-600 mt-1">Based on last {recentDiffs.length} differentials</p>
            </div>
            {rounds.length > 1 && (
              <div className="flex-1 flex items-end gap-1 h-16">
                {rounds.slice(-10).map((r, i) => {
                  const max = Math.max(...rounds.slice(-10).map(x => x.gross_score))
                  const min = Math.min(...rounds.slice(-10).map(x => x.gross_score))
                  const range = max - min || 1
                  const h = Math.max(8, Math.round(((max - r.gross_score) / range) * 48) + 8)
                  return (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}px`, backgroundColor: i === rounds.slice(-10).length - 1 ? 'rgb(251 191 36)' : 'rgb(63 63 70)' }} title={`${r.gross_score} — ${formatDate(r.played_date)}`} />
                  )
                })}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-6">
            <Link href="/dashboard/rounds" className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">View all rounds &rarr;</Link>
          </div>
        </div>

        {/* Active goals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Active Goals</p>
            <span className="text-[10px] text-zinc-600">{activeGoals.length} goal{activeGoals.length !== 1 ? 's' : ''}</span>
          </div>
          {activeGoals.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl">
              <p className="text-zinc-500 text-sm">No active goals. Goals coming soon via coach assignment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const pct = progressPct(goal.current_value, goal.target_value)
                return (
                  <div key={goal.id} className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-white font-medium text-sm">{goal.title}</p>
                        {goal.description && <p className="text-xs text-zinc-500 mt-0.5">{goal.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-white">{goal.current_value}{goal.unit ? ` ${goal.unit}` : ''} <span className="text-zinc-600">/</span> {goal.target_value}{goal.unit ? ` ${goal.unit}` : ''}</p>
                        {goal.deadline && <p className="text-[10px] text-zinc-600">Due {formatDate(goal.deadline)}</p>}
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1.5">{pct}% complete &middot; +{goal.points_on_achieve} pts on completion</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Completed goals */}
        {completedGoals.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Completed Milestones</p>
            <div className="space-y-2">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-sm">&#10003;</span>
                    <p className="text-zinc-300 text-sm">{goal.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-emerald-400">+{goal.points_on_achieve} pts</p>
                    {goal.achieved_at && <p className="text-[10px] text-zinc-600">{formatDate(goal.achieved_at)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
