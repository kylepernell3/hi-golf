import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Auth callback handler.
 * Called after a magic link click or OAuth redirect.
 * Exchanges the PKCE code for a session, then redirects to /dashboard.
 *
 * Supabase redirects here as:
 *   /auth/callback?code=<auth_code>&next=/dashboard
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] code exchange failed:', error.message)
      return NextResponse.redirect(
        new URL(`/login?error=callback-failed`, url.origin)
      )
    }
  }

  // Redirect to the intended destination (default: /dashboard)
  // Ensure we only redirect to relative paths to prevent open redirect
  const safeNext = next.startsWith('/') ? next : '/dashboard'
  return NextResponse.redirect(new URL(safeNext, url.origin))
}
