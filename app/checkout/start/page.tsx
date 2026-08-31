"use client";

import { Logo } from "@/components/marketing";
import { OwnerLine } from "@/components/owner-line";
import { Button } from "@/components/ui";
import { catalogItem, type BillingInterval, type PayablePlan } from "@/lib/billing";
import { startCheckout } from "@/lib/pay-client";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Start() {
  const params = useSearchParams();
  const { session, profile, hydrated } = useApp();
  const plan: PayablePlan = params.get("plan") === "shield" ? "shield" : "kit";
  const [interval, setInterval] = useState<BillingInterval>(
    params.get("interval") === "year" ? "year" : "month",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const item = catalogItem(plan, interval);

  useEffect(() => {
    fetch("/api/checkout")
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  async function pay() {
    setLoading(true);
    setError("");
    try {
      await startCheckout({
        plan,
        interval,
        email: session?.email || profile?.email,
        userId: session?.userId || profile?.id,
      });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-glow">
      <div className="px-4 py-4">
        <Logo />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <p className="text-[11px] uppercase tracking-wider text-accent">Secure checkout</p>
        <h1 className="mt-2 text-2xl font-semibold">{item.label}</h1>
        <p className="mt-2 text-sm text-muted">{item.description}</p>

        {plan === "shield" && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInterval("month")}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                interval === "month" ? "border-accent text-accent" : "border-border",
              )}
            >
              $19/mo
            </button>
            <button
              type="button"
              onClick={() => setInterval("year")}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                interval === "year" ? "border-accent text-accent" : "border-border",
              )}
            >
              $190/yr
            </button>
          </div>
        )}

        {enabled === false && (
          <p className="mt-4 text-sm text-warning">
            Stripe isn’t configured on this deploy. Add <span className="font-mono">STRIPE_SECRET_KEY</span> (or Payment
            Link URLs) in Render environment variables, then redeploy.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <Button className="mt-6 w-full" onClick={pay} loading={loading} disabled={enabled === false || !hydrated}>
          {item.button}
        </Button>
        <p className="mt-3 text-xs text-muted">
          You’ll pay on Stripe’s hosted checkout. Card details never touch NomadShield servers. Paying confirms you
          accept the{" "}
          <Link href="/terms" className="text-accent hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <Link href="/pricing" className="mt-6 text-sm text-muted hover:text-foreground">
          ← Back to pricing
        </Link>
      </div>
      <div className="px-4 pb-8">
        <OwnerLine className="text-center" />
      </div>
    </div>
  );
}

export default function CheckoutStartPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading checkout…</div>}>
      <Start />
    </Suspense>
  );
}
