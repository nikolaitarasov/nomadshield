import {
  applyPurchaseEvent,
  claimByCheckoutSession,
  claimByEmail,
  isMissingTable,
  recomputePlan,
  refFromCheckoutSession,
} from "@/lib/billing-server";
import { isPaidCheckout } from "@/lib/entitlements";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/billing/sync  (Authorization: Bearer <supabase access token>)
 * body: { sessionId?: string }
 *
 * Server-authoritative plan refresh for the signed-in user:
 *  1. If a Checkout Session id is given, verify it with Stripe and record it (covers a webhook that
 *     is late, misconfigured, or a purchase made before the account existed).
 *  2. Claim any unowned purchases paid with the user's verified email.
 *  3. Recompute profiles.plan from purchases and return it.
 */
export async function POST(request: Request) {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const { data: auth } = token ? await sb.auth.getUser(token) : { data: { user: null } };
  const user = auth.user;
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { sessionId?: string };
  const sessionId = typeof body.sessionId === "string" && body.sessionId.startsWith("cs_") ? body.sessionId : "";
  const stripe = getStripe();
  let claimed = false;

  try {
    if (sessionId && stripe) {
      const s = await stripe.checkout.sessions.retrieve(sessionId);
      const ref = await refFromCheckoutSession(stripe, s);
      if (ref.userId && ref.userId !== user.id) {
        return NextResponse.json({ error: "That payment belongs to another account." }, { status: 403 });
      }
      await applyPurchaseEvent(sb, stripe, { ...ref, userId: user.id }, {
        type: "checkout_completed",
        paid: isPaidCheckout(s.payment_status),
      });
      await claimByCheckoutSession(sb, user.id, s.id);
      claimed = true;
    }

    if (user.email && user.email_confirmed_at) {
      claimed = (await claimByEmail(sb, user.id, user.email)) > 0 || claimed;
    }

    try {
      await recomputePlan(sb, user.id);
    } catch (err) {
      if (!isMissingTable({ message: (err as Error).message })) throw err;
    }
  } catch (err) {
    console.error("billing sync", user.id, err);
    return NextResponse.json({ error: "Could not sync billing. Try again in a minute." }, { status: 502 });
  }

  const { data: profile } = await sb.from("profiles").select("plan, billing_interval").eq("id", user.id).maybeSingle();
  return NextResponse.json({
    plan: (profile?.plan as string) || "free",
    interval: profile?.billing_interval === "year" ? "year" : "month",
    claimed,
  });
}
