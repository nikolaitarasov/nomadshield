"use client";

import { CheckoutModal } from "@/components/app-shell";
import { Badge, Button, Card, Field, Input, Modal, Select } from "@/components/ui";
import { DISCLAIMER_LONG, DISCLAIMER_VERSION } from "@/lib/constants";
import { TARGET_STATES, US_STATES } from "@/lib/states";
import { useApp } from "@/lib/store";
import type { FilingStatus, Plan, TargetState } from "@/lib/types";
import { downloadText } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const {
    profile,
    updateProfile,
    setPlan,
    switchTargetState,
    exportJson,
    deleteAccount,
    joinConcierge,
    demoMode,
    logout,
  } = useApp();
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<TargetState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checkout, setCheckout] = useState<Plan | null>(null);

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          {demoMode ? "Running in demo mode (local data). Add Supabase env vars for real Auth + Storage." : "Supabase Auth is configured."}
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Plan</h2>
          <Badge tone={profile.plan === "shield" ? "accent" : profile.plan === "kit" ? "info" : "muted"}>
            {profile.plan}
            {profile.plan === "shield" ? ` · ${profile.billingInterval}` : ""}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted">Stripe is mocked. Toggling a plan only flips a flag.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setCheckout("kit")}>
            Migration Kit $49
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCheckout("shield")}>
            Audit Shield $19/mo
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPlan("free")}>
            Reset to free
          </Button>
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-sm font-medium">CPA partner waitlist</h3>
          <p className="mt-1 text-xs text-muted">No fake live CPA chat.</p>
          {profile.conciergeWaitlist ? (
            <p className="mt-2 text-sm text-accent">You’re on the waitlist.</p>
          ) : (
            <Button size="sm" className="mt-2" variant="secondary" onClick={joinConcierge}>
              Book a CPA partner
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-medium">Profile</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Legal name">
            <Input value={profile.fullName} onChange={(e) => updateProfile({ fullName: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={profile.email} disabled />
          </Field>
          <Field label="Former state">
            <Select value={profile.fromState} onChange={(e) => updateProfile({ fromState: e.target.value })}>
              {US_STATES.map((s) => (
                <option key={s.abbr} value={s.abbr}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Filing status">
            <Select
              value={profile.filingStatus}
              onChange={(e) => updateProfile({ filingStatus: e.target.value as FilingStatus })}
            >
              <option value="single">Single</option>
              <option value="married_jointly">Married filing jointly</option>
            </Select>
          </Field>
          <Field label="Tax year start">
            <Input type="date" value={profile.taxYearStart} onChange={(e) => updateProfile({ taxYearStart: e.target.value })} />
          </Field>
          <Field label="Annual income">
            <Input
              type="number"
              value={profile.annualIncome || ""}
              onChange={(e) => updateProfile({ annualIncome: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            className="size-4 accent-emerald-400"
            checked={profile.ownsPropertyInFromState}
            onChange={(e) => updateProfile({ ownsPropertyInFromState: e.target.checked })}
          />
          Own property in former state
        </label>
      </Card>

      <Card>
        <h2 className="font-medium">Target state</h2>
        <p className="mt-1 text-xs text-warning">Switching states resets the checklist. Presence log and vault stay.</p>
        <div className="mt-3 grid gap-2">
          {TARGET_STATES.map((s) => (
            <button
              key={s.abbr}
              onClick={() => {
                if (s.abbr === profile.targetState) return;
                setConfirmState(s.abbr);
              }}
              className={`rounded-xl border p-3 text-left text-sm ${
                profile.targetState === s.abbr ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              <span className="font-medium">{s.name}</span>
              <span className="mt-1 block text-xs text-muted">{s.pitch}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-medium">Disclaimer accepted</h2>
        <p className="mt-1 text-xs text-muted">Version {profile.disclaimerVersion || "not accepted"} (current {DISCLAIMER_VERSION})</p>
        <p className="mt-3 max-h-40 overflow-auto text-[11px] leading-relaxed text-muted whitespace-pre-wrap">{DISCLAIMER_LONG}</p>
      </Card>

      <Card>
        <h2 className="font-medium">Data</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => downloadText(exportJson(), "nomadshield-export.json", "application/json")}
          >
            Export JSON
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete account
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            Log out
          </Button>
        </div>
      </Card>

      <Modal open={!!confirmState} onClose={() => setConfirmState(null)} title="Reset checklist?">
        <p className="text-sm text-muted">
          Switching to {confirmState} archives the current migration and builds a new state-specific checklist. Presence
          days and vault files are kept.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              if (confirmState) switchTargetState(confirmState);
              setConfirmState(null);
            }}
          >
            Switch and reset
          </Button>
          <Button variant="ghost" onClick={() => setConfirmState(null)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account">
        <p className="text-sm text-muted">This removes local data for this browser profile. It cannot be undone.</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="danger"
            onClick={async () => {
              await deleteAccount();
              router.push("/");
            }}
          >
            Delete
          </Button>
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <CheckoutModal
        open={checkout === "kit" || checkout === "shield"}
        onClose={() => setCheckout(null)}
        plan={checkout === "shield" ? "shield" : "kit"}
        onConfirm={(interval) => {
          if (checkout === "kit" || checkout === "shield") setPlan(checkout, interval);
          setCheckout(null);
        }}
      />
    </div>
  );
}
