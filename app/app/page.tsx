"use client";

import { Badge, Card, DisclaimerNote, Progress, Ring } from "@/components/ui";
import { calculate } from "@/lib/calculator";
import { getPlaybook, nextAction, progressFor } from "@/lib/playbooks";
import { stateName } from "@/lib/states";
import { useApp } from "@/lib/store";
import { money, quarterOf, todayISO } from "@/lib/utils";
import Link from "next/link";
import { useMemo } from "react";

export default function OverviewPage() {
  const { profile, items, presence, evidence } = useApp();
  const playbook = getPlaybook(profile?.targetState ?? "FL");
  const prog = progressFor(playbook, items);
  const next = nextAction(playbook, items);
  const year = profile?.taxYearStart ? Number(profile.taxYearStart.slice(0, 4)) : new Date().getFullYear();
  const yearPresence = presence.filter((p) => p.date.startsWith(String(year)));
  const counts = {
    target: yearPresence.filter((p) => p.bucket === "target").length,
    former: yearPresence.filter((p) => p.bucket === "former").length,
    other: yearPresence.filter((p) => p.bucket === "other").length,
  };

  const calc = useMemo(() => {
    if (!profile) return null;
    return calculate({
      fromState: profile.fromState,
      filingStatus: profile.filingStatus,
      income: profile.annualIncome,
      incomeTypes: profile.incomeTypes,
      targetState: profile.targetState,
      daysInFormer: counts.former || 0,
      hasMailbox: Boolean(profile.mailboxAddress.street),
      mailboxProvider: profile.mailboxProvider,
      ownsProperty: profile.ownsPropertyInFromState,
    });
  }, [profile, counts.former]);

  const q = quarterOf(todayISO());
  const formerThisQ = yearPresence.filter(
    (p) => p.bucket === "former" && quarterOf(p.date) === q,
  ).length;

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {stateName(profile.fromState)} → {stateName(profile.targetState)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {profile.fullName || profile.email} · tax year {year} · {profile.plan} plan
          </p>
        </div>
        <Badge tone={calc?.riskLevel === "High" ? "danger" : calc?.riskLevel === "Medium" ? "warning" : "accent"}>
          Audit risk {calc?.riskLevel ?? "—"}
        </Badge>
      </div>

      {formerThisQ > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          You have {formerThisQ} day{formerThisQ === 1 ? "" : "s"} logged in {stateName(profile.fromState)} this quarter.
          183 days is a common rule of thumb, not the only domicile test.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-muted">Estimated annual savings</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-accent">{money(calc?.annualSavings ?? 0)}</p>
          <p className="mt-1 text-xs text-muted">5-year {money(calc?.fiveYear ?? 0)} · {calc?.rateLabel}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Migration progress</p>
          <p className="mt-1 text-3xl font-semibold">{prog.pct}%</p>
          <Progress value={prog.pct} className="mt-3" />
          <p className="mt-2 text-xs text-muted">
            {prog.completed} / {prog.total} required items
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Presence {year}</p>
          <div className="mt-2 flex justify-between">
            <Ring value={counts.target} max={183} label={`${profile.targetState} nights`} />
            <Ring value={counts.former} max={183} label="Former" color="var(--danger)" />
            <Ring value={counts.other} max={183} label="Other" color="var(--other)" />
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs text-muted">Next action</p>
        {next ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-medium">{next.step.title}</h2>
              <p className="text-sm text-muted">{next.item.label}</p>
            </div>
            <Link
              href={next.href}
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
            >
              Continue
            </Link>
          </div>
        ) : (
          <p className="mt-2 text-sm">Required checklist items are complete. Keep logging days and vaulting receipts.</p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="font-medium">Evidence vault</h3>
          <p className="mt-1 text-sm text-muted">{evidence.length} file{evidence.length === 1 ? "" : "s"} indexed</p>
          <Link href="/app/vault" className="mt-3 inline-flex text-sm text-accent hover:underline">
            Open vault →
          </Link>
        </Card>
        <Card>
          <h3 className="font-medium">Defense PDF</h3>
          <p className="mt-1 text-sm text-muted">Cover, day counts, timeline, exhibit index, disclaimer.</p>
          <Link href="/app/report" className="mt-3 inline-flex text-sm text-accent hover:underline">
            Generate report →
          </Link>
        </Card>
      </div>
      <DisclaimerNote />
    </div>
  );
}
