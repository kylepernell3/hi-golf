/**
 * Booking Engine Service
 * Handles booking creation, status transitions, and cancellation rules.
 * All credit mutations delegate to the ledger service.
 */
import { createAdminClient } from '@/lib/supabase/server'
import { debitBooking, refundCancellation, getStudentBalance } from './ledger'
import type { BookingStatus } from '@/lib/supabase/types'

export interface CreateBookingInput {
  studentId: string
  coachId?: string
  scheduledAt: string // ISO 8601
  durationMins?: number
  location?: string
  studentNotes?: string
}

/**
 * Create a new booking.
 * Validates the student has at least 1 credit, creates the booking record
 * in 'pending' status, debits the credit via ledger, and then confirms.
 */
export async function createBooking(input: CreateBookingInput) {
  const supabase = await createAdminClient()

  // 1. Guard: student must have credits
  const balance = await getStudentBalance(input.studentId)
  if (balance < 1) {
    throw new Error('No credits available. Purchase a lesson package to book.')
  }

  // 2. Create booking in pending status
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      student_id: input.studentId,
      coach_id: input.coachId ?? null,
      scheduled_at: input.scheduledAt,
      duration_mins: input.durationMins ?? 60,
      status: 'pending' as BookingStatus,
      location: input.location ?? null,
      student_notes: input.studentNotes ?? null,
    })
    .select()
    .single()

  if (bookingError || !booking) {
    throw new Error(`Booking creation failed: ${bookingError?.message}`)
  }

  // 3. Debit credit (validates balance again inside)
  const ledgerEntry = await debitBooking({
    studentId: input.studentId,
    bookingId: booking.id,
  })

  // 4. Update booking to confirmed and link ledger entry
  const { data: confirmedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed' as BookingStatus,
      ledger_entry_id: ledgerEntry.id,
    })
    .eq('id', booking.id)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Booking confirmation failed: ${updateError.message}`)
  }

  return confirmedBooking
}

/**
 * Cancel a booking.
 * Checks cancellation window (24h), updates status, and issues credit refund.
 */
export async function cancelBooking(input: { bookingId: string; studentId: string }) {
  const supabase = await createAdminClient()

  // Fetch booking details
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', input.bookingId)
    .single()

  if (fetchError || !booking) {
    throw new Error('Booking not found')
  }

  // Ownership guard
  if (booking.student_id !== input.studentId) {
    throw new Error('Not authorized')
  }

  if (booking.status === 'cancelled') {
    return booking
  }

  // Check 24-hour window
  const scheduledTime = new Date(booking.scheduled_at).getTime()
  const now = Date.now()
  const hoursRemaining = (scheduledTime - now) / (1000 * 60 * 60)

  if (hoursRemaining < 24) {
    throw new Error('Cancellations must be made at least 24 hours in advance.')
  }

  // 1. Mark as cancelled
  const { error: cancelError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' as BookingStatus })
    .eq('id', input.bookingId)

  if (cancelError) {
    throw new Error(`Cancellation failed: ${cancelError.message}`)
  }

  // 2. Issue refund via ledger (if a credit was actually used)
  if (booking.ledger_entry_id) {
    await await refundCancellation({
      studentId: booking.student_id,
      bookingId: booking.id,
    })
  }

  return { success: true }
}

/**
 * Student-side: fetch upcoming bookings
 */
export async function getUpcomingBookings(studentId: string) {
  const supabase = await createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('student_id', studentId)
    .eq('status', 'confirmed')
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[getUpcomingBookings]', error)
    return []
  }

  return data
}

/**
 * Student-side: fetch full history
 */
export async function getBookingHistory(studentId: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('student_id', studentId)
    .order('scheduled_at', { ascending: false })

  if (error) {
    console.error('[getBookingHistory]', error)
    return []
  }

  return data
}
