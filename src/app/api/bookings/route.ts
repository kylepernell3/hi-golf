import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBooking, getUpcomingBookings, getBookingHistory } from '@/services/bookings'
import { z } from 'zod'

const createBookingSchema = z.object({
  scheduledAt: z.string().datetime(),
  durationMins: z.number().int().min(30).max(180).optional(),
  location: z.string().max(200).optional(),
  studentNotes: z.string().max(1000).optional(),
  coachId: z.string().uuid().optional(),
})

/** GET /api/bookings?type=upcoming|history */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = request.nextUrl.searchParams.get('type') ?? 'upcoming'

  const bookings = type === 'history'
    ? await getBookingHistory(user.id)
    : await getUpcomingBookings(user.id)

  return NextResponse.json({ bookings })
}

/** POST /api/bookings */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createBookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  try {
    const booking = await createBooking({
      studentId: user.id,
      scheduledAt: parsed.data.scheduledAt,
      durationMins: parsed.data.durationMins,
      location: parsed.data.location,
      studentNotes: parsed.data.studentNotes,
      coachId: parsed.data.coachId,
    })
    return NextResponse.json({ booking }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = message.includes('No credits') ? 402 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
