import { applyPurchaseEvent, interpretStripeEvent } from "@/lib/billing-server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe → purchases state machine (lib/entitlements.ts).
 * Subscribe the endpoint to: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, customer.subscription.updated,
 * customer.subscription.deleted, charge.refunded.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }
  const raw = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ received: true, skipped: "supabase not configured" });

  try {
    const interpreted = await interpretStripeEvent(stripe, event);
    if (!interpreted) return NextResponse.json({ received: true, ignored: event.type });
    const result = await applyPurchaseEvent(sb, stripe, interpreted.ref, interpreted.event);
    return NextResponse.json({ received: true, type: event.type, ...result });
  } catch (err) {
    // 5xx makes Stripe retry with backoff, so a transient DB error never loses a payment.
    console.error("stripe webhook", event.type, event.id, err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
