"use client";

import { Logo } from "@/components/marketing";
import { OwnerLine } from "@/components/owner-line";
import { Button } from "@/components/ui";
import { saveEntitlement, type BillingInterval, type PayablePlan } from "@/lib/billing";
import { useApp } from "@/lib/store";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Success() {
  const params = useSearchParams();
  const router = useRouter();
  const { session, setPlan, hydrated } = useApp();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setState("error");
      setMessage("Missing Stripe session. If you paid, check your email receipt and log in.");
      return;
    }
    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !data.paid) throw new Error(data.error || "Payment not confirmed yet.");
        const plan = data.plan as PayablePlan;
        const interval = data.interval as BillingInterval;
        saveEntitlement({
          sessionId: data.sessionId,
          plan,
          interval,
          email: data.email || session?.email || "",
          verifiedAt: new Date().toISOString(),
        });
        if (session) setPlan(plan, interval);
        setLabel(data.label || (plan === "kit" ? "Migration Kit" : "Audit Shield"));
        setState("ok");
      })
      .catch((err: Error) => {
        setState("error");
        setMessage(err.message);
      });
  }, [hydrated, params, session, setPlan]);

  return (
    <div className="flex min-h-screen flex-col bg-glow">
      <div className="px-4 py-4">
        <Logo />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        {state === "loading" && <p className="text-sm text-muted">Confirming your Stripe payment…</p>}
        {state === "ok" && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-accent">Payment confirmed</p>
            <h1 className="mt-2 text-2xl font-semibold">{label} is active</h1>
            <p className="mt-2 text-sm text-muted">
              Stripe charged the card. Your plan is unlocked on this device
              {session ? " and attached to your account" : ""}.
            </p>
            {session ? (
              <Button className="mt-6 w-full" onClick={() => router.push("/app")}>
                Open dashboard
              </Button>
            ) : (
              <Button className="mt-6 w-full" onClick={() => router.push("/signup?paid=1")}>
                Create your account to keep access
              </Button>
            )}
          </>
        )}
        {state === "error" && (
          <>
            <h1 className="text-2xl font-semibold">We couldn’t confirm that payment</h1>
            <p className="mt-2 text-sm text-muted">{message}</p>
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
