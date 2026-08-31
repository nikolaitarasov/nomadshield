"use client";

import { PlanGate } from "@/components/app-shell";
import { Badge, Button, Card, Field, Input, Select } from "@/components/ui";
import { MAILBOX_PROVIDERS } from "@/lib/constants";
import { downloadPacket } from "@/lib/pdf";
import { getPlaybook, type PlaybookItemDef } from "@/lib/playbooks";
import { FL_COUNTIES } from "@/lib/states";
import { useApp } from "@/lib/store";
import type { Form1583Status, MailboxAddress, MailboxPath, MailboxProviderId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function ChecklistStepPage() {
  const params = useParams<{ step: string }>();
  const n = Number(params.step);
  const { profile, items, setItemStatus, saveMailbox, inbound, simulateWebhook, addLetter } = useApp();
  const playbook = getPlaybook(profile?.targetState ?? "FL");
  const step = playbook.steps.find((s) => s.number === n) ?? playbook.steps[0];
  const statusOf = (key: string) => items.find((i) => i.stepKey === step.key && i.itemKey === key)?.status ?? "todo";
  const metaOf = (key: string) => items.find((i) => i.stepKey === step.key && i.itemKey === key)?.metadata ?? {};

  function toggle(item: PlaybookItemDef) {
    const cur = statusOf(item.key);
    setItemStatus(step.key, item.key, cur === "done" ? "todo" : "done");
  }

  return (
    <PlanGate need="kit">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          {playbook.steps.map((s) => (
            <Link
              key={s.key}
              href={`/app/checklist/${s.number}`}
              className={cn("rounded-full border px-2.5 py-1", s.number === n ? "border-accent text-accent" : "border-border")}
            >
              {s.number}. {s.title}
            </Link>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-accent">Step {step.number} of 6</p>
        <h1 className="mt-1 text-2xl font-semibold">{step.title}</h1>
        <p className="mt-2 text-sm text-muted">{step.summary}</p>
        {step.warnings?.map((w) => (
          <p key={w} className="mt-2 text-xs text-warning">
            {w}
          </p>
        ))}

        {step.key === "address" && profile && (
          <MailboxPanel address={profile.mailboxAddress} onSave={saveMailbox} inboundCount={inbound.length} onSimulate={simulateWebhook} />
        )}
        {step.key === "presence" && <PresenceHint />}
        {step.key === "dl" && (
          <AppointmentPanel
            date={(metaOf("appointment").date as string) || ""}
            onDate={(date) => setItemStatus("dl", "appointment", date ? "done" : "todo", { date })}
          />
        )}
        {step.key === "voter_bank" && profile?.incomeTypes.includes("w2") && <W2Callout />}
        {step.key === "letters" && (
          <div className="surface mt-6 p-5">
            <p className="text-sm">Generate letters in the dedicated workspace — this step tracks whether you did.</p>
            <div className="mt-3 flex gap-2">
              <Link href="/app/letters" className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg">
                Open letter generator
              </Link>
              <Button variant="outline" onClick={() => addLetter("voter_cancel")}>
                Quick: voter cancellation
              </Button>
            </div>
          </div>
        )}
        {step.key === "declaration" && profile && (
          <DeclarationPanel
            county={(metaOf("pick_county").county as string) || (metaOf("packet").county as string) || ""}
            onCounty={(county) => {
              setItemStatus("declaration", "pick_county", county ? "done" : "todo", { county });
            }}
            onPacket={() => {
              downloadPacket(profile, (metaOf("pick_county").county as string) || undefined);
              setItemStatus("declaration", "packet", "done");
            }}
          />
        )}

        <ul className="mt-6 space-y-3">
          {step.items.map((item) => {
            const st = statusOf(item.key);
            return (
              <li key={item.key} className="surface p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle(item)}
                    className={cn(
                      "mt-0.5 size-5 shrink-0 rounded border",
                      st === "done" ? "border-accent bg-accent" : "border-border",
                    )}
                    aria-label="Toggle"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      <Badge tone={st === "done" ? "accent" : st === "blocked" ? "danger" : "muted"}>{st.replace("_", " ")}</Badge>
                      <span className="text-[10px] uppercase text-muted">{item.owner}</span>
                    </div>
                    {item.help && <p className="mt-1 text-xs text-muted">{item.help}</p>}
                    {item.links && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            {l.label} <ExternalLink className="size-3" />
                          </a>
                        ))}
                      </div>
                    )}
                    {item.skippable && st !== "done" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => setItemStatus(step.key, item.key, "done", { skipped: true })}
                      >
                        {item.skipLabel ?? "Skip"}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex justify-between">
          {n > 1 ? (
            <Link href={`/app/checklist/${n - 1}`} className="text-sm text-muted hover:text-foreground">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {n < 6 && (
            <Link href={`/app/checklist/${n + 1}`} className="text-sm text-accent hover:underline">
              Next step →
            </Link>
          )}
        </div>
      </div>
    </PlanGate>
  );
}

function MailboxPanel({
  address,
  onSave,
  inboundCount,
  onSimulate,
}: {
  address: MailboxAddress;
  onSave: (a: MailboxAddress) => void;
  inboundCount: number;
  onSimulate: () => void;
}) {
  const [a, setA] = useState<MailboxAddress>(address);
  const set = <K extends keyof MailboxAddress>(k: K, v: MailboxAddress[K]) => setA((s) => ({ ...s, [k]: v }));

  const webhook = useMemo(() => {
    if (typeof window === "undefined") return "/api/webhooks/mail";
    return `${window.location.origin}/api/webhooks/mail`;
  }, []);

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium">Mailbox connect (preview)</h2>
        <Badge tone="warning">Connect (preview)</Badge>
      </div>
      <p className="mt-1 text-xs text-muted">
        No live Anytime Mailbox OAuth. Paste the CMRA exactly as printed. PMB vs suite matters for banks.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {(["connect", "manual", "waitlist"] as MailboxPath[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => set("path", p)}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs capitalize",
              a.path === p ? "border-accent text-accent" : "border-border text-muted",
            )}
          >
            {p === "connect" ? "Connect existing" : p === "manual" ? "Enter manually" : "Partner waitlist"}
          </button>
        ))}
      </div>
      {a.path === "waitlist" && (
        <p className="mt-3 text-xs text-muted">
          Partner mailbox waitlist recorded. You can still enter an address below if you already have one.
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Provider">
          <Select value={a.provider} onChange={(e) => set("provider", e.target.value as MailboxProviderId)}>
            <option value="">Select…</option>
            {MAILBOX_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mailbox ID">
          <Input value={a.mailboxId} onChange={(e) => set("mailboxId", e.target.value)} placeholder="AM-88421" />
        </Field>
        <Field label="Street" className="sm:col-span-2">
          <Input value={a.street} onChange={(e) => set("street", e.target.value)} placeholder="1001 Brickell Bay Dr" />
        </Field>
        <Field label="Unit / PMB">
          <Input value={a.unit} onChange={(e) => set("unit", e.target.value)} placeholder="PMB 220" />
        </Field>
        <Field label="City">
          <Input value={a.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="State">
          <Input value={a.state} onChange={(e) => set("state", e.target.value)} maxLength={2} />
        </Field>
        <Field label="ZIP">
          <Input value={a.zip} onChange={(e) => set("zip", e.target.value)} />
        </Field>
        <Field label="Form 1583">
          <Select value={a.form1583} onChange={(e) => set("form1583", e.target.value as Form1583Status)}>
            <option value="not_started">Not started</option>
            <option value="pending_notary">Pending notary</option>
            <option value="complete">Complete</option>
          </Select>
        </Field>
        <Field label="Inbound email alias" className="sm:col-span-2">
          <Input value={a.inboundAlias} onChange={(e) => set("inboundAlias", e.target.value)} />
        </Field>
        <Field label="Webhook URL (optional)" className="sm:col-span-2" hint={`Default endpoint: ${webhook}`}>
          <Input
            value={a.webhookUrl}
            onChange={(e) => set("webhookUrl", e.target.value)}
            placeholder={webhook}
          />
        </Field>
      </div>
      <p className="mt-3 text-xs text-muted">
        {inboundCount === 0
          ? "Waiting for first webhook."
          : `${inboundCount} inbound event${inboundCount === 1 ? "" : "s"} recorded.`}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => onSave(a)}>Save address</Button>
        <Button variant="outline" onClick={onSimulate}>
          Simulate inbound mail (preview)
        </Button>
      </div>
    </Card>
  );
}

function PresenceHint() {
  return (
    <Card className="mt-6">
      <h2 className="font-medium">Mark nights on Audit Shield</h2>
      <p className="mt-1 text-sm text-muted">
        The mini-calendar lives with the year-long log so you don’t keep two sources of truth.
      </p>
      <Link href="/app/shield" className="mt-3 inline-flex text-sm text-accent hover:underline">
        Open presence calendar →
      </Link>
    </Card>
  );
}

function AppointmentPanel({ date, onDate }: { date: string; onDate: (d: string) => void }) {
  return (
    <Card className="mt-6">
      <h2 className="font-medium">Appointment date — not a booking API</h2>
      <p className="mt-1 text-xs text-muted">We store the date you picked on the official site. We do not submit to the DMV.</p>
      <Field label="Appointment date" className="mt-3 max-w-xs">
        <Input type="date" value={date} onChange={(e) => onDate(e.target.value)} />
      </Field>
    </Card>
  );
}

function W2Callout() {
  return (
    <Card className="mt-6 border-warning/30">
      <h2 className="font-medium text-warning">W-2 / payroll</h2>
      <p className="mt-2 text-sm text-muted">
        Talk to HR about a work-location change and multi-state withholding. A mailbox address does not, by itself, take
        you off California or New York wage tax. We will not tell you otherwise.
      </p>
    </Card>
  );
}

function DeclarationPanel({
  county,
  onCounty,
  onPacket,
}: {
  county: string;
  onCounty: (id: string) => void;
  onPacket: () => void;
}) {
  const c = FL_COUNTIES.find((x) => x.id === county);
  return (
    <Card className="mt-6">
      <h2 className="font-medium">Ready-to-sign packet</h2>
      <p className="mt-1 text-xs text-muted">Cover sheet + field-mapped summary + filing checklist. Not an e-file.</p>
      <Field label="Florida county (or skip if TX/SD)" className="mt-3">
        <Select value={county} onChange={(e) => onCounty(e.target.value)}>
          <option value="">Select county…</option>
          {FL_COUNTIES.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </Select>
      </Field>
      {c && (
        <a href={c.clerkUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline">
          {c.clerk} <ExternalLink className="size-3" />
        </a>
      )}
      <Button className="mt-4" onClick={onPacket}>
        Download packet PDF
      </Button>
    </Card>
  );
}
