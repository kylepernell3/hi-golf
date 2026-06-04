import { createClient } from '@/lib/supabase/server'

// ── Public types ─────────────────────────────────────────────────────────

export type DashboardBooking = {
  id: string
  scheduled_at: string
  duration_mins: number
  status: string
  notes: string | null
  credits_debited: number
}

export type SwingUpload = {
  id: string
  file_url: string
  created_at: string
  coach_notes: string | null
}

export type DashboardData = {
  creditBalance: number
  upcomingBookings: DashboardBooking[]
  recentSessions: DashboardBooking[]
  recentSwings: SwingUpload[]
  onboardingComplete: boolean
}

// ── Internal Supabase row shapes ──────────────────────────────────────────

type LedgerRow = {
  delta: number
}

type BookingRow = {
  id: string
  scheduled_at: string
  duration_mins: number
  status: string
  student_notes: string | null
  coach_notes: string | null
}

type SwingRow = {
  id: string
  file_url: string
  created_at: string
  coach_notes: string | null
}

type ProfileRow = {
  onboarding_complete: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────

function safeArray<T>(data: T[] | null | undefined): T[] {
  return data ?? []
}

function mapBookingRow(b: BookingRow): DashboardBooking {
  return {
    id: b.id,
    scheduled_at: b.scheduled_at,
    duration_mins: b.duration_mins,
    status: b.status,
    notes: b.student_notes,
    credits_debited: 1,
  }
}

// ── Main export ───────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const userId = user.id
  const now = new Date().toISOString()

  const [
    ledgerResult,
    upcomingResult,
    recentResult,
    swingsResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from('credit_ledger')
      .select('delta')
      .eq('student_id', userId),

    supabase
      .from('bookings')
      .select('id, scheduled_at, duration_mins, status, student_notes, coach_notes')
      .eq('student_id', userId)
      .eq('status', 'confirmed')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(5),

    supabase
      .from('bookings')
      .select('id, scheduled_at, duration_mins, status, student_notes, coach_notes')
      .eq('student_id', userId)
      .eq('status', 'completed')
      .lt('scheduled_at', now)
      .order('scheduled_at', { ascending: false })
      .limit(5),

    supabase
      .from('swing_uploads')
      .select('id, file_url, created_at, coach_notes')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .limit(4),

    supabase
      .from('student_profiles')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const creditBalance = safeArray<LedgerRow>(
    ledgerResult.data as LedgerRow[] | null
  ).reduce((sum, row) => sum + row.delta, 0)

  const profile = profileResult.data as ProfileRow | null

  return {
    creditBalance,
    upcomingBookings: safeArray<BookingRow>(
      upcomingResult.data as BookingRow[] | null
    ).map(mapBookingRow),
    recentSessions: safeArray<BookingRow>(
      recentResult.data as BookingRow[] | null
    ).map(mapBookingRow),
    recentSwings: safeArray<SwingRow>(
      swingsResult.data as SwingRow[] | null
    ).map(
      (s): SwingUpload => ({
        id: s.id,
        file_url: s.file_url,
        created_at: s.created_at,
        coach_notes: s.coach_notes,
      })
    ),
    onboardingComplete: !!profile?.onboarding_complete,
  }
}
