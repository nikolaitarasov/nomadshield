"use client";

import { Button, Card, DisclaimerNote, Field, Input, Modal, Select } from "@/components/ui";
import { calculate, DEFAULT_INPUTS, loadDraft, saveDraft } from "@/lib/calculator";
import { HIGHLIGHT_STATES, INCOME_TYPES, MAILBOX_PROVIDERS } from "@/lib/constants";
import { useApp } from "@/lib/store";
import { TARGET_STATES, US_STATES } from "@/lib/states";
import type { CalculatorInputs, IncomeType, MailboxProviderId, TargetState } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { AlertTriangle, Check, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function Calculator({ compact }: { compact?: boolean }) {
  const { saveSnapshot, session } = useApp();
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setInputs(draft);
  }, []);

  useEffect(() => {
    saveDraft(inputs);
  }, [inputs]);

  const out = useMemo(() => calculate(inputs), [inputs]);

  const set = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) =>
    setInputs((s) => ({ ...s, [key]: value }));

  const toggleType = (id: IncomeType) => {
    setInputs((s) => {
      const has = s.incomeTypes.includes(id);
      return { ...s, incomeTypes: has ? s.incomeTypes.filter((t) => t !== id) : [...s.incomeTypes, id] };
    });
  };

  const riskTone = out.riskLevel === "High" ? "danger" : out.riskLevel === "Medium" ? "warning" : "accent";

  return (
    <div id="calculator" className={cn("w-full", compact && "max-w-xl")}>
      <Card className="shadow-[0_0_0_1px_rgba(52,211,153,0.08),0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Domicile savings & audit risk</p>
            <h2 className="mt-1 text-base font-semibold">See the number before you talk to anyone</h2>
          </div>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">Live · not advice</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="From state">
            <Select value={inputs.fromState} onChange={(e) => set("fromState", e.target.value)}>
              <optgroup label="High-audit states">
                {US_STATES.filter((s) => HIGHLIGHT_STATES.includes(s.abbr as (typeof HIGHLIGHT_STATES)[number])).map((s) => (
                  <option key={s.abbr} value={s.abbr}>
                    {s.name} ({s.topRate}%)
                  </option>
                ))}
              </optgroup>
              <optgroup label="All states + DC">
                {US_STATES.map((s) => (
                  <option key={s.abbr} value={s.abbr}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </Select>
          </Field>
          <Field label="Filing status">
            <Select
              value={inputs.filingStatus}
              onChange={(e) => set("filingStatus", e.target.value as CalculatorInputs["filingStatus"])}
            >
              <option value="single">Single</option>
              <option value="married_jointly">Married filing jointly</option>
            </Select>
          </Field>
          <Field label="Annual income subject to former-state tax" className="sm:col-span-2">
            <Input
              type="number"
              min={0}
              inputMode="decimal"
              value={inputs.income || ""}
              onChange={(e) => set("income", Number(e.target.value) || 0)}
            />
          </Field>
        </div>

        <p className="mt-3 mb-1.5 text-xs font-medium text-muted">Income mix (risk copy only)</p>
        <div className="flex flex-wrap gap-2">
          {INCOME_TYPES.map((t) => {
            const on = inputs.incomeTypes.includes(t.id as IncomeType);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleType(t.id as IncomeType)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  on ? "border-accent/40 bg-accent/15 text-accent" : "border-border text-muted hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 mb-1.5 text-xs font-medium text-muted">Target domicile</p>
        <div className="grid grid-cols-3 gap-2">
          {TARGET_STATES.map((s) => (
            <button
              key={s.abbr}
              type="button"
              onClick={() => set("targetState", s.abbr as TargetState)}
              className={cn(
                "min-w-0 rounded-xl border px-1.5 py-2 text-center text-xs font-medium",
                inputs.targetState === s.abbr
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              <span className="block">{s.abbr}</span>
              <span className="mt-0.5 block truncate text-[10px] font-normal opacity-80">
                {s.abbr === "SD" ? "risk" : s.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-muted">
            <span>Days already in former state this tax year</span>
            <span className="font-mono text-foreground">{inputs.daysInFormer}</span>
          </div>
          <input
            type="range"
            min={0}
            max={365}
            value={inputs.daysInFormer}
            onChange={(e) => set("daysInFormer", Number(e.target.value))}
            className="w-full"
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={inputs.ownsProperty}
            onChange={(e) => set("ownsProperty", e.target.checked)}
            className="size-4 accent-emerald-400"
          />
          I still own a home / property in the former state
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Already have a virtual mailbox?">
            <Select
              value={inputs.hasMailbox ? "yes" : "no"}
              onChange={(e) => set("hasMailbox", e.target.value === "yes")}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Field>
          {inputs.hasMailbox && (
            <Field label="Provider">
              <Select
                value={inputs.mailboxProvider}
                onChange={(e) => set("mailboxProvider", e.target.value as MailboxProviderId)}
              >
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

        <div className="mt-5 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Estimated annual state income-tax savings</p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
            {money(out.annualSavings)}
          </p>
          <p className="mt-1 text-xs text-muted">
            5-year projection <span className="text-accent">{money(out.fiveYear)}</span>
            <span className="mx-1.5">·</span>
            {out.rateLabel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                riskTone === "danger" && "border-danger/30 bg-danger/10 text-danger",
                riskTone === "warning" && "border-warning/30 bg-warning/10 text-warning",
                riskTone === "accent" && "border-accent/30 bg-accent/10 text-accent",
              )}
            >
              Audit risk {out.riskLevel} · {out.riskScore}
            </span>
            {out.w2Warning && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">W-2 payroll still matters</span>
            )}
          </div>
          <ul className="mt-3 space-y-1 text-[11px] text-muted">
            {out.riskReasons.slice(0, 2).map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </div>

        {out.sdWarning && (
          <div className="mt-3 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium text-warning">South Dakota is no longer the lazy default.</p>
              <p className="mt-1 text-[11px] text-warning/90">
                Payroll providers, banks, and DMV practice have tightened around virtual/CMRA addresses. A 1-night stay is
                not audit-proof. For W-2 employees we recommend Florida.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-medium">What you still have to do</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted">
            {out.preview.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/checkout/start?plan=kit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-accent text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Start migration — $49
          </Link>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => setBlueprintOpen(true)}>
              <Mail className="size-4 shrink-0" />
              Save this blueprint
            </Button>
            <Link
              href={`/signup?plan=kit&mailbox=1`}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border px-3 text-sm hover:bg-muted-bg"
            >
              I already have a mailbox — connect it
            </Link>
          </div>
        </div>
        <DisclaimerNote className="mt-4" />
      </Card>

      <Modal open={blueprintOpen} onClose={() => setBlueprintOpen(false)} title="Save this Tax Blueprint">
        {saved ? (
          <div className="text-sm">
            <p className="flex items-center gap-2 font-medium text-accent">
              <Check className="size-4" /> Blueprint saved on this device.
            </p>
            <p className="mt-2 text-muted">
              {session
                ? "It’s attached to your account."
                : "In production we’d email a magic link. For this MVP, sign up with the same email and we’ll restore the calculator inputs."}
            </p>
            <Button className="mt-4 w-full" onClick={() => setBlueprintOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveSnapshot(email || session?.email || "saved@local", inputs, out);
              setSaved(true);
            }}
          >
            <Field label="Email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@work.com"
              />
            </Field>
            <p className="text-xs text-muted">
              We’ll store the calculator inputs as a Tax Blueprint. Magic-link email is mocked unless you connect
              Supabase Auth.
            </p>
            <Button type="submit" className="w-full">
              Save blueprint
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export function ShieldDemo() {
  const cells = [
    "t", "t", "t", "", "f", "f", "o",
    "t", "t", "", "", "f", "f", "f",
    "", "", "t", "t", "t", "", "o",
    "f", "f", "", "", "", "t", "t",
  ];
  const color = (c: string) =>
    c === "t" ? "bg-accent" : c === "f" ? "bg-danger/80" : c === "o" ? "bg-other/70" : "bg-muted-bg";
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-accent">Audit Shield</p>
          <h3 className="text-lg font-semibold">A Florida address is not a defense file.</h3>
          <p className="mt-1 text-sm text-muted">
            CA and NY audit former residents. Log every night, vault the receipts, export a 1-click defense PDF.
          </p>
        </div>
        <ShieldAlert className="hidden size-8 text-accent sm:block" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => (
          <div key={i} className={cn("aspect-square rounded-md", color(c))} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-accent" /> Target state
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-danger/80" /> Former high-tax state
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-other/70" /> Everywhere else
        </span>
      </div>
      <p className="mt-4 text-xs text-muted">
        183 days is a common rule of thumb, not the only domicile test. Shield tracks the calendar anyway — because
        auditors do.
      </p>
    </Card>
  );
}
