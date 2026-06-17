import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/** GET /api/products — returns all active lesson packages */
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, sessions_included, price_cents, stripe_price_id')
    .eq('is_active', true)
    .order('sessions_included', { ascending: true })

  if (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }

  return NextResponse.json({ products })
}
