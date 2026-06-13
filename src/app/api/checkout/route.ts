import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import stripe from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // --- Parse body ---
    const body = await req.json();
    const { productId } = body as { productId?: string };

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // --- Supabase server client ---
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // --- Require authenticated user ---
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Load product from database ---
    // Assumes a `price_cents` column (integer, cents) exists on the products table.
    // Adjust the column name if your schema uses a different field (e.g. `amount_cents`, `price`).
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, sessions_included, is_active, price_cents")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.is_active) {
      return NextResponse.json(
        { error: "This product is no longer available" },
        { status: 400 }
      );
    }

    // --- Resolve redirect URLs ---
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    const successUrl =
      process.env.CHECKOUT_SUCCESS_URL ??
      `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl =
      process.env.CHECKOUT_CANCEL_URL ??
      `${baseUrl}/dashboard?checkout=cancelled`;

    // --- Create Stripe Checkout Session ---
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            // Server-authoritative: never trust a client-submitted amount.
            unit_amount: product.price_cents,
            product_data: {
              name: product.name,
            },
          },
          quantity: 1,
        },
      ],
      // Metadata must carry everything the webhook needs to credit the student.
      metadata: {
        student_id: user.id,
        product_id: product.id,
        sessions_included: String(product.sessions_included),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[POST /api/checkout] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
