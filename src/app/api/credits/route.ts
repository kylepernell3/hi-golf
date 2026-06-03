import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/credits - Get current user's credit balance and ledger history */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch balance from student_credit_balances view
  // Cast to any to handle missing types for view
  const { data: balanceRaw, error: balanceError } = await (supabase as any)
    .from('student_credit_balances')
    .select('balance')
    .eq('student_id', user.id)
    .single()

  if (balanceError && balanceError.code !== 'PGRST116') {
    return NextResponse.json({ error: balanceError.message }, { status: 500 })
  }

  const balance: number = (balanceRaw as { balance: number } | null)?.balance ?? 0

  // Fetch ledger history (append-only, read-only)
  const { data: ledger, error: ledgerError } = await supabase
    .from('credit_ledger')
    .select('id, delta, entry_type, note, created_at')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (ledgerError) return NextResponse.json({ error: ledgerError.message }, { status: 500 })

  return NextResponse.json({ balance, ledger: ledger ?? [] })
}
