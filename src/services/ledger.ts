/**
 * Credit Ledger Service
 * All credit mutations go through here — never update a balance directly.
 * Every entry is append-only; the balance is derived via SUM(amount).
 */
import { createAdminClient } from '@/lib/supabase/server'
import type { Database, LedgerEntryType } from '@/types/database'

type LedgerInsert = Database['public']['Tables']['credit_ledger']['Insert']

interface LedgerEntryInput {
  studentId: string
  amount: number
  type: LedgerEntryType
  description?: string
  bookingId?: string
  stripeSessionId?: string
}

/** Append a single ledger entry using the service-role client */
export async function appendLedgerEntry(input: LedgerEntryInput) {
  const supabase = await createAdminClient()

  const insertPayload: LedgerInsert = {
    user_id: input.studentId,
    amount: input.amount,
    type: input.type,
    description: input.description ?? null,
    booking_id: input.bookingId ?? null,
    stripe_session_id: input.stripeSessionId ?? null,
  }

  const { data, error } = await supabase
    .from('credit_ledger')
    .insert(insertPayload)
    .select()
    .single()

  if (error) throw new Error(`Ledger write failed: ${error.message}`)
  return data
}

/** Get the current credit balance for a student */
export async function getStudentBalance(studentId: string): Promise<number> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('credit_ledger')
    .select('amount')
    .eq('user_id', studentId)

  if (error) throw new Error(`Balance fetch failed: ${error.message}`)

  const balance = (data ?? []).reduce((sum, row) => sum + (row.amount ?? 0), 0)
  return balance
}

/** Credit a student after a successful Stripe payment */
export async function creditPurchase({
  studentId,
  sessionsIncluded,
  stripeSessionId,
}: {
  studentId: string
  sessionsIncluded: number
  stripeSessionId: string
}) {
  return appendLedgerEntry({
    studentId,
    amount: sessionsIncluded,
    type: 'purchase',
    stripeSessionId,
    description: `Purchased ${sessionsIncluded} session(s)`,
  })
}

/** Debit one credit when a booking is confirmed */
export async function debitBooking({
  studentId,
  bookingId,
}: {
  studentId: string
  bookingId: string
}) {
  const balance = await getStudentBalance(studentId)
  if (balance < 1) {
    throw new Error('Insufficient credits')
  }

  return appendLedgerEntry({
    studentId,
    amount: -1,
    type: 'booking_debit',
    bookingId,
    description: 'Booking confirmed — 1 session debited',
  })
}

/** Refund one credit on booking cancellation */
export async function refundCancellation({
  studentId,
  bookingId,
}: {
  studentId: string
  bookingId: string
}) {
  return appendLedgerEntry({
    studentId,
    amount: 1,
    type: 'cancellation_refund',
    bookingId,
    description: 'Booking cancelled — 1 session refunded',
  })
}
