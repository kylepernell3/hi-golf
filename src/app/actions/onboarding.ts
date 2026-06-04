'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { Handedness, SkillLevel } from '@/types/database'

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
  handedness: Handedness
  skill_level: SkillLevel
  goals: string | null
  handicap: number | null
  scoring_range: string | null
  notes: string | null
  onboarding_complete: boolean
}

/** Safe FormData string extractor. */
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
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const raw = {
    full_name: getStr(formData, 'full_name'),
    phone: getStr(formData, 'phone'),
    handedness: getStr(formData, 'handedness'),
    skill_level: getStr(formData, 'skill_level'),
    goals: getStr(formData, 'goals'),
    handicap: formData.get('handicap')
      ? Number(formData.get('handicap'))
      : undefined,
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

  const payload = {
    user_id: user.id,
    full_name,
    phone: phone ?? null,
    handedness: handedness as Handedness,
    skill_level: skill_level as SkillLevel,
    goals: goals ?? null,
    handicap: handicap ?? null,
    scoring_range: scoring_range ?? null,
    notes: notes ?? null,
    onboarding_complete: true,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await supabase
    .from('student_profiles')
    .upsert(payload as any, { onConflict: 'user_id' })

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

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[getStudentProfile]', error)
    return null
  }

  return data as StudentProfileRow | null
}
