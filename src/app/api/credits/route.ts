import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/credits - Get current user's credit balance and ledger history */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch balance from student_credit_balances view
  const { data: balanceData, error: balanceError } = await supabase
    .from('student_credit_balances')
    .select('balance')
    .eq('student_id', user.id)
    .single()

  if (balanceError && balanceError.code !== 'PGRST116') {
    return NextResponse.json({ error: balanceError.message }, { status: 500 })
  }

  const balance = balanceData?.balance ?? 0

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
