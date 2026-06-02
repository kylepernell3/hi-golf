import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { productId } = body

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  // Fetch the product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, stripe_price_id, is_active')
    .eq('id', productId)
    .eq('is_active', true)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (!product.stripe_price_id) {
    return NextResponse.json({ error: 'Product has no Stripe price configured' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await createCheckoutSession({
    priceId: product.stripe_price_id,
    studentId: user.id,
    productId: product.id,
    successUrl: `${appUrl}/dashboard?purchase=success`,
    cancelUrl: `${appUrl}/dashboard/credits?purchase=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
