/**
 * Billing entitlement state machine — the single source of truth for "who has paid for what".
 *
 * Every Stripe-originated fact becomes a PurchaseEvent, `transition()` moves one purchase between
 * PurchaseStatus values, and `derivePlan()` turns a user's purchases into the `profiles.plan` the UI
 * gates on. Pure: no I/O, safe to import from client, server, and scripts.
 *
 *            checkout_completed(paid)              subscription_updated(past_due)
 *   (none) ───────────────────────────► active ◄──────────────────────────────► past_due
 *     │                                   │  ▲                                     │
 *     │ checkout_completed(unpaid)        │  └── async_payment_succeeded ──┐       │
 *     ▼                                   │                                │       │
 *   pending ──────────────────────────────┼────────────────────────────────┘       │
 *     │ async_payment_failed              │ subscription_deleted / canceled status │
 *     ▼                                   ▼                                        ▼
 *   failed                             canceled ◄──────────────────────────────────┘
 *                                          refunded  ◄── refunded (from any paid state)
 *
 * Terminal: failed, canceled (kit never cancels), refunded. A new checkout is a new purchase row.
 */

export type Product = "kit" | "shield";
export type Interval = "month" | "year";

export type PurchaseStatus = "pending" | "active" | "past_due" | "canceled" | "failed" | "refunded";

/** Stripe subscription statuses, kept as a string union so this file has no Stripe dependency. */
export type StripeSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type PurchaseEvent =
  | { type: "checkout_completed"; paid: boolean }
  | { type: "async_payment_succeeded" }
  | { type: "async_payment_failed" }
  | { type: "subscription_updated"; status: StripeSubscriptionStatus }
  | { type: "subscription_deleted" }
  | { type: "refunded" };

export type Purchase = {
  product: Product;
  interval: Interval;
  status: PurchaseStatus;
};

/** Statuses that unlock the product. past_due keeps access during Stripe's dunning retries. */
export const GRANTING: ReadonlySet<PurchaseStatus> = new Set(["active", "past_due"]);
export const TERMINAL: ReadonlySet<PurchaseStatus> = new Set(["failed", "canceled", "refunded"]);

function fromSubscriptionStatus(s: StripeSubscriptionStatus): PurchaseStatus {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "incomplete":
      return "pending";
    case "unpaid":
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return "canceled";
    default:
      // A status Stripe adds later: don't grant, don't end — the next known status resolves it.
      return "pending";
  }
}

/**
 * Next status for one purchase. `current === null` means we have never seen it (webhooks can
 * arrive out of order, so any event may be first). Returns `current` unchanged for events that
 * are not legal from that state, which makes webhook redelivery idempotent.
 */
export function transition(current: PurchaseStatus | null, event: PurchaseEvent): PurchaseStatus | null {
  if (current === "refunded") return current;

  switch (event.type) {
    case "refunded":
      return current && GRANTING.has(current) ? "refunded" : current;

    case "subscription_deleted":
      return "canceled";

    case "subscription_updated":
      // Stripe's subscription status is authoritative once it exists, including un-canceling
      // (a canceled-then-reactivated sub reuses the same id).
      return fromSubscriptionStatus(event.status);

    case "checkout_completed":
      if (current === null || current === "pending") return event.paid ? "active" : "pending";
      return current;

    case "async_payment_succeeded":
      return current === null || current === "pending" ? "active" : current;

    case "async_payment_failed":
      return current === null || current === "pending" ? "failed" : current;
  }
}

export type DerivedPlan = { plan: "free" | Product; interval: Interval };

/**
 * Collapse purchases into the plan the app gates on. Shield includes the kit while it is active;
 * when Shield ends, a separately bought kit still counts.
 */
export function derivePlan(purchases: readonly Purchase[]): DerivedPlan {
  const live = purchases.filter((p) => GRANTING.has(p.status));
  const shield = live.find((p) => p.product === "shield");
  if (shield) return { plan: "shield", interval: shield.interval };
  if (live.some((p) => p.product === "kit")) return { plan: "kit", interval: "month" };
  return { plan: "free", interval: "month" };
}

/** Stripe Checkout payment_status values that mean the money is ours. */
export function isPaidCheckout(paymentStatus: string | null | undefined) {
  return paymentStatus === "paid" || paymentStatus === "no_payment_required";
}
