"use client";

import { Logo } from "@/components/marketing";
import { OwnerLine } from "@/components/owner-line";
import { Button } from "@/components/ui";
import { saveEntitlement, type BillingInterval, type PayablePlan } from "@/lib/billing";
import { useApp } from "@/lib/store";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

/**
 * Post-checkout screen. Each `kind` is one thing the buyer can be told; nothing else is shown.
 *
 *   verifying ─► active          paid and attached to the account (or local demo)
 *             ├► needs_account   paid while signed out → create account to claim it
 *             ├► processing      async method (bank debit) not settled; webhook finishes it
 *             ├► attach_failed   paid, but the server couldn't attach it yet → retry
 *             └► error           no session / not paid / Stripe unreachable
 */
type View =
  | { kind: "verifying" }
  | { kind: "active"; label: string }
  | { kind: "needs_account"; label: string }
  | { kind: "processing"; label: string }
  | { kind: "attach_failed"; label: string; message: string }
  | { kind: "error"; message: string };

type SessionStatus = {
  state?: "paid" | "processing" | "unpaid";
  plan: PayablePlan;
  interval: BillingInterval;
  email: string;
  label: string;
  sessionId: string;
  error?: string;
};

function Success() {
  const params = useSearchParams();
  const router = useRouter();
  const { session, setPlan, refreshBilling, hydrated, demoMode } = useApp();
  const [view, setView] = useState<View>({ kind: "verifying" });
  const started = useRef(false);
  const sessionId = params.get("session_id") ?? "";

  const attach = useCallback(
    async (label: string, settled: boolean) => {
      try {
        const res = await refreshBilling(sessionId);
        if (res && res.plan !== "free") setView({ kind: "active", label });
        else if (!settled) setView({ kind: "processing", label });
        else
          setView({
            kind: "attach_failed",
            label,
            message: "Stripe confirmed your payment, but it isn't on your account yet. This usually clears in a few seconds.",
          });
      } catch (err) {
        setView({ kind: "attach_failed", label, message: (err as Error).message });
      }
    },
    [refreshBilling, sessionId],
  );

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    if (!sessionId) {
      setView({ kind: "error", message: "Missing Stripe session. If you paid, check your email receipt and log in." });
      return;
    }
    (async () => {
      const r = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
      const data = (await r.json()) as SessionStatus;
      if (!r.ok) throw new Error(data.error || "Could not reach Stripe.");
      if (data.state === "unpaid") throw new Error("This checkout wasn't completed, so no charge was made.");
      const settled = data.state !== "processing";
      const label = data.label || (data.plan === "kit" ? "Migration Kit" : "Audit Shield");

      // Remember the receipt on this device. Cloud: a claim the server verifies at next sign-in.
      saveEntitlement({
        sessionId: data.sessionId,
        plan: data.plan,
        interval: data.interval,
        email: data.email || session?.email || "",
        verifiedAt: new Date().toISOString(),
      });

      if (demoMode) {
        if (settled && session) setPlan(data.plan, data.interval);
        setView(!settled ? { kind: "processing", label } : session ? { kind: "active", label } : { kind: "needs_account", label });
        return;
      }
      if (!session) {
        setView(settled ? { kind: "needs_account", label } : { kind: "processing", label });
        return;
      }
      await attach(label, settled);
    })().catch((err: Error) => setView({ kind: "error", message: err.message }));
  }, [hydrated, sessionId, session, demoMode, setPlan, attach]);

  return (
    <div className="flex min-h-screen flex-col bg-glow">
      <div className="px-4 py-4">
        <Logo />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16" data-checkout-state={view.kind}>
        {view.kind === "verifying" && <p className="text-sm text-muted">Confirming your Stripe payment…</p>}

        {view.kind === "active" && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-accent">Payment confirmed</p>
            <h1 className="mt-2 text-2xl font-semibold">{view.label} is active</h1>
            <p className="mt-2 text-sm text-muted">Your plan is unlocked on your account. A receipt is on its way from Stripe.</p>
            <Button className="mt-6 w-full" onClick={() => router.push("/app")}>
              Open dashboard
            </Button>
          </>
        )}

        {view.kind === "needs_account" && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-accent">Payment confirmed</p>
            <h1 className="mt-2 text-2xl font-semibold">One step left: create your account</h1>
            <p className="mt-2 text-sm text-muted">
              {view.label} is paid. Create an account (or log in) to attach it. Use the same email as your receipt
              and it attaches on any device.
            </p>
            <Button className="mt-6 w-full" onClick={() => router.push("/signup?paid=1")}>
              Create your account
            </Button>
            <Link href="/login?next=/app" className="mt-3 block text-center text-sm text-accent hover:underline">
              I already have an account
            </Link>
          </>
        )}

        {view.kind === "processing" && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-accent">Payment processing</p>
            <h1 className="mt-2 text-2xl font-semibold">Your bank is confirming the payment</h1>
            <p className="mt-2 text-sm text-muted">
              Bank payments can take a few business days to settle. {view.label} unlocks automatically when Stripe
              confirms it. You don&apos;t need to pay again.
            </p>
            <Button className="mt-6 w-full" onClick={() => router.push(session ? "/app" : "/signup?paid=1")}>
              {session ? "Go to dashboard" : "Create your account"}
            </Button>
          </>
        )}

        {view.kind === "attach_failed" && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-accent">Payment confirmed</p>
            <h1 className="mt-2 text-2xl font-semibold">Attaching {view.label} to your account…</h1>
            <p className="mt-2 text-sm text-muted">{view.message} You won&apos;t be charged again.</p>
            <Button
              className="mt-6 w-full"
              onClick={() => {
                setView({ kind: "verifying" });
                void attach(view.label, true);
              }}
            >
              Try again
            </Button>
          </>
        )}

        {view.kind === "error" && (
          <>
            <h1 className="text-2xl font-semibold">We couldn’t confirm that payment</h1>
            <p className="mt-2 text-sm text-muted">{view.message}</p>
            <Link href="/pricing" className="mt-6 text-sm text-accent hover:underline">
              Back to pricing
            </Link>
          </>
        )}
      </div>
      <div className="px-4 pb-8">
        <OwnerLine className="text-center" />
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted">Confirming…</div>}>
      <Success />
    </Suspense>
  );
}
