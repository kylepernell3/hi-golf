import { redirect } from 'next/navigation'

/**
 * Root page — redirect unauthenticated visitors to /login.
 * Authenticated users are handled by middleware which
 * sends them directly to /dashboard.
 */
export default function RootPage() {
  redirect('/login')
}
