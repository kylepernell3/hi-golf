'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitOnboarding } from '@/app/actions/onboarding'
import { useState, useRef } from 'react'

type ActionState = { error?: string } | null

const STEPS = [
  { num: 1, label: 'Profile', title: 'About You', sub: 'Your name and contact details.' },
  { num: 2, label: 'Game', title: 'Your Game', sub: 'Tell us about your experience.' },
  { num: 3, label: 'Goals', title: 'Your Goals', sub: 'What are you working toward?' },
] as const

const inputCls =
  'w-full rounded-lg bg-zinc-800/70 border border-zinc-700/50 px-4 py-2.5 ' +
  'text-sm text-white placeholder-zinc-600 ' +
  'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 ' +
  'transition-colors duration-150'
const selectCls =
  'w-full rounded-lg bg-zinc-800/70 border border-zinc-700/50 px-4 py-2.5 ' +
  'text-sm text-white ' +
  'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 ' +
  'transition-colors duration-150 appearance-none'
const textareaCls =
  'w-full rounded-lg bg-zinc-800/70 border border-zinc-700/50 px-4 py-3 ' +
  'text-sm text-white placeholder-zinc-600 resize-none leading-relaxed ' +
  'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 ' +
  'transition-colors duration-150'
const labelCls = 'block text-[10px] tracking-[0.18em] uppercase text-zinc-500 mb-1.5'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between mb-1.5">
        <label className={labelCls}>{label}</label>
        {hint && <span className="text-[10px] text-zinc-600 italic">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 text-sm font-semibold tracking-wide py-2.5 transition-colors duration-150"
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
          Saving…
        </>
      ) : (
        'Complete Setup'
      )}
    </button>
  )
}

export default function OnboardingPage() {
  const [state, formAction] = useFormState(
    submitOnboarding as (state: ActionState, payload: FormData) => Promise<ActionState>,
    null
  )
  const [step, setStep] = useState(1)
  const [clientError, setClientError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function validateAndAdvance() {
    setClientError(null)
    const form = formRef.current
    if (!form) return
    if (step === 1) {
      const name = (form.elements.namedItem('full_name') as HTMLInputElement)?.value?.trim()
      if (!name) { setClientError('Please enter your full name before continuing.'); return }
    }
    setStep((s) => s + 1)
  }

  const displayError = clientError ?? state?.error ?? null
  const currentStep = STEPS[step - 1]

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-5 py-16 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(217,119,6,0.07) 0%, transparent 65%)' }} />

      <div className="relative w-full max-w-[480px] flex flex-col items-center gap-9">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5">
            <GolfFlagIcon small />
            <h1 className="text-white font-light tracking-[0.22em] text-xl leading-none" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>HI GOLF</h1>
          </div>
          <h2 className="text-white text-2xl font-light tracking-tight">Let's get you set up</h2>
          <p className="mt-1 text-sm text-zinc-500">A few quick questions before your first session.</p>
        </div>

        <div className="w-full flex items-start">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={['w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300', step > s.num ? 'bg-amber-500 text-zinc-950' : step === s.num ? 'border border-amber-500 text-amber-400 bg-amber-500/10' : 'border border-zinc-700 text-zinc-600 bg-zinc-800/60'].join(' ')}>
                  {step > s.num ? <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M1.5 6.5 5 10l5.5-7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> : s.num}
                </div>
                <span className={['text-[9px] tracking-[0.16em] uppercase transition-colors duration-300', step >= s.num ? 'text-zinc-400' : 'text-zinc-600'].join(' ')}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3 h-px bg-zinc-800 relative -mt-5">
                  <div className="absolute inset-y-0 left-0 bg-amber-500/50 transition-all duration-500 ease-out" style={{ width: step > s.num ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="w-full rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
          <div className="px-7 pt-6 pb-5 border-b border-zinc-800/60">
            <h3 className="text-white text-base font-medium tracking-tight">{currentStep.title}</h3>
            <p className="text-zinc-500 text-[13px] mt-0.5">{currentStep.sub}</p>
          </div>

          <form ref={formRef} action={formAction} noValidate>
            <div className={step === 1 ? 'block' : 'hidden'}>
              <div className="p-7 flex flex-col gap-5">
                <Field label="Full Name"><input name="full_name" type="text" autoComplete="name" placeholder="Alex Johnson" className={inputCls} /></Field>
                <Field label="Phone Number" hint="optional"><input name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" className={inputCls} /></Field>
              </div>
            </div>

            <div className={step === 2 ? 'block' : 'hidden'}>
              <div className="p-7 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Handedness"><select name="handedness" defaultValue="right" className={selectCls}><option value="right">Right-handed</option><option value="left">Left-handed</option><option value="unknown">Not sure yet</option></select></Field>
                  <Field label="Skill Level"><select name="skill_level" defaultValue="beginner" className={selectCls}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="scratch">Scratch</option></select></Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Handicap Index" hint="optional"><input name="handicap" type="number" min="0" max="54" step="0.1" placeholder="e.g. 18.4" className={inputCls} /></Field>
                  <Field label="Scoring Range" hint="optional"><input name="scoring_range" type="text" placeholder="e.g. 85-95" className={inputCls} /></Field>
                </div>
              </div>
            </div>

            <div className={step === 3 ? 'block' : 'hidden'}>
              <div className="p-7 flex flex-col gap-5">
                <Field label="What are you hoping to achieve?"><textarea name="goals" rows={4} placeholder="Lower my handicap, fix my slice, prep for a tournament..." className={textareaCls} /></Field>
                <Field label="Anything else your instructor should know?" hint="optional"><textarea name="notes" rows={3} placeholder="Injuries, schedule preferences, equipment notes..." className={textareaCls} /></Field>
              </div>
            </div>

            {displayError && (
              <div className="mx-7 mb-1 flex items-start gap-2.5 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3">
                <p className="text-[13px] text-red-300 leading-snug">{displayError}</p>
              </div>
            )}

            <div className="px-7 pb-7 pt-4 flex items-center gap-3">
              {step > 1 && (
                <button type="button" onClick={() => { setClientError(null); setStep((s) => s - 1) }} className="rounded-lg border border-zinc-700/60 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 text-sm font-medium px-5 py-2.5 transition-colors duration-150">
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={validateAndAdvance} className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold tracking-wide py-2.5 transition-colors duration-150">
                  Continue →
                </button>
              ) : (
                <SubmitButton />
              )}
            </div>
          </form>
        </div>

        <p className="text-[11px] text-zinc-700">Step {step} of {STEPS.length} — takes about 2 minutes</p>
      </div>
    </div>
  )
}

function GolfFlagIcon({ small = false }: { small?: boolean }) {
  const size = small ? 'w-6 h-6' : 'w-9 h-9'
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={size} aria-hidden>
      <line x1="12" y1="5" x2="12" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5 L32 12 L12 19 Z" fill="#f59e0b" opacity="0.9" />
      <line x1="6" y1="35" x2="34" y2="35" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
