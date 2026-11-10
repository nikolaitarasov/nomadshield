export type PayablePlan = "kit" | "shield";
export type BillingInterval = "month" | "year";

export const KIT_CENTS = 4900;
export const SHIELD_MONTH_CENTS = 1900;
export const SHIELD_YEAR_CENTS = 19000;

export const ENTITLEMENT_KEY = "nomadshield:entitlement";

/**
 * A verified Stripe Checkout Session remembered on this device.
 * Cloud mode: only a *pending claim* — sent to /api/billing/sync on the next sign-in, never trusted
 * as a plan. Local demo mode (no Supabase): applied directly, since there is no server.
 */
export type Entitlement = {
  sessionId: string;
  plan: PayablePlan;
  interval: BillingInterval;
  email: string;
  verifiedAt: string;
};

export function catalogItem(plan: PayablePlan, interval: BillingInterval = "month") {
  if (plan === "kit") {
    return {
      plan,
      interval: "month" as BillingInterval,
      mode: "payment" as const,
      amount: KIT_CENTS,
      label: "NomadShield Migration Kit",
      description: "One-time 6-step domicile playbook for one target state, form packets, and letter generator.",
      button: "Pay $49 — Migration Kit",
    };
  }
  const yearly = interval === "year";
  return {
    plan,
    interval,
    mode: "subscription" as const,
    amount: yearly ? SHIELD_YEAR_CENTS : SHIELD_MONTH_CENTS,
    label: "NomadShield Audit Shield",
    description: yearly
      ? "Annual 183-day presence log, evidence vault, and defense PDF."
      : "Monthly 183-day presence log, evidence vault, and defense PDF.",
    button: yearly ? "Pay $190/yr — Audit Shield" : "Pay $19/mo — Audit Shield",
  };
}

export function stripeEnabled() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_STRIPE_LINK_KIT ||
      process.env.NEXT_PUBLIC_STRIPE_LINK_SHIELD_MONTH ||
      process.env.NEXT_PUBLIC_STRIPE_LINK_SHIELD_YEAR,
  );
}

export function paymentLinkFor(plan: PayablePlan, interval: BillingInterval) {
  if (plan === "kit") return process.env.NEXT_PUBLIC_STRIPE_LINK_KIT || "";
  if (interval === "year") return process.env.NEXT_PUBLIC_STRIPE_LINK_SHIELD_YEAR || "";
  return process.env.NEXT_PUBLIC_STRIPE_LINK_SHIELD_MONTH || "";
}

export function priceIdFor(plan: PayablePlan, interval: BillingInterval) {
  if (plan === "kit") return process.env.STRIPE_PRICE_KIT || "";
  if (interval === "year") return process.env.STRIPE_PRICE_SHIELD_YEAR || "";
  return process.env.STRIPE_PRICE_SHIELD_MONTH || "";
}

export function saveEntitlement(e: Entitlement) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(e));
}

export function loadEntitlement(): Entitlement | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Entitlement;
  } catch {
    return null;
  }
}

export function clearEntitlement() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ENTITLEMENT_KEY);
  } catch {
    /* storage blocked */
  }
}
