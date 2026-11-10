import { catalogItem, paymentLinkFor, priceIdFor, stripeEnabled, type BillingInterval, type PayablePlan } from "@/lib/billing";
import { getStripe, originFromRequest } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    enabled: stripeEnabled(),
    hasSecret: Boolean(process.env.STRIPE_SECRET_KEY),
    hasLinks: Boolean(
      process.env.NEXT_PUBLIC_STRIPE_LINK_KIT ||
        process.env.NEXT_PUBLIC_STRIPE_LINK_SHIELD_MONTH ||
        process.env.NEXT_PUBLIC_STRIPE_LINK_SHIELD_YEAR,
    ),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    plan?: PayablePlan;
    interval?: BillingInterval;
    email?: string;
    userId?: string;
  };
  const plan: PayablePlan = body.plan === "shield" ? "shield" : "kit";
  const interval: BillingInterval = body.interval === "year" ? "year" : "month";
  const email = (body.email || "").trim();
  const userId = (body.userId || "").trim();
  const item = catalogItem(plan, interval);
  const origin = originFromRequest(request);
  const success = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancel = `${origin}/pricing?canceled=1`;

  const stripe = getStripe();
  if (stripe) {
    const price = priceIdFor(plan, interval);
    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      line_items: [
        price
          ? { price, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: item.amount,
                product_data: { name: item.label, description: item.description },
                ...(item.mode === "subscription"
                  ? { recurring: { interval: interval === "year" ? "year" : "month" } }
                  : {}),
              },
            },
      ],
      success_url: success,
      cancel_url: cancel,
      customer_email: email || undefined,
      client_reference_id: userId || undefined,
      metadata: { plan, interval, userId, email },
      // Copied onto the subscription so renewal/cancel webhooks can find the purchase on their own.
      ...(item.mode === "subscription" ? { subscription_data: { metadata: { plan, interval, userId, email } } } : {}),
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });
    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url, id: session.id });
  }

  const link = paymentLinkFor(plan, interval);
  if (link) {
    const url = new URL(link);
    if (email) url.searchParams.set("prefilled_email", email);
    if (userId) url.searchParams.set("client_reference_id", userId);
    return NextResponse.json({ url: url.toString(), mode: "payment_link" });
  }

  return NextResponse.json(
    {
      error:
        "Stripe is not configured. Add STRIPE_SECRET_KEY (or NEXT_PUBLIC_STRIPE_LINK_KIT / SHIELD) on Render.",
    },
    { status: 501 },
  );
}
