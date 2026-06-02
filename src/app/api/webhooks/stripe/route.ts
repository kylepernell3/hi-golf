import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { creditPurchase } from '@/services/ledger'
import Stripe from 'stripe'

// Must use raw body — disable bodyParser
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only handle completed checkout sessions
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const studentId = session.metadata?.student_id
  const productId = session.metadata?.product_id
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id

  if (!studentId || !productId || !paymentIntentId) {
    console.error('[stripe-webhook] missing metadata', { studentId, productId, paymentIntentId })
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  // Idempotency guard — check if this payment intent was already credited
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from('credit_ledger')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (existing) {
    console.log('[stripe-webhook] duplicate event, skipping:', paymentIntentId)
    return NextResponse.json({ received: true })
  }

  // Fetch the product to get sessions_included
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('sessions_included')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    console.error('[stripe-webhook] product not found:', productId)
    return NextResponse.json({ error: 'Product not found' }, { status: 400 })
  }

  // Credit the student
  await creditPurchase({
    studentId,
    sessionsIncluded: product.sessions_included,
    productId,
    stripePaymentIntentId: paymentIntentId,
  })

  console.log(`[stripe-webhook] credited ${product.sessions_included} session(s) to ${studentId}`)
  return NextResponse.json({ received: true })
}
