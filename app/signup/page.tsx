"use client";

import { CheckoutModal } from "@/components/app-shell";
import { Logo } from "@/components/marketing";
import { Button, Field, Input } from "@/components/ui";
import { DISCLAIMER_SHORT, DISCLAIMER_VERSION } from "@/lib/constants";
import { applyCalculatorDraft, useApp } from "@/lib/store";
import { loadDraft } from "@/lib/calculator";
import type { Plan } from "@/lib/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SignupForm() {
  const { signup, setPlan, updateProfile, joinConcierge } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const intended = (params.get("plan") as Plan | null) || "kit";
  const waitlist = params.get("waitlist") === "1";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkout, setCheckout] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) {
      setError("Please confirm the disclaimer.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await signup(email, password, name);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Could not sign up");
      return;
    }
    const draft = loadDraft();
    if (draft) updateProfile(applyCalculatorDraft(draft, { fullName: name, disclaimerVersion: DISCLAIMER_VERSION }));
    else updateProfile({ fullName: name, disclaimerVersion: DISCLAIMER_VERSION });
    if (waitlist) joinConcierge();
    if (intended === "kit" || intended === "shield") setCheckout(true);
    else router.push("/app/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col bg-glow">
      <div className="px-4 py-4">
        <Logo />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">
          {intended === "shield" ? "Audit Shield after a 6-step kit." : "Migration Kit is $49 one-time. Stripe is mocked."}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Field label="Legal name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex Rivera" />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field>
          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-emerald-400"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>{DISCLAIMER_SHORT}</span>
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Continue
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
          {" · "}
          <Link href="/login" className="text-accent hover:underline">
            Try the demo
          </Link>
        </p>
      </div>
      <CheckoutModal
        open={checkout}
        onClose={() => router.push("/app/onboarding")}
        plan={intended === "shield" ? "shield" : "kit"}
        onConfirm={(interval) => {
          setPlan(intended === "shield" ? "shield" : "kit", interval);
          router.push("/app/onboarding");
        }}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
