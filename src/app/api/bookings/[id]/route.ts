import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelBooking } from '@/services/bookings'

/** DELETE /api/bookings/[id] — cancel a booking */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const result = await cancelBooking({ bookingId: id, studentId: user.id })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = message === 'Not authorized' ? 403 : message === 'Booking not found' ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
