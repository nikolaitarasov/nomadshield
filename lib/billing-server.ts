// Server-only: uses the service-role client and the Stripe secret key. Never import from "use client".
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  derivePlan,
  isPaidCheckout,
  transition,
  type Interval,
  type Product,
  type Purchase,
  type PurchaseEvent,
  type PurchaseStatus,
  type StripeSubscriptionStatus,
} from "./entitlements";

/** What we know about a purchase independent of its status. */
export type PurchaseRef = {
  id: string;
  product: Product;
  interval: Interval;
  userId: string | null;
  email: string;
  checkoutSessionId: string | null;
  customerId: string | null;
};

type PurchaseRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  product: Product;
  billing_interval: Interval;
  status: PurchaseStatus;
};

export type ApplyResult = {
  status: PurchaseStatus | null;
  changed: boolean;
  userId: string | null;
  /** True when the purchases table is missing (002_billing.sql not applied yet). */
  legacy: boolean;
};

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /purchases/.test(error.message ?? "") && /does not exist|schema cache/.test(error.message ?? "");
}

function idOf(v: string | { id: string } | null | undefined) {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

// ─── Stripe objects → PurchaseRef ───────────────────────────────────────────────────────────────

/**
 * Build a PurchaseRef from a Checkout Session. Works for API-created sessions (metadata set by
 * /api/checkout) and Payment Link sessions (no metadata: product inferred from mode).
 */
export async function refFromCheckoutSession(stripe: Stripe, s: Stripe.Checkout.Session): Promise<PurchaseRef> {
  const subscriptionId = idOf(s.subscription);
  const product: Product =
    s.metadata?.plan === "shield" || s.metadata?.plan === "kit"
      ? s.metadata.plan
      : s.mode === "subscription"
        ? "shield"
        : "kit";
  let interval: Interval = s.metadata?.interval === "year" ? "year" : "month";
  if (!s.metadata?.interval && subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    interval = sub.items.data[0]?.price?.recurring?.interval === "year" ? "year" : "month";
  }
  return {
    id: subscriptionId || idOf(s.payment_intent) || s.id,
    product,
    interval: product === "kit" ? "month" : interval,
    userId: s.client_reference_id || s.metadata?.userId || null,
    email: (s.customer_details?.email || s.customer_email || s.metadata?.email || "").toLowerCase(),
    checkoutSessionId: s.id,
    customerId: idOf(s.customer),
  };
}

/** Find the Checkout Session that created a subscription or payment intent (for legacy rows). */
async function sessionFor(stripe: Stripe, by: { subscription: string } | { payment_intent: string }) {
  const list = await stripe.checkout.sessions.list({ ...by, limit: 1 });
  return list.data[0] ?? null;
}

// ─── Stripe webhook event → (ref, PurchaseEvent) ────────────────────────────────────────────────

export async function interpretStripeEvent(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<{ ref: PurchaseRef | { id: string }; event: PurchaseEvent } | null> {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      return { ref: await refFromCheckoutSession(stripe, s), event: { type: "checkout_completed", paid: isPaidCheckout(s.payment_status) } };
    }
    case "checkout.session.async_payment_succeeded":
      return { ref: await refFromCheckoutSession(stripe, event.data.object), event: { type: "async_payment_succeeded" } };
    case "checkout.session.async_payment_failed":
      return { ref: await refFromCheckoutSession(stripe, event.data.object), event: { type: "async_payment_failed" } };
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const pe: PurchaseEvent =
        event.type === "customer.subscription.deleted"
          ? { type: "subscription_deleted" }
          : { type: "subscription_updated", status: sub.status as StripeSubscriptionStatus };
      return { ref: { id: sub.id }, event: pe };
    }
    case "charge.refunded": {
      const charge = event.data.object;
      if (!charge.refunded) return null; // partial refund: keep access
      const pi = idOf(charge.payment_intent);
      if (!pi) return null;
      return { ref: { id: pi }, event: { type: "refunded" } };
    }
    default:
      return null;
  }
}

/** When we only know an id (subscription / payment intent) and have no row yet, rebuild the ref. */
export async function resolveRef(stripe: Stripe, ref: PurchaseRef | { id: string }): Promise<PurchaseRef | null> {
  if ("product" in ref) return ref;
  const s = ref.id.startsWith("sub_")
    ? await sessionFor(stripe, { subscription: ref.id })
    : ref.id.startsWith("pi_")
      ? await sessionFor(stripe, { payment_intent: ref.id })
      : null;
  return s ? refFromCheckoutSession(stripe, s) : null;
}

// ─── Persistence ────────────────────────────────────────────────────────────────────────────────

/**
 * Apply one event to one purchase, persist it, and refresh the owner's plan.
 * Idempotent: replaying the same event is a no-op.
 */
export async function applyPurchaseEvent(
  sb: SupabaseClient,
  stripe: Stripe,
  rawRef: PurchaseRef | { id: string },
  event: PurchaseEvent,
): Promise<ApplyResult> {
  const existingRes = await sb.from("purchases").select("*").eq("id", rawRef.id).maybeSingle<PurchaseRow>();
  if (isMissingTable(existingRes.error)) return applyLegacy(sb, stripe, rawRef, event);
  if (existingRes.error) throw new Error(`purchases read: ${existingRes.error.message}`);
  const existing = existingRes.data;

  const next = transition(existing?.status ?? null, event);
  if (existing && next === existing.status) {
    return { status: next, changed: false, userId: existing.user_id, legacy: false };
  }
  if (!next) return { status: null, changed: false, userId: null, legacy: false };

  const ref = existing ? null : await resolveRef(stripe, rawRef);
  if (!existing && !ref) return { status: null, changed: false, userId: null, legacy: false };

  const now = new Date().toISOString();
  const write = existing
    ? await sb.from("purchases").update({ status: next, updated_at: now }).eq("id", existing.id)
    : await sb.from("purchases").upsert({
        id: ref!.id,
        user_id: ref!.userId,
        email: ref!.email || null,
        product: ref!.product,
        billing_interval: ref!.interval,
        status: next,
        checkout_session_id: ref!.checkoutSessionId,
        stripe_customer_id: ref!.customerId,
        updated_at: now,
      });
  if (write.error) throw new Error(`purchases write: ${write.error.message}`);

  const userId = existing?.user_id ?? ref?.userId ?? null;
  if (userId) await recomputePlan(sb, userId);
  return { status: next, changed: true, userId, legacy: false };
}

/** Before 002_billing.sql is applied: keep the old behavior (grant on paid checkout only). */
async function applyLegacy(
  sb: SupabaseClient,
  stripe: Stripe,
  rawRef: PurchaseRef | { id: string },
  event: PurchaseEvent,
): Promise<ApplyResult> {
  const status = transition(null, event);
  const ref = await resolveRef(stripe, rawRef);
  if (!ref?.userId || status !== "active" || event.type === "subscription_updated") {
    return { status, changed: false, userId: ref?.userId ?? null, legacy: true };
  }
  const { error } = await sb.from("profiles").update({ plan: ref.product, billing_interval: ref.interval }).eq("id", ref.userId);
  if (error) throw new Error(`profiles write: ${error.message}`);
  return { status, changed: true, userId: ref.userId, legacy: true };
}

/**
 * Rewrite profiles.plan from purchases. A user with no purchase rows (paid before purchases
 * existed, demo, or comped by hand) keeps whatever plan they have.
 */
export async function recomputePlan(sb: SupabaseClient, userId: string) {
  const { data, error } = await sb.from("purchases").select("product, billing_interval, status").eq("user_id", userId);
  if (error) throw new Error(`purchases read: ${error.message}`);
  if (!data || data.length === 0) return null;
  const derived = derivePlan(
    data.map((r) => ({ product: r.product, interval: r.billing_interval, status: r.status }) as Purchase),
  );
  const upd = await sb.from("profiles").update({ plan: derived.plan, billing_interval: derived.interval }).eq("id", userId);
  if (upd.error) throw new Error(`profiles write: ${upd.error.message}`);
  return derived;
}

/** Attach unclaimed purchases (paid before signup / while logged out) to a verified email. */
export async function claimByEmail(sb: SupabaseClient, userId: string, email: string) {
  if (!email) return 0;
  const { data, error } = await sb
    .from("purchases")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .is("user_id", null)
    .ilike("email", email.replace(/[\\%_]/g, (c) => `\\${c}`))
    .select("id");
  if (isMissingTable(error)) return 0;
  if (error) throw new Error(`purchases claim: ${error.message}`);
  return data?.length ?? 0;
}

/** Attach one purchase by checkout session id if it is unowned or already this user's. */
export async function claimByCheckoutSession(sb: SupabaseClient, userId: string, checkoutSessionId: string) {
  const { error } = await sb
    .from("purchases")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq("checkout_session_id", checkoutSessionId)
    .is("user_id", null);
  if (error && !isMissingTable(error)) throw new Error(`purchases claim: ${error.message}`);
}

export { isMissingTable };
