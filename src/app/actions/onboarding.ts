'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

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

export async function submitOnboarding(
  _prevState: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const raw = {
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string | undefined,
    handedness: formData.get('handedness') as string,
    skill_level: formData.get('skill_level') as string,
    goals: formData.get('goals') as string | undefined,
    handicap: formData.get('handicap') ? Number(formData.get('handicap')) : null,
    scoring_range: formData.get('scoring_range') as string | undefined,
    notes: formData.get('notes') as string | undefined,
  }

  const parsed = OnboardingSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { full_name, phone, handedness, skill_level, goals, handicap, scoring_range, notes } = parsed.data

  // Update auth user display name
  await supabase.auth.updateUser({ data: { full_name } })

  // Upsert student profile — inline object so Supabase TS can infer table shape
  const { error: profileError } = await supabase
    .from('student_profiles')
    .upsert(
      {
        user_id: user.id,
        full_name: full_name,
        phone: phone || null,
        handedness: handedness as 'right' | 'left' | 'unknown',
        skill_level: skill_level as 'beginner' | 'intermediate' | 'advanced' | 'scratch',
        goals: goals || null,
        handicap: handicap ?? null,
        scoring_range: scoring_range || null,
        notes: notes || null,
        onboarding_complete: true,
      },
      { onConflict: 'user_id' }
    )

  if (profileError) {
    console.error('[onboarding] profile upsert error:', profileError)
    return { error: 'Failed to save profile. Please try again.' }
  }

  redirect('/dashboard')
}

// Read-only helper
export async function getStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[getStudentProfile]', error)
  }

  return data ?? null
}
