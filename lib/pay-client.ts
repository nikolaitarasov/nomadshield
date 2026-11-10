import type { BillingInterval, PayablePlan } from "./billing";

export async function startCheckout(opts: {
  plan: PayablePlan;
  interval?: BillingInterval;
  email?: string;
  userId?: string;
}) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan: opts.plan,
      interval: opts.interval ?? "month",
      email: opts.email ?? "",
      userId: opts.userId ?? "",
    }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Could not start Stripe checkout.");
  }
  window.location.href = data.url;
}

export type BillingSync = { plan: "free" | PayablePlan; interval: BillingInterval; claimed: boolean };

/**
 * Ask the server to reconcile the signed-in user's plan with Stripe (see /api/billing/sync).
 * Pass the Checkout Session id when returning from Stripe or holding a pre-signup purchase.
 */
export async function syncBilling(accessToken: string, sessionId?: string): Promise<BillingSync> {
  const res = await fetch("/api/billing/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ sessionId: sessionId || undefined }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<BillingSync> & { error?: string };
  if (!res.ok) throw new Error(data.error || "Could not refresh your plan.");
  return { plan: data.plan ?? "free", interval: data.interval ?? "month", claimed: Boolean(data.claimed) };
}
