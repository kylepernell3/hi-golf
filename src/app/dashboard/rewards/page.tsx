import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type LedgerEntry = {
  id: string
  amount: number
  transaction_type: string
  created_at: string
}

type Redemption = {
  id: string
  credits_spent: number
  reward_type: string
  status: string
  created_at: string
}

const REWARD_OPTIONS = [
  { type: 'free_lesson', label: 'Free Lesson', description: 'Complimentary coaching session', cost: 500 },
  { type: 'gear_discount', label: 'Gear Discount', description: '20% off at the pro shop', cost: 250 },
  { type: 'club_credit', label: 'Club Credit', description: 'Credit toward your club membership', cost: 300 },
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

async function redeemReward(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const rewardType = formData.get('reward_type') as string
  const creditsCost = Number(formData.get('credits_spent'))

  const { data: txns } = await db.from('credit_transactions').select('amount').eq('student_id', user.id)
  const balance = (txns ?? []).reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
  if (balance < creditsCost) throw new Error('Insufficient credits')

  const { error: redemptionError } = await db
    .from('reward_redemptions')
    .insert({ student_id: user.id, reward_type: rewardType, credits_spent: creditsCost, status: 'pending' })
  if (redemptionError) throw new Error(`Redemption failed: ${redemptionError.message}`)

  await db.rpc('create_credit_transaction', {
    p_student_id: user.id,
    p_amount: -creditsCost,
    p_transaction_type: 'redemption',
    p_description: `Redeemed: ${rewardType}`,
  })

  revalidatePath('/dashboard/rewards')
  redirect('/dashboard/rewards')
}

export default async function RewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: ledgerData }, { data: redemptionsData }] = await Promise.all([
    db.from('credit_transactions').select('id, amount, transaction_type, created_at').eq('student_id', user.id).order('created_at', { ascending: false }).limit(50),
    db.from('reward_redemptions').select('id, credits_spent, reward_type, status, created_at').eq('student_id', user.id).order('created_at', { ascending: false }),
  ])

  const ledger: LedgerEntry[] = ledgerData ?? []
  const redemptions: Redemption[] = redemptionsData ?? []
  const balance = ledger.reduce((sum, e) => sum + e.amount, 0)
  const earned = ledger.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0)
  const spent = ledger.filter(e => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm">&larr; Dashboard</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-sm text-zinc-300">Rewards</span>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Rewards Center</h1>
          <p className="text-zinc-400 text-sm mt-1">Earn credits by logging rounds and uploading swings</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-amber-400">{balance.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">Available</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-emerald-400">+{earned.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">Earned</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-red-400">&minus;{spent.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">Redeemed</div>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Redeem Rewards</h2>
          <div className="space-y-3">
            {REWARD_OPTIONS.map((opt) => {
              const canAfford = balance >= opt.cost
              return (
                <div key={opt.type} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-white">{opt.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{opt.description}</div>
                    <div className="text-xs text-amber-400 mt-1">{opt.cost.toLocaleString()} credits</div>
                  </div>
                  {canAfford ? (
                    <form action={redeemReward}>
                      <input type="hidden" name="reward_type" value={opt.type} />
                      <input type="hidden" name="credits_spent" value={opt.cost} />
                      <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm">Redeem</button>
                    </form>
                  ) : (
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-2 rounded-lg">Need more credits</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {redemptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Redemption History</h2>
            <div className="space-y-2">
              {redemptions.map((r) => (
                <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white capitalize">{r.reward_type.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-zinc-500">{formatDate(r.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-400">&minus;{r.credits_spent}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[r.status] ?? ''}`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Points History</h2>
          {ledger.length === 0 ? (
            <p className="text-zinc-500 text-sm">No points yet. Log a round or upload a swing to start earning.</p>
          ) : (
            <div className="space-y-2">
              {ledger.map((entry) => (
                <div key={entry.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white capitalize">{entry.transaction_type.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-zinc-600">{formatDate(entry.created_at)}</div>
                  </div>
                  <span className={`text-sm font-semibold ${entry.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
