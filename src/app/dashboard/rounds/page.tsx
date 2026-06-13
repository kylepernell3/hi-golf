import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Round = {
  id: string
  played_date: string
  course_name: string
  holes: number
  gross_score: number
  course_rating: number | null
  slope_rating: number | null
  handicap_differential: number | null
  fairways_hit: number | null
  greens_in_regulation: number | null
  putts: number | null
  notes: string | null
  points_earned: number
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function RoundsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rounds } = await supabase
    .from('rounds')
    .select('id, played_date, course_name, holes, gross_score, course_rating, slope_rating, handicap_differential, fairways_hit, greens_in_regulation, putts, notes, points_earned')
    .eq('student_id', user.id)
    .order('played_date', { ascending: false })
    .limit(50)

  const allRounds: Round[] = rounds ?? []

  const avgScore = allRounds.length > 0
    ? Math.round(allRounds.reduce((s, r) => s + r.gross_score, 0) / allRounds.length)
    : null

  const totalPoints = allRounds.reduce((s, r) => s + r.points_earned, 0)

  const recentDiff = allRounds.slice(0, 8).filter(r => r.handicap_differential !== null)
  const handicapIndex = recentDiff.length > 0
    ? (recentDiff.reduce((s, r) => s + (r.handicap_differential ?? 0), 0) / recentDiff.length).toFixed(1)
    : null

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/4 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-sm">&larr; Dashboard</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-white text-sm font-medium">Round History</span>
          </div>
          <Link href="/dashboard/rounds/log" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150">
            + Log Round
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Round History</h1>
          <p className="text-zinc-500 text-sm mt-1">Every round logged, tracked, and rewarded</p>
        </div>

        {/* Stats strip */}
        {allRounds.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Rounds Logged</p>
              <p className="text-2xl font-bold text-white">{allRounds.length}</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Avg Score</p>
              <p className="text-2xl font-bold text-white">{avgScore ?? '&mdash;'}</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Handicap Idx</p>
              <p className="text-2xl font-bold text-amber-400">{handicapIndex ?? '&mdash;'}</p>
            </div>
          </div>
        )}

        {allRounds.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl">
            <div className="text-4xl mb-4">&#9971;</div>
            <h3 className="text-white font-semibold mb-2">No rounds logged yet</h3>
            <p className="text-zinc-500 text-sm mb-6">Log your first round to start tracking scores and earning rewards points</p>
            <Link href="/dashboard/rounds/log" className="inline-flex px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold hover:opacity-90 transition-all">Log Your First Round</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {allRounds.map((round) => (
              <div key={round.id} className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-5 hover:border-zinc-700/80 transition-all duration-150">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 text-xl">&#9971;</div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{round.course_name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatDate(round.played_date)} &middot; {round.holes} holes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{round.gross_score}</p>
                      <p className="text-[10px] text-zinc-600">gross</p>
                    </div>
                    {round.handicap_differential !== null && (
                      <div className="text-center">
                        <p className="text-lg font-semibold text-amber-400">{Number(round.handicap_differential).toFixed(1)}</p>
                        <p className="text-[10px] text-zinc-600">diff</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-emerald-400">+{round.points_earned}</p>
                      <p className="text-[10px] text-zinc-600">pts</p>
                    </div>
                  </div>
                </div>
                {(round.fairways_hit !== null || round.greens_in_regulation !== null || round.putts !== null) && (
                  <div className="mt-3 flex gap-4 pt-3 border-t border-zinc-800/60">
                    {round.fairways_hit !== null && <span className="text-xs text-zinc-500">FIR: <span className="text-zinc-300">{round.fairways_hit}</span></span>}
                    {round.greens_in_regulation !== null && <span className="text-xs text-zinc-500">GIR: <span className="text-zinc-300">{round.greens_in_regulation}</span></span>}
                    {round.putts !== null && <span className="text-xs text-zinc-500">Putts: <span className="text-zinc-300">{round.putts}</span></span>}
                  </div>
                )}
                {round.notes && <p className="mt-2 text-xs text-zinc-500 italic">{round.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {allRounds.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-600">Total points earned from rounds: <span className="text-amber-400 font-semibold">{totalPoints}</span></p>
          </div>
        )}
      </main>
    </div>
  )
}
