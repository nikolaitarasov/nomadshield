// Run: npm test   (Node's built-in runner, no deps)
import assert from "node:assert/strict";
import { test } from "node:test";
import { derivePlan, isPaidCheckout, transition, type PurchaseEvent, type PurchaseStatus } from "./entitlements.ts";

const paid: PurchaseEvent = { type: "checkout_completed", paid: true };
const unpaid: PurchaseEvent = { type: "checkout_completed", paid: false };

test("card checkout activates immediately", () => {
  assert.equal(transition(null, paid), "active");
});

test("bank debit: pending, then settles or fails", () => {
  const p = transition(null, unpaid);
  assert.equal(p, "pending");
  assert.equal(transition(p, { type: "async_payment_succeeded" }), "active");
  assert.equal(transition(p, { type: "async_payment_failed" }), "failed");
});

test("webhook redelivery is idempotent", () => {
  assert.equal(transition("active", paid), "active");
  assert.equal(transition("active", unpaid), "active", "a late unpaid event never downgrades");
  assert.equal(transition("canceled", paid), "canceled", "a replayed checkout never revives a canceled sub");
});

test("subscription lifecycle follows Stripe status", () => {
  let s: PurchaseStatus | null = transition(null, paid);
  s = transition(s, { type: "subscription_updated", status: "past_due" });
  assert.equal(s, "past_due");
  s = transition(s, { type: "subscription_updated", status: "active" });
  assert.equal(s, "active");
  s = transition(s, { type: "subscription_deleted" });
  assert.equal(s, "canceled");
  assert.equal(transition(null, { type: "subscription_updated", status: "unpaid" }), "canceled");
  assert.equal(transition(null, { type: "subscription_updated", status: "trialing" }), "active");
});

test("refunds are terminal and only apply to paid purchases", () => {
  assert.equal(transition("active", { type: "refunded" }), "refunded");
  assert.equal(transition("refunded", { type: "subscription_updated", status: "active" }), "refunded");
  assert.equal(transition("pending", { type: "refunded" }), "pending");
  assert.equal(transition(null, { type: "refunded" }), null);
});

test("unknown future Stripe status neither grants nor ends", () => {
  assert.equal(transition("active", { type: "subscription_updated", status: "brand_new" as never }), "pending");
});

test("derivePlan: shield wins, kit survives shield cancel, nothing → free", () => {
  assert.deepEqual(derivePlan([]), { plan: "free", interval: "month" });
  assert.deepEqual(derivePlan([{ product: "kit", interval: "month", status: "active" }]), { plan: "kit", interval: "month" });
  assert.deepEqual(
    derivePlan([
      { product: "kit", interval: "month", status: "active" },
      { product: "shield", interval: "year", status: "past_due" },
    ]),
    { plan: "shield", interval: "year" },
  );
  assert.deepEqual(
    derivePlan([
      { product: "kit", interval: "month", status: "active" },
      { product: "shield", interval: "month", status: "canceled" },
    ]),
    { plan: "kit", interval: "month" },
  );
  assert.deepEqual(derivePlan([{ product: "shield", interval: "month", status: "refunded" }]), { plan: "free", interval: "month" });
});

test("isPaidCheckout", () => {
  assert.ok(isPaidCheckout("paid"));
  assert.ok(isPaidCheckout("no_payment_required"));
  assert.ok(!isPaidCheckout("unpaid"));
});
