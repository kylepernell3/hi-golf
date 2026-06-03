/**
 * Credit Ledger Service
 * All credit mutations go through here — never update a balance directly.
 * Every entry is append-only; the balance is derived via SUM(delta).
 */
import { createAdminClient } from '@/lib/supabase/server'
import type { LedgerEntryType } from '@/lib/supabase/types'

interface LedgerEntryInput {
  studentId: string
  delta: number
  entryType: LedgerEntryType
  productId?: string
  bookingId?: string
  stripePaymentIntentId?: string
  note?: string
}

/** Append a single ledger entry using the service-role client */
export async function appendLedgerEntry(input: LedgerEntryInput) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('credit_ledger')
    .insert(({
      student_id: input.studentId,
      delta: input.delta,
      entry_type: input.entryType,
      product_id: input.productId ?? null,
      booking_id: input.bookingId ?? null,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
      note: input.note ?? null,
    }) as any)
    .select()
    .single()

  if (error) throw new Error(`Ledger write failed: ${error.message}`)
  return data
}

/** Get the current credit balance for a student */
export async function getStudentBalance(studentId: string): Promise<number> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('student_credit_balances')
    .select('balance')
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) throw new Error(`Balance fetch failed: ${error.message}`)
  return data?.balance ?? 0
}

/** Credit a student after a successful Stripe payment */
export async function creditPurchase({
  studentId,
  sessionsIncluded,
  productId,
  stripePaymentIntentId,
}: {
  studentId: string
  sessionsIncluded: number
  productId: string
  stripePaymentIntentId: string
}) {
  return appendLedgerEntry({
    studentId,
    delta: sessionsIncluded,
    entryType: 'purchase',
    productId,
    stripePaymentIntentId,
    note: `Purchased ${sessionsIncluded} session(s)`,
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
    delta: -1,
    entryType: 'booking_debit',
    bookingId,
    note: 'Booking confirmed — 1 session debited',
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
    delta: 1,
    entryType: 'cancellation_refund',
    bookingId,
    note: 'Booking cancelled — 1 session refunded',
  })
}
