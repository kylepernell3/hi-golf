'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitOnboarding } from '@/app/actions/onboarding'

// ── Types ────────────────────────────────────────────────────────────
type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean }
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

const INITIAL_STATE: FormState = { error: undefined, success: false }

const INITIAL_VALUES: FormValues = {
  full_name:     '',
  phone:         '',
  handedness:    'right',
  skill_level:   'beginner',
  goals:         '',
  handicap:      '',
  scoring_range: '',
  notes:         '',
}

// ── Step 1 validation ────────────────────────────────────────────────
function validateStep1(v: FormValues): string | null {
  if (!v.full_name.trim()) return 'Full name is required.'
  return null
}

// ── Sub-components ───────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full py-3.5 rounded-xl bg-amber-500 text-zinc-950
        text-sm font-semibold transition-all duration-150
        hover:opacity-90 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
    >
      {pending ? 'Saving your profile…' : 'Complete Setup'}
    </button>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-300 mb-1.5">
      {children}
    </label>
  )
}

const inputCls = `
  w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
  px-4 py-3 text-white text-sm placeholder-zinc-600
  focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50
  transition-all duration-150
`

const textareaCls = `
  w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl
  px-4 py-3 text-white text-sm placeholder-zinc-600 resize-none
  focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50
  transition-all duration-150
`

type SegmentOption<T extends string> = { value: T; label: string }

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
    <div id={id} className="flex bg-zinc-800/60 rounded-xl p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${value === opt.value
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Progress Indicator ───────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col items-center mb-10">
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`
              rounded-full transition-all duration-300
              ${i + 1 === current
                ? 'w-7 h-2 bg-amber-500'
                : i + 1 < current
                  ? 'w-2 h-2 bg-emerald-500'
                  : 'w-2 h-2 bg-zinc-700'}
            `}
          />
        ))}
      </div>
      <p className="text-zinc-500 text-xs font-medium tracking-wide">
        Step {current} of {total}
      </p>
    </div>
  )
}

// ── Step content helpers ─────────────────────────────────────────────
function Step1({
  values,
  onChange,
}: {
  values: FormValues
  onChange: (field: keyof FormValues, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Personal Info
        </h2>
        <p className="text-zinc-500 text-sm">Let's start with the basics.</p>
      </div>

      <div>
        <FieldLabel htmlFor="full_name">Full name <span className="text-amber-500">*</span></FieldLabel>
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          required
          value={values.full_name}
          onChange={(e) => onChange('full_name', e.target.value)}
          placeholder="Jane Smith"
          className={inputCls}
        />
      </div>

      <div>
        <FieldLabel htmlFor="phone">Phone number <span className="text-zinc-600 font-normal">(optional)</span></FieldLabel>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+1 555 000 0000"
          className={inputCls}
        />
      </div>
    </div>
  )
}

function Step2({
  values,
  onChange,
}: {
  values: FormValues
  onChange: (field: keyof FormValues, value: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Your Game
        </h2>
        <p className="text-zinc-500 text-sm">Tell us about your golf background.</p>
      </div>

      <div>
        <FieldLabel htmlFor="handedness">Dominant hand</FieldLabel>
        <SegmentControl<FormValues['handedness']>
          id="handedness"
          value={values.handedness}
          onChange={(v) => onChange('handedness', v)}
          options={[
            { value: 'right',   label: 'Right' },
            { value: 'left',    label: 'Left' },
            { value: 'unknown', label: 'Unknown' },
          ]}
        />
      </div>

      <div>
        <FieldLabel htmlFor="skill_level">Skill level</FieldLabel>
        <SegmentControl<FormValues['skill_level']>
          id="skill_level"
          value={values.skill_level}
          onChange={(v) => onChange('skill_level', v)}
          options={[
            { value: 'beginner',      label: 'Beginner' },
            { value: 'intermediate',  label: 'Intermediate' },
            { value: 'advanced',      label: 'Advanced' },
            { value: 'scratch',       label: 'Scratch' },
          ]}
        />
        <p className="text-zinc-600 text-xs mt-2">
          {values.skill_level === 'beginner'     && 'New to golf or fewer than 2 years playing.'}
          {values.skill_level === 'intermediate' && 'Regular player, typically 15–25 handicap.'}
          {values.skill_level === 'advanced'     && 'Consistent player, typically 5–14 handicap.'}
          {values.skill_level === 'scratch'      && 'Scratch or plus handicap.'}
        </p>
      </div>
    </div>
  )
}

function Step3({
  values,
  onChange,
}: {
  values: FormValues
  onChange: (field: keyof FormValues, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Goals &amp; Details
        </h2>
        <p className="text-zinc-500 text-sm">This shapes your training profile and platform experience.</p>
      </div>

      <div>
        <FieldLabel htmlFor="goals">What do you want to improve?</FieldLabel>
        <textarea
          id="goals"
          rows={3}
          value={values.goals}
          onChange={(e) => onChange('goals', e.target.value)}
          placeholder="e.g. Straighter drives, more consistent iron play, lower scores around the green…"
          className={textareaCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor="handicap">Current handicap</FieldLabel>
          <input
            id="handicap"
            type="number"
            min="-10"
            max="54"
            step="0.1"
            value={values.handicap}
            onChange={(e) => onChange('handicap', e.target.value)}
            placeholder="e.g. 18"
            className={inputCls}
          />
        </div>

        <div>
          <FieldLabel htmlFor="scoring_range">Typical score</FieldLabel>
          <input
            id="scoring_range"
            type="text"
            value={values.scoring_range}
            onChange={(e) => onChange('scoring_range', e.target.value)}
            placeholder="e.g. 85–95"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="notes">Anything else to add to your profile? <span className="text-zinc-600 font-normal">(optional)</span></FieldLabel>
        <textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Injuries, schedule preferences, equipment info…"
          className={textareaCls}
        />
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep]       = useState(1)
  const [values, setValues]   = useState<FormValues>(INITIAL_VALUES)
  const [stepError, setStepError] = useState<string | null>(null)

  const [state, formAction] = useFormState<FormState, FormData>(
    submitOnboarding,
    INITIAL_STATE
  )

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setStepError(null)
  }

  function handleNext() {
    if (step === 1) {
      const err = validateStep1(values)
      if (err) { setStepError(err); return }
    }
    setStepError(null)
    setStep((s) => s + 1)
  }

  function handleBack() {
    setStepError(null)
    setStep((s) => s - 1)
  }

  // Success screen
  if (state.success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-400" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            You're all set!
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Your Hi Golf profile is ready. Head to your dashboard to get started.
          </p>
          
            <a href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
          >
            Go to your dashboard →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <p
            className="text-xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Hi<span className="text-amber-500"> Golf</span>
          </p>
          <p className="text-zinc-500 text-xs mt-1">Profile setup</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl px-8 pt-8 pb-8 shadow-2xl shadow-black/40">

          <StepIndicator current={step} total={3} />

          {/* Step content (non-form for steps 1 & 2) */}
          {step < 3 && (
            <div>
              {step === 1 && <Step1 values={values} onChange={handleChange} />}
              {step === 2 && <Step2 values={values} onChange={handleChange} />}

              {/* Inline step validation error */}
              {stepError && (
                <div className="mt-4 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{stepError}</p>
                </div>
              )}

              {/* Navigation */}
              <div className={`mt-8 flex gap-3 ${step === 1 ? '' : ''}`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all duration-150"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3.5 rounded-xl bg-amber-500 text-zinc-950 text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 is a real form so we can submit all data */}
          {step === 3 && (
            <form action={formAction}>
              {/* Hidden inputs carry steps 1 & 2 data */}
              <input type="hidden" name="full_name"   value={values.full_name} />
              <input type="hidden" name="phone"        value={values.phone} />
              <input type="hidden" name="handedness"   value={values.handedness} />
              <input type="hidden" name="skill_level"  value={values.skill_level} />

              <Step3 values={values} onChange={handleChange} />

              {/* Server-side error */}
              {state.error && (
                <div className="mt-5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{state.error}</p>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all duration-150"
                >
                  ← Back
                </button>
                <div className="flex-1">
                  <SubmitButton />
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-6">
          You can update these details anytime from your profile settings.
        </p>

      </div>
    </div>
  )
}
