import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import stripe from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const { student_id, product_id, sessions_included } = session.metadata ?? {};

  if (!student_id || !product_id || !sessions_included) {
    console.error(
      "[stripe/webhook] Missing required metadata on session:",
      session.id,
      session.metadata
    );
    return NextResponse.json(
      { error: "Missing required metadata: student_id, product_id, or sessions_included" },
      { status: 400 }
    );
  }

  const delta = parseInt(sessions_included, 10);
  if (isNaN(delta) || delta <= 0) {
    console.error("[stripe/webhook] Invalid sessions_included value:", sessions_included);
    return NextResponse.json(
      { error: "sessions_included must be a positive integer" },
      { status: 400 }
    );
  }

  // Use payment_intent as idempotency key (maps to stripe_payment_intent_id column)
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? session.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Idempotency check via stripe_payment_intent_id
  const { data: existing, error: lookupError } = await supabase
    .from("credit_ledger")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (lookupError) {
    console.error("[stripe/webhook] Idempotency lookup failed:", lookupError);
    return NextResponse.json(
      { error: "Database error during idempotency check" },
      { status: 500 }
    );
  }

  if (existing) {
    console.log("[stripe/webhook] Event already processed, skipping:", paymentIntentId);
    return NextResponse.json({ received: true });
  }

  const { error: insertError } = await supabase
    .from("credit_ledger")
    .insert({
      student_id,
      product_id,
      delta,
      entry_type: "purchase",
      stripe_payment_intent_id: paymentIntentId,
    });

  if (insertError) {
    console.error("[stripe/webhook] Failed to insert ledger entry:", insertError);
    return NextResponse.json(
      { error: "Failed to record lesson credits" },
      { status: 500 }
    );
  }

  console.log(
    `[stripe/webhook] Credited ${delta} session(s) to student ${student_id} ` +
    `for product ${product_id} (payment_intent ${paymentIntentId})`
  );

  return NextResponse.json({ received: true });
}
