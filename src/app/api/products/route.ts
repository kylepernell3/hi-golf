import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET /api/products — returns all active lesson packages */
export async function GET() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: products, error } = await db
    .from('products')
    .select('id, name, description, sessions_included, price_cents, stripe_price_id')
    .eq('is_active', true)
    .order('sessions_included', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }

  return NextResponse.json({ products })
}
