import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    await fulfill(session);
  }

  return NextResponse.json({ received: true });
}

async function fulfill(session: Stripe.Checkout.Session) {
  const plan = session.metadata?.plan === "shield" ? "shield" : session.metadata?.plan === "kit" ? "kit" : null;
  if (!plan) return;
  const interval = session.metadata?.interval === "year" ? "year" : "month";
  const userId = session.client_reference_id || session.metadata?.userId;
  if (!userId) return;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const sb = createClient(url, key);
  await sb.from("profiles").update({ plan, billing_interval: interval }).eq("id", userId);
}
