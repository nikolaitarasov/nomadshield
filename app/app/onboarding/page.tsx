"use client";

import { Button, Field, Input, Select } from "@/components/ui";
import { loadDraft } from "@/lib/calculator";
import { INCOME_TYPES, MAILBOX_PROVIDERS } from "@/lib/constants";
import { TARGET_STATES, US_STATES } from "@/lib/states";
import { useApp } from "@/lib/store";
import type { FilingStatus, IncomeType, MailboxProviderId, TargetState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading onboarding…</div>}>
      <OnboardingInner />
    </Suspense>
  );
}

function OnboardingInner() {
  const { profile, completeOnboarding, hydrated } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(params.get("mailbox") === "1" ? 2 : 0);
  const [fullName, setFullName] = useState("");
  const [fromState, setFromState] = useState("CA");
  const [targetState, setTargetState] = useState<TargetState>("FL");
  const [taxYearStart, setTaxYearStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [income, setIncome] = useState(0);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [owns, setOwns] = useState(false);
  const [provider, setProvider] = useState<MailboxProviderId | "">("");
  const [hasMailbox, setHasMailbox] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const draft = loadDraft();
    const p = profile;
    setFullName(p?.fullName || "");
    setFromState(p?.fromState || draft?.fromState || "CA");
    setTargetState((p?.targetState || draft?.targetState || "FL") as TargetState);
    setTaxYearStart(p?.taxYearStart || `${new Date().getFullYear()}-01-01`);
    setIncome(p?.annualIncome || draft?.income || 0);
    setFilingStatus(p?.filingStatus || draft?.filingStatus || "single");
    setIncomeTypes(p?.incomeTypes?.length ? p.incomeTypes : draft?.incomeTypes || []);
    setOwns(p?.ownsPropertyInFromState || draft?.ownsProperty || false);
    setHasMailbox(Boolean(p?.mailboxProvider) || Boolean(draft?.hasMailbox));
    setProvider((p?.mailboxProvider || draft?.mailboxProvider || "") as MailboxProviderId | "");
  }, [hydrated, profile]);

  function toggleType(id: IncomeType) {
    setIncomeTypes((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function saveAndFinish() {
    completeOnboarding({
      fullName,
      fromState,
      targetState,
      taxYearStart,
      annualIncome: income,
      filingStatus,
      incomeTypes,
      ownsPropertyInFromState: owns,
      mailboxProvider: hasMailbox ? provider : "",
      mailboxAddress: {
        ...(profile?.mailboxAddress ?? {
          path: "",
          provider: "",
          street: "",
          unit: "",
          city: "",
          state: targetState,
          zip: "",
          mailboxId: "",
          form1583: "not_started",
          webhookUrl: "",
          inboundAlias: "",
        }),
        provider: hasMailbox ? provider : "",
        path: hasMailbox ? "connect" : profile?.mailboxAddress.path || "",
        state: targetState,
      },
    });
    router.push(hasMailbox ? "/app/checklist/1" : "/app");
  }

  const screens = [
    {
      title: "Who’s moving",
      body: (
        <div className="space-y-3">
          <Field label="Legal name">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Former state">
            <Select value={fromState} onChange={(e) => setFromState(e.target.value)}>
              {US_STATES.map((s) => (
                <option key={s.abbr} value={s.abbr}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Filing status">
            <Select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}>
              <option value="single">Single</option>
              <option value="married_jointly">Married filing jointly</option>
            </Select>
          </Field>
          <Field label="Tax year start">
            <Input type="date" value={taxYearStart} onChange={(e) => setTaxYearStart(e.target.value)} />
          </Field>
        </div>
      ),
    },
    {
      title: "Target domicile",
      body: (
        <div className="space-y-3">
          <div className="grid gap-2">
            {TARGET_STATES.map((s) => (
              <button
                key={s.abbr}
                type="button"
                onClick={() => setTargetState(s.abbr)}
                className={cn(
                  "rounded-xl border p-4 text-left",
                  targetState === s.abbr ? "border-accent bg-accent/10" : "border-border",
                )}
              >
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-xs text-muted">{s.pitch}</p>
              </button>
            ))}
          </div>
          {targetState === "SD" && (
            <p className="text-xs text-warning">
              SD is not the default. W-2 employees: Florida is usually safer for payroll and banking.
            </p>
          )}
          <Field label="Annual income subject to former-state tax">
            <Input type="number" value={income || ""} onChange={(e) => setIncome(Number(e.target.value) || 0)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {INCOME_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleType(t.id as IncomeType)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  incomeTypes.includes(t.id as IncomeType)
                    ? "border-accent text-accent"
                    : "border-border text-muted",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={owns} onChange={(e) => setOwns(e.target.checked)} className="size-4 accent-emerald-400" />
            I own property in the former state
          </label>
        </div>
      ),
    },
    {
      title: "Mailbox",
      body: (
        <div className="space-y-3">
          <p className="text-sm text-muted">You already pay $10–20/mo for a mailbox. Keep it.</p>
          <Field label="Do you already have a virtual mailbox?">
            <Select value={hasMailbox ? "yes" : "no"} onChange={(e) => setHasMailbox(e.target.value === "yes")}>
              <option value="no">Not yet</option>
              <option value="yes">Yes — I’ll connect it</option>
            </Select>
          </Field>
          {hasMailbox && (
            <Field label="Provider">
              <Select value={provider} onChange={(e) => setProvider(e.target.value as MailboxProviderId)}>
                <option value="">Select…</option>
                {MAILBOX_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      ),
    },
  ];

  const current = screens[step];

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs text-muted">Onboarding {step + 1} / 3</p>
      <h1 className="mt-1 text-2xl font-semibold">{current.title}</h1>
      <div className="mt-6">{current.body}</div>
      <div className="mt-8 flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < 2 ? (
          <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button className="flex-1" onClick={saveAndFinish}>
            Open my playbook
          </Button>
        )}
      </div>
    </div>
  );
}
