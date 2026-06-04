'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

const OnboardingSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  handedness: z.enum(['right', 'left', 'unknown']).default('unknown'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'scratch']).default('beginner'),
  goals: z.string().optional(),
  handicap: z.number().nullable().optional(),
  scoring_range: z.string().optional(),
  notes: z.string().optional(),
})

export type OnboardingFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

/** Explicit row shape for the student_profiles table. */
export interface StudentProfileRow {
  user_id: string
  full_name: string
  phone: string | null
  handedness: 'right' | 'left' | 'unknown'
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'scratch'
  goals: string | null
  handicap: number | null
  scoring_range: string | null
  notes: string | null
  onboarding_complete: boolean
}

/**
 * Minimal Supabase Database schema covering only the tables used in this
 * module. Typed with StudentProfileRow so queries are fully type-checked
 * without requiring the full generated Database type.
 */
type StudentProfilesDb = {
  public: {
    Tables: {
      student_profiles: {
        Row: StudentProfileRow
        Insert: StudentProfileRow
        Update: Partial<StudentProfileRow>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/**
 * Returns a typed query builder for the student_profiles table.
 * Uses `as unknown as` — the approved TypeScript double-assertion pattern —
 * to attach our inline schema without introducing `any`.
 */
function profilesTable(client: SupabaseClient) {
  return (client as unknown as SupabaseClient<StudentProfilesDb>).from(
    'student_profiles'
  )
}

/**
 * Safe FormData string extractor.
 * `formData.get()` returns `FormDataEntryValue | null` (string | File | null).
 * This helper narrows to `string | undefined` so callers never receive a File
 * or null and never need an unsafe cast.
 */
function getStr(fd: FormData, key: string): string | undefined {
  const val = fd.get(key)
  return typeof val === 'string' ? val : undefined
}

export async function submitOnboarding(
  _prevState: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const handicapRaw = getStr(formData, 'handicap')
  const raw = {
    full_name: getStr(formData, 'full_name') ?? '',
    phone: getStr(formData, 'phone'),
    handedness: getStr(formData, 'handedness') ?? 'unknown',
    skill_level: getStr(formData, 'skill_level') ?? 'beginner',
    goals: getStr(formData, 'goals'),
    handicap: handicapRaw ? Number(handicapRaw) : null,
    scoring_range: getStr(formData, 'scoring_range'),
    notes: getStr(formData, 'notes'),
  }

  const parsed = OnboardingSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const {
    full_name,
    phone,
    handedness,
    skill_level,
    goals,
    handicap,
    scoring_range,
    notes,
  } = parsed.data

  await supabase.auth.updateUser({ data: { full_name } })

  const profilePayload: StudentProfileRow = {
    user_id: user.id,
    full_name,
    phone: phone || null,
    handedness,
    skill_level,
    goals: goals || null,
    handicap: handicap ?? null,
    scoring_range: scoring_range || null,
    notes: notes || null,
    onboarding_complete: true,
  }

  const { error: profileError } = await profilesTable(supabase).upsert(
    profilePayload,
    { onConflict: 'user_id' }
  )

  if (profileError) {
    console.error('[onboarding] profile upsert error:', profileError)
    return { error: 'Failed to save profile. Please try again.' }
  }

  redirect('/dashboard')
}

export async function getStudentProfile(): Promise<StudentProfileRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await profilesTable(supabase)
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[getStudentProfile]', error)
  }
  return data ?? null
}
