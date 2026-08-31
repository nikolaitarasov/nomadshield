import { catalogItem, type BillingInterval, type PayablePlan } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("session_id");
  if (!id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });

  const session = await stripe.checkout.sessions.retrieve(id);
  const paid = session.payment_status === "paid" || session.status === "complete";

  const plan = (session.metadata?.plan === "shield" ? "shield" : "kit") as PayablePlan;
  const interval = (session.metadata?.interval === "year" ? "year" : "month") as BillingInterval;
  const item = catalogItem(plan, interval);

  if (!paid && session.status !== "complete") {
    return NextResponse.json({
      paid: false,
      status: session.status,
      payment_status: session.payment_status,
    });
  }

  return NextResponse.json({
    paid: true,
    plan,
    interval,
    email: session.customer_details?.email || session.customer_email || session.metadata?.email || "",
    userId: session.client_reference_id || session.metadata?.userId || "",
    amount: session.amount_total ?? item.amount,
    label: item.label,
    sessionId: session.id,
  });
}
