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
  scheduledAt: string   // ISO 8601
  durationMins?: number
  location?: string
  studentNotes?: string
}

/**
 * Create a new booking.
 * Validates the student has at least 1 credit, creates the booking record
 * in 'pending' status, then debits the credit and updates to 'confirmed'.
 * Uses admin client so RLS is not a blocker server-side.
 */
export async function createBooking(input: CreateBookingInput) {
  const supabase = createAdminClient()

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
      status: 'pending',
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
      status: 'confirmed',
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
 * If the booking was confirmed, refunds 1 credit to the student.
 */
export async function cancelBooking({
  bookingId,
  studentId,
}: {
  bookingId: string
  studentId: string
}) {
  const supabase = createAdminClient()

  // Fetch current status
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('status, student_id')
    .eq('id', bookingId)
    .single()

  if (error || !booking) throw new Error('Booking not found')
  if (booking.student_id !== studentId) throw new Error('Not authorized')

  const refundable: BookingStatus[] = ['pending', 'confirmed']
  const shouldRefund = refundable.includes(booking.status)

  // Update status to cancelled
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  // Refund credit if applicable
  if (shouldRefund) {
    await refundCancellation({ studentId, bookingId })
  }

  return { cancelled: true, credited: shouldRefund }
}

/** Get upcoming bookings for a student */
export async function getUpcomingBookings(studentId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('student_id', studentId)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) throw new Error(`Bookings fetch failed: ${error.message}`)
  return data ?? []
}

/** Get all bookings for a student (history) */
export async function getBookingHistory(studentId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('student_id', studentId)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(`Booking history fetch failed: ${error.message}`)
  return data ?? []
}
