"use client";

import { Badge, Button, Modal } from "@/components/ui";
import { DISCLAIMER_SHORT, DISCLAIMER_VERSION } from "@/lib/constants";
import { hasKit, hasShield, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  FileText,
  FolderArchive,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/checklist", label: "Checklist", icon: ListChecks },
  { href: "/app/shield", label: "Audit Shield", icon: CalendarDays },
  { href: "/app/vault", label: "Vault", icon: FolderArchive },
  { href: "/app/letters", label: "Letters", icon: FileText },
  { href: "/app/report", label: "Defense PDF", icon: ShieldCheck },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { hydrated, session, profile, logout, acceptDisclaimer } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (profile && !profile.onboarded && !pathname.startsWith("/app/onboarding")) {
      router.replace("/app/onboarding");
    }
  }, [hydrated, session, profile, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading NomadShield…</div>
    );
  }
  if (!session) return null;

  if (pathname.startsWith("/app/onboarding")) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        {children}
        <p className="mx-auto mt-10 max-w-lg text-[11px] leading-relaxed text-muted">{DISCLAIMER_SHORT}</p>
      </div>
    );
  }

  const plan = profile?.plan ?? "free";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card/60 lg:flex">
        <Link href="/app" className="flex items-center gap-2 px-5 py-4 text-sm font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <ShieldCheck className="size-4" />
          </span>
          NomadShield
        </Link>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  active ? "bg-muted-bg text-foreground" : "text-muted hover:bg-muted-bg hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{profile?.fullName || profile?.email}</p>
              <p className="text-[11px] text-muted">
                {profile?.fromState} → {profile?.targetState}
              </p>
            </div>
            <Badge tone={plan === "shield" ? "accent" : plan === "kit" ? "info" : "muted"}>{plan}</Badge>
          </div>
          <button
            onClick={() => logout().then(() => router.push("/"))}
            className="mt-3 inline-flex items-center gap-2 text-xs text-muted hover:text-foreground"
          >
            <LogOut className="size-3.5" /> Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          <Link href="/app" className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-accent" /> NomadShield
          </Link>
          <button onClick={() => setMenu((v) => !v)} className="rounded-lg p-2 hover:bg-muted-bg">
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        {menu && (
          <div className="border-b border-border bg-card px-3 py-2 lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenu(false)}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-muted-bg"
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
        {profile && profile.disclaimerVersion !== DISCLAIMER_VERSION && (
          <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning">
            Please confirm you understand NomadShield is a workflow tool, not tax advice.{" "}
            <button className="underline" onClick={acceptDisclaimer}>
              I understand
            </button>
          </div>
        )}
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        <p className="px-4 pb-8 text-[11px] leading-relaxed text-muted sm:px-6 lg:px-8">{DISCLAIMER_SHORT}</p>
      </div>
    </div>
  );
}

export function PlanGate({
  need,
  children,
}: {
  need: "kit" | "shield";
  children: ReactNode;
}) {
  const { profile, setPlan } = useApp();
  const ok = need === "kit" ? hasKit(profile?.plan) : hasShield(profile?.plan);
  const [open, setOpen] = useState(false);
  if (ok) return <>{children}</>;
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="surface max-w-md p-6 text-center">
          <h3 className="font-semibold">
            {need === "kit" ? "Migration Kit — $49 one-time" : "Audit Shield — $19/mo"}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {need === "kit"
              ? "Unlock the 6-step engine, packets, and letter generator for one target state."
              : "Unlock the 183-day calendar, 5 GB vault, defense PDF, and reminders."}
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            Continue (demo checkout)
          </Button>
        </div>
      </div>
      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        plan={need === "kit" ? "kit" : "shield"}
        onConfirm={(interval) => {
          setPlan(need === "kit" ? "kit" : "shield", interval);
          setOpen(false);
        }}
      />
    </div>
  );
}

export function CheckoutModal({
  open,
  onClose,
  plan,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  plan: "kit" | "shield";
  onConfirm: (interval: "month" | "year") => void;
}) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  return (
    <Modal open={open} onClose={onClose} title="Demo checkout — no charge">
      <p className="text-sm text-muted">
        Stripe is not live in this MVP. Confirming will flip your plan flag so you can click through the product.
      </p>
      {plan === "shield" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setInterval("month")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              interval === "month" ? "border-accent text-accent" : "border-border",
            )}
          >
            $19/mo
          </button>
          <button
            onClick={() => setInterval("year")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              interval === "year" ? "border-accent text-accent" : "border-border",
            )}
          >
            $190/yr
          </button>
        </div>
      )}
      <Button className="mt-4 w-full" onClick={() => onConfirm(interval)}>
        Activate {plan === "kit" ? "Migration Kit — $49" : "Audit Shield"}
      </Button>
    </Modal>
  );
}
