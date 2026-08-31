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
