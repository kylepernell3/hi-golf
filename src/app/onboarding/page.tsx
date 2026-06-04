'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitOnboarding } from '@/app/actions/onboarding'
import type { OnboardingFormState } from '@/app/actions/onboarding'

// -- Types
// OnboardingFormState is imported from the action file — not redefined here.
type FormValues = {
  full_name: string
  phone: string
  handedness: 'right' | 'left' | 'unknown'
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'scratch'
  goals: string
  handicap: string
  scoring_range: string
  notes: string
}

const INITIAL_STATE: OnboardingFormState = { error: undefined, success: false }
const INITIAL_VALUES: FormValues = {
  full_name: '',
  phone: '',
  handedness: 'right',
  skill_level: 'beginner',
  goals: '',
  handicap: '',
  scoring_range: '',
  notes: '',
}

function validateStep1(v: FormValues): string | null {
  if (!v.full_name.trim()) return 'Full name is required.'
  return null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
    >
      {pending ? 'Saving your profile…' : 'Complete Setup'}
    </button>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-zinc-400 mb-1.5">
      {children}
    </label>
  )
}

type SegmentOption<T> = { value: T; label: string }
function SegmentControl<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string
  value: T
  onChange: (v: T) => void
  options: SegmentOption<T>[]
}) {
  return (
    <div id={id} className="flex gap-1 bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            value === opt.value
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
