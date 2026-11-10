import { catalogItem, type BillingInterval, type PayablePlan } from "@/lib/billing";
import { isPaidCheckout } from "@/lib/entitlements";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only status of a Checkout Session for /checkout/success.
 * `state`: "paid" (money captured) | "processing" (async method, e.g. bank debit, not settled yet)
 *        | "unpaid" (session open or expired). `paid` is kept for older clients.
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("session_id");
  if (!id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });

  const session = await stripe.checkout.sessions.retrieve(id);
  const paid = isPaidCheckout(session.payment_status);
  const state = paid ? "paid" : session.status === "complete" ? "processing" : "unpaid";

  const plan: PayablePlan =
    session.metadata?.plan === "shield" || (!session.metadata?.plan && session.mode === "subscription") ? "shield" : "kit";
  const interval = (session.metadata?.interval === "year" ? "year" : "month") as BillingInterval;
  const item = catalogItem(plan, interval);

  return NextResponse.json({
    state,
    paid,
    status: session.status,
    payment_status: session.payment_status,
    plan,
    interval,
    email: session.customer_details?.email || session.customer_email || session.metadata?.email || "",
    userId: session.client_reference_id || session.metadata?.userId || "",
    amount: session.amount_total ?? item.amount,
    label: item.label,
    sessionId: session.id,
  });
}
