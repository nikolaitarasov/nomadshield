"use client";

import { Logo } from "@/components/marketing";
import { OwnerLine } from "@/components/owner-line";
import { Button, Field, Input } from "@/components/ui";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";
import { useApp } from "@/lib/store";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const { login, magicLink, consumeMagic, demoMode } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Could not sign in");
      return;
    }
    router.push(next);
  }

  async function onMagic() {
    setLoading(true);
    setError("");
    const res = await magicLink(email);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Could not send link");
      return;
    }
    if (res.demoToken) {
      setInfo("Demo mode: magic link is mocked. Continue without leaving this page.");
    } else {
      setInfo("Check your email for a magic link.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-glow">
      <div className="px-4 py-4">
        <Logo />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Demo account: <span className="font-mono text-foreground">{DEMO_EMAIL}</span> / {DEMO_PASSWORD}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          {info && <p className="text-sm text-accent">{info}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Log in
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={onMagic} disabled={loading}>
            Email me a magic link
          </Button>
          {info && demoMode && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={async () => {
                const res = await consumeMagic(email);
                if (res.ok) router.push(next);
                else setError(res.error ?? "Failed");
              }}
            >
              Continue with demo magic link
            </Button>
          )}
        </form>
        <p className="mt-6 text-sm text-muted">
          No account?{" "}
          <Link href="/checkout/start?plan=kit" className="text-accent hover:underline">
            Start migration — $49
          </Link>
        </p>
        <OwnerLine className="mt-8" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
