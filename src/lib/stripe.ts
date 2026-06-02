import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export default stripe

/** Verify a Stripe webhook signature and return the event */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  return stripe.webhooks.constructEvent(body, signature, secret)
}

/** Create a Stripe Checkout Session for a lesson package */
export async function createCheckoutSession({
  priceId,
  studentId,
  productId,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  studentId: string
  productId: string
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      student_id: studentId,
      product_id: productId,
    },
  })
}
