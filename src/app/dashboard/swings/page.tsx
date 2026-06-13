import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type SwingUpload = {
  id: string
  file_url: string
  recorded_date: string
  club_used: string | null
  category: string | null
  notes: string | null
  coach_notes: string | null
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  driver: 'Driver', iron: 'Iron', wedge: 'Wedge',
  putting: 'Putting', chipping: 'Chipping',
  full_swing: 'Full Swing', other: 'Other',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function SwingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: swings } = await supabase
    .from('swing_uploads')
    .select('id, file_url, recorded_date, club_used, category, notes, coach_notes, created_at')
    .eq('student_id', user.id)
    .order('recorded_date', { ascending: false })
    .limit(50)

  const uploads: SwingUpload[] = swings ?? []

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/4 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
      <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-sm">&larr; Dashboard</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-white text-sm font-medium">Swing Library</span>
          </div>
          <Link href="/dashboard/swings/upload" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150">
            + Upload Swing
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Swing Library</h1>
          <p className="text-zinc-500 text-sm mt-1">Your dated swing analysis archive &mdash; track improvement over time</p>
        </div>
        {uploads.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl">
            <div className="text-4xl mb-4">&#127916;</div>
            <h3 className="text-white font-semibold mb-2">No swings yet</h3>
            <p className="text-zinc-500 text-sm mb-6">Upload your first swing video to start building your analysis library</p>
            <Link href="/dashboard/swings/upload" className="inline-flex px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold hover:opacity-90 transition-all">Upload Your First Swing</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {uploads.map((swing) => (
              <div key={swing.id} className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-5 hover:border-zinc-700/80 transition-all duration-150">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 text-xl">&#127916;</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm">{swing.club_used ?? 'Swing'}</span>
                        {swing.category && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {CATEGORY_LABELS[swing.category] ?? swing.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">Recorded {formatDate(swing.recorded_date)} &middot; Added {formatDate(swing.created_at)}</p>
                    </div>
                  </div>
                  <a href={swing.file_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">View &rarr;</a>
                </div>
                {(swing.notes || swing.coach_notes) && (
                  <div className="mt-4 space-y-2">
                    {swing.notes && (
                      <div className="rounded-xl bg-zinc-800/40 border border-zinc-700/30 px-4 py-3">
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Your Notes</p>
                        <p className="text-zinc-300 text-sm">{swing.notes}</p>
                      </div>
                    )}
                    {swing.coach_notes && (
                      <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
                        <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest mb-1">Coach Feedback</p>
                        <p className="text-zinc-300 text-sm">{swing.coach_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
