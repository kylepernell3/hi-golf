import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function sendMagicLink(formData: FormData) {
  'use server'
  const email = (formData.get('email') as string)?.trim()
  if (!email) redirect('/login?error=email-required&mode=magic')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback` },
  })
  if (error) { console.error('[login] OTP error:', error.message); redirect('/login?error=send-failed&mode=magic') }
  redirect('/login?sent=1&mode=magic')
}

async function signInWithPassword(formData: FormData) {
  'use server'
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  if (!email || !password) redirect('/login?error=fields-required&mode=password')
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) { console.error('[login] Password error:', error.message); redirect('/login?error=invalid-credentials&mode=password') }
  redirect('/dashboard')
}

const ERROR_COPY: Record<string, string> = {
  'email-required': 'Please enter your email address.',
  'send-failed': "We couldn't send a login link. Please try again.",
  'fields-required': 'Please enter both your email and password.',
  'invalid-credentials': 'Incorrect email or password.',
}

const inputCls = 'w-full rounded-lg bg-zinc-800/70 border border-zinc-700/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors duration-150'
const labelCls = 'block text-[10px] tracking-[0.18em] uppercase text-zinc-500 mb-1.5'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; mode?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
  const params = await searchParams
  const sent = params.sent === '1'
  const errKey = params.error ?? ''
  const errMsg = errKey ? (ERROR_COPY[errKey] ?? 'Something went wrong.') : null
  const mode = params.mode === 'password' ? 'password' : 'magic'
  return (
    <>
      {/* Enhancement 4: thin top gradient bar */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-50 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent 0%, rgba(120,53,15,0.40) 30%, rgba(180,83,9,0.40) 50%, rgba(120,53,15,0.40) 70%, transparent 100%)' }}
      />

      <div className="relative min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-5 py-20 overflow-hidden">
        {/* Existing gold glow at top */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(217,119,6,0.08) 0%, transparent 65%)' }} />

        {/* Enhancement 2: subtle green radial glow at bottom */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 105%, rgba(5,150,105,0.04) 0%, transparent 65%)' }} />

        <div className="relative w-full max-w-[380px] flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-3 select-none">
            <GolfFlagIcon />
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-white font-light tracking-[0.24em] text-[1.85rem] leading-none" style={{ fontFamily: 'Georgia, serif' }}>HI GOLF</h1>
              {/* Enhancement 3: two-line tagline */}
              <span className="text-[9px] tracking-[0.35em] uppercase text-zinc-600">Student Portal</span>
              <span className="text-[8px] tracking-[0.28em] uppercase text-stone-500 mt-0.5">Elevate Your Game</span>
            </div>
          </div>

          {/* Enhancement 1: left green accent bar via relative wrapper */}
          <div className="w-full relative">
            {/* Left-side vertical green accent bar */}
            <div
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(5,150,105,0.30) 0%, rgba(16,185,129,0.60) 50%, rgba(5,150,105,0.30) 100%)' }}
            />

            <div className="w-full rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/40">
              <div className="relative flex border-b border-zinc-800/80">
                <a href="/login?mode=magic" className={['flex-1 text-center py-3.5 text-[10px] tracking-[0.18em] uppercase transition-colors duration-150', mode === 'magic' ? 'text-amber-400 font-medium' : 'text-zinc-500 hover:text-zinc-300'].join(' ')}>Magic Link</a>
                <a href="/login?mode=password" className={['flex-1 text-center py-3.5 text-[10px] tracking-[0.18em] uppercase transition-colors duration-150', mode === 'password' ? 'text-amber-400 font-medium' : 'text-zinc-500 hover:text-zinc-300'].join(' ')}>Password</a>
                <div aria-hidden className="absolute bottom-0 h-px bg-amber-500/80 transition-all duration-200" style={{ width: '50%', left: mode === 'magic' ? '0%' : '50%' }} />
              </div>
              <div className="p-7 pt-6">
                {errMsg && <div className="mb-5 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3"><p className="text-[13px] text-red-300">{errMsg}</p></div>}
                {sent && mode === 'magic' && <div className="mb-5 rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-4 py-3"><p className="text-[13px] text-emerald-300">Link sent. Check your inbox and click to sign in.</p></div>}
                {mode === 'magic' && (
                  <form action={sendMagicLink} className="flex flex-col gap-4">
                    <label htmlFor="email-otp" className={labelCls}>Email Address</label>
                    <input id="email-otp" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputCls} />
                    {/* Enhancement 5: inner shadow + ⛳ emoji on button */}
                    <button
                      type="submit"
                      className="mt-1 w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold tracking-wide py-2.5 transition-colors duration-150"
                      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
                    >
                      ⛳ Send Login Link
                    </button>
                    <p className="text-center text-[11px] text-zinc-600 mt-0.5">We'll email you a secure one-time link.<br />No password required.</p>
                  </form>
                )}
                {mode === 'password' && (
                  <form action={signInWithPassword} className="flex flex-col gap-4">
                    <label htmlFor="email-pw" className={labelCls}>Email Address</label>
                    <input id="email-pw" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputCls} />
                    <label htmlFor="password" className={labelCls}>Password</label>
                    <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className={inputCls} />
                    {/* Enhancement 5: inner shadow + ⛳ emoji on button */}
                    <button
                      type="submit"
                      className="mt-1 w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold tracking-wide py-2.5 transition-colors duration-150"
                      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
                    >
                      ⛳ Sign In
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-700 text-center">Access is by invitation only.<br />Contact your instructor to get set up.</p>
        </div>
      </div>
    </>
  )
}

function GolfFlagIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5 L32 12 L12 19 Z" fill="#f59e0b" opacity="0.9" />
      <line x1="6" y1="35" x2="34" y2="35" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
