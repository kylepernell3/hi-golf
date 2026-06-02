import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import stripe from "@/lib/stripe";
import Stripe from "stripe";

// In the App Router, the request body is NOT auto-parsed —
// req.text() returns the raw body string Stripe needs for signature verification.

export async function POST(req: NextRequest) {
  // --- Raw body + signature ---
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // --- Verify webhook signature ---
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

  // --- Only handle checkout.session.completed for Release 1 ---
  if (event.type !== "checkout.session.completed") {
    // Acknowledge all other event types without error so Stripe stops retrying them.
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // --- Validate required metadata ---
  const { student_id, product_id, sessions_included } =
    session.metadata ?? {};

  if (!student_id || !product_id || !sessions_included) {
    console.error(
      "[stripe/webhook] Missing required metadata on session:",
      session.id,
      session.metadata
    );
    // Return 400 so Stripe retries. If metadata is genuinely absent, retries
    // will keep failing — surface this in the Stripe dashboard immediately.
    return NextResponse.json(
      { error: "Missing required metadata: student_id, product_id, or sessions_included" },
      { status: 400 }
    );
  }

  const delta = parseInt(sessions_included, 10);

  if (isNaN(delta) || delta <= 0) {
    console.error(
      "[stripe/webhook] Invalid sessions_included value:",
      sessions_included
    );
    return NextResponse.json(
      { error: "sessions_included must be a positive integer" },
      { status: 400 }
    );
  }

  // --- Service-role Supabase client ---
  // Webhook handlers have no user auth context; service role bypasses RLS.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // --- Idempotency check ---
  // Use the Stripe event ID as source_id. One ledger entry per event ID.
  // Strongly recommended: add a UNIQUE constraint on credit_ledger(source_id)
  // at the DB level to enforce this even under concurrent delivery.
  const { data: existing, error: lookupError } = await supabase
    .from("credit_ledger")
    .select("id")
    .eq("source_id", event.id)
    .maybeSingle();

  if (lookupError) {
    console.error("[stripe/webhook] Idempotency lookup failed:", lookupError);
    // Return 500 so Stripe retries after a delay.
    return NextResponse.json(
      { error: "Database error during idempotency check" },
      { status: 500 }
    );
  }

  if (existing) {
    // Already credited — acknowledge cleanly without a second insert.
    console.log(
      "[stripe/webhook] Event already processed, skipping:",
      event.id
    );
    return NextResponse.json({ received: true });
  }

  // --- Write ledger entry ---
  // The ledger is append-only. Every purchase is its own positive delta row.
  // Running balances are always derived by summing delta for a given student_id.
  const { error: insertError } = await supabase
    .from("credit_ledger")
    .insert({
      student_id,
      product_id,
      delta,
      entry_type: "purchase",
      source_id: event.id, // Stripe event ID — globally unique, safe idempotency key
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error("[stripe/webhook] Failed to insert ledger entry:", insertError);
    // Return 500 so Stripe retries. The idempotency check above prevents double-crediting on retry.
    return NextResponse.json(
      { error: "Failed to record lesson credits" },
      { status: 500 }
    );
  }

  console.log(
    `[stripe/webhook] Credited ${delta} session(s) to student ${student_id} ` +
      `for product ${product_id} (event ${event.id})`
  );

  return NextResponse.json({ received: true });
}
