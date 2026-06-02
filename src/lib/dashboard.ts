import { createClient } from '@/lib/supabase/server'

// ─── Types ───────────────────────────────────────────────────────────────────

export type DashboardBooking = {
  id: string
  scheduled_at: string
  duration_minutes: number
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

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetches all data needed to render the student dashboard.
 * Must be called from a Server Component or Server Action.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const userId = user.id
  const now = new Date().toISOString()

  // Run queries in parallel for performance
  const [
    ledgerResult,
    upcomingResult,
    recentResult,
    swingsResult,
    profileResult,
  ] = await Promise.all([
    // 1. Credit balance: sum all ledger entries for this user
    supabase
      .from('credit_ledger')
      .select('amount')
      .eq('user_id', userId),

    // 2. Upcoming bookings (confirmed, in the future)
    supabase
      .from('bookings')
      .select(
        'id, scheduled_at, duration_minutes, status, notes, credits_debited'
      )
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(5),

    // 3. Recent completed sessions
    supabase
      .from('bookings')
      .select(
        'id, scheduled_at, duration_minutes, status, notes, credits_debited'
      )
      .eq('user_id', userId)
      .eq('status', 'completed')
      .lt('scheduled_at', now)
      .order('scheduled_at', { ascending: false })
      .limit(5),

    // 4. Recent swing uploads
    supabase
      .from('swing_uploads')
      .select('id, file_url, created_at, coach_notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(4),

    // 5. Student profile (for onboarding gate)
    supabase
      .from('student_profiles')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .single(),
  ])

  // Compute credit balance from ledger (purchase = positive, debit = negative)
  const creditBalance = (ledgerResult.data ?? []).reduce(
    (sum: number, row: { amount: number }) => sum + row.amount,
    0
  )

  return {
    creditBalance,
    upcomingBookings: (upcomingResult.data ?? []) as DashboardBooking[],
    recentSessions: (recentResult.data ?? []) as DashboardBooking[],
    recentSwings: (swingsResult.data ?? []) as SwingUpload[],
    onboardingComplete:
      profileResult.data?.onboarding_complete ?? false,
  }
}

/**
 * Lightweight credit balance check — use this in middleware or guards
 * without loading the full dashboard payload.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credit_ledger')
    .select('amount')
    .eq('user_id', userId)

  if (error) {
    console.error('[getCreditBalance]', error)
    return 0
  }

  return (data ?? []).reduce(
    (sum: number, row: { amount: number }) => sum + row.amount,
    0
  )
}

/**
 * Coach-side: fetch all upcoming bookings across all students.
 * Protected by RLS — only accessible to coach/admin roles.
 */
export async function getCoachUpcomingBookings() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('bookings')
    .select(
      `id, scheduled_at, duration_minutes, status, notes, credits_debited,
       users:user_id ( email, raw_user_meta_data->full_name )`
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
