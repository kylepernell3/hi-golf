import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type LedgerEntry = {
  id: string
  delta: number
  entry_type: string
  note: string | null
  created_at: string
}

type Redemption = {
  id: string
  credits_spent: number
  reward_type: string
  reward_detail: string | null
  status: string
  created_at: string
}

const REWARD_OPTIONS = [
  { type: 'free_lesson', label: 'Free Lesson', description: 'Redeem credits for a complimentary coaching session', cost: 500, icon: '&#127979;' },
  { type: 'gear_discount', label: 'Gear Discount', description: '20% off at the pro shop', cost: 250, icon: '&#9978;' },
  { type: 'club_credit', label: 'Club Credit', description: 'Credit toward your club membership', cost: 300, icon: '&#127920;' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  fulfilled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  declined: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function RewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: ledgerData }, { data: redemptionsData }] = await Promise.all([
    supabase.from('credit_ledger').select('id, delta, entry_type, note, created_at').eq('student_id', user.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('reward_redemptions').select('id, credits_spent, reward_type, reward_detail, status, created_at').eq('student_id', user.id).order('created_at', { ascending: false }),
  ])

  const ledger: LedgerEntry[] = ledgerData ?? []
  const redemptions: Redemption[] = redemptionsData ?? []

  const balance = ledger.reduce((sum, e) => sum + e.delta, 0)
  const earned = ledger.filter(e => e.delta > 0).reduce((sum, e) => sum + e.delta, 0)
  const spent = ledger.filter(e => e.delta < 0).reduce((sum, e) => sum + Math.abs(e.delta), 0)

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed top-0 left-1/4 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-sm">&larr; Dashboard</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-white text-sm font-medium">Rewards</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Rewards Center</h1>
          <p className="text-zinc-500 text-sm mt-1">Earn points, redeem rewards</p>
        </div>

        {/* Balance card */}
        <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl p-6 mb-6">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Available Balance</p>
          <p className="text-5xl font-bold text-amber-400 mb-1">{balance.toLocaleString()}</p>
          <p className="text-xs text-zinc-600">credits</p>
          <div className="flex gap-6 mt-4 pt-4 border-t border-zinc-800/60">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Total Earned</p>
              <p className="text-sm font-semibold text-emerald-400">+{earned.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Total Redeemed</p>
              <p className="text-sm font-semibold text-zinc-400">&minus;{spent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Redeem options */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Redeem Rewards</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REWARD_OPTIONS.map((opt) => {
              const canAfford = balance >= opt.cost
              return (
                <div key={opt.type} className={`bg-zinc-900/60 border rounded-2xl p-5 flex flex-col gap-3 ${canAfford ? 'border-zinc-800/70 hover:border-zinc-700/80' : 'border-zinc-800/40 opacity-60'} transition-all`}>
                  <div className="text-2xl" dangerouslySetInnerHTML={{ __html: opt.icon }} />
                  <div>
                    <p className="text-white font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{opt.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/60">
                    <p className="text-sm font-semibold text-amber-400">{opt.cost.toLocaleString()} credits</p>
                    {canAfford ? (
                      <form action="/api/redemptions" method="POST">
                        <input type="hidden" name="reward_type" value={opt.type} />
                        <input type="hidden" name="credits_spent" value={opt.cost} />
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all">
                          Redeem
                        </button>
                      </form>
                    ) : (
                      <span className="text-[10px] text-zinc-600">Need more credits</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Redemption history */}
        {redemptions.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Redemption History</p>
            <div className="space-y-2">
              {redemptions.map((r) => (
                <div key={r.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-zinc-300 text-sm capitalize">{r.reward_type.replace('_', ' ')}</p>
                    <p className="text-xs text-zinc-600">{formatDate(r.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-400">&minus;{r.credits_spent}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[r.status] ?? STATUS_COLORS.pending}`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credit ledger */}
        <div>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Points History</p>
          {ledger.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl">
              <p className="text-zinc-500 text-sm">No points earned yet. Book a session, log a round, or complete a goal to start earning.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ledger.map((entry) => (
                <div key={entry.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-zinc-300 text-sm capitalize">{entry.entry_type.replace('_', ' ')}</p>
                    {entry.note && <p className="text-xs text-zinc-600">{entry.note}</p>}
                    <p className="text-xs text-zinc-700">{formatDate(entry.created_at)}</p>
                  </div>
                  <p className={`text-sm font-semibold ${entry.delta > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {entry.delta > 0 ? '+' : ''}{entry.delta}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
