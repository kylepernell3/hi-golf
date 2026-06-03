import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Queries ──────────────────────────────────────────────────────────────────
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

  const creditBalance = (ledgerResult.data as { delta: number }[] ?? []).reduce(
    (sum, row) => sum + row.delta,
    0
  )

  const profile = profileResult.data as { onboarding_complete: boolean } | null

  return {
    creditBalance,
    upcomingBookings: (upcomingResult.data ?? []).map((b: any) => ({
      id: b.id,
      scheduled_at: b.scheduled_at,
      duration_mins: b.duration_mins,
      status: b.status,
      notes: b.student_notes,
      credits_debited: 1,
    })),
    recentSessions: (recentResult.data ?? []).map((b: any) => ({
      id: b.id,
      scheduled_at: b.scheduled_at,
      duration_mins: b.duration_mins,
      status: b.status,
      notes: b.student_notes,
      credits_debited: 1,
    })),
    recentSwings: (swingsResult.data ?? []) as SwingUpload[],
    onboardingComplete: !!profile?.onboarding_complete,
  }
}

export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credit_ledger')
    .select('delta')
    .eq('student_id', userId)

  if (error) {
    console.error('[getCreditBalance]', error)
    return 0
  }

  return (data ?? []).reduce(
    (sum: number, row: { delta: number | null }) => sum + (row.delta ?? 0),
    0
  )
}

export async function getCoachUpcomingBookings() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `id, scheduled_at, duration_mins, status, student_notes, coach_notes, student:student_id ( id )`
    )
    .eq('status', 'confirmed')
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error('[getCoachUpcomingBookings]', error)
    return []
  }

  return data ?? []
}
