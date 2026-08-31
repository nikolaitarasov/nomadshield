"use client";

import { PlanGate } from "@/components/app-shell";
import { Badge, Card, Progress } from "@/components/ui";
import { getPlaybook, stepProgress } from "@/lib/playbooks";
import { useApp } from "@/lib/store";
import Link from "next/link";

export default function ChecklistIndexPage() {
  const { profile, items } = useApp();
  const playbook = getPlaybook(profile?.targetState ?? "FL");

  return (
    <PlanGate need="kit">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs text-muted">6-step engine · {playbook.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Domicile migration</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{playbook.tagline}</p>
        {playbook.warnings.map((w) => (
          <p key={w} className="mt-2 text-xs text-warning">
            {w}
          </p>
        ))}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {playbook.steps.map((step) => {
            const p = stepProgress(playbook, step.key, items);
            return (
              <Link key={step.key} href={`/app/checklist/${step.number}`}>
                <Card className="h-full transition-colors hover:border-accent/30">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-xs text-accent">Step {step.number}</p>
                    <Badge tone={p.pct === 100 ? "accent" : "muted"}>{p.pct}%</Badge>
                  </div>
                  <h2 className="mt-1 font-medium">{step.title}</h2>
                  <p className="mt-1 text-sm text-muted">{step.summary}</p>
                  <Progress value={p.pct} className="mt-4" />
                  <p className="mt-2 text-[11px] text-muted">
                    {p.completed}/{p.total} required
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </PlanGate>
  );
}
