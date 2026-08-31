"use client";

import { OwnerLine } from "@/components/owner-line";
import { DISCLAIMER_SHORT, OWNER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/savvy-nomad", label: "vs SavvyNomad" },
  { href: "/compare", label: "Compare" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <ShieldCheck className="size-4" />
      </span>
      NomadShield
    </Link>
  );
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/checkout/start?plan=kit"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Start migration — $49
          </Link>
        </div>
        <button className="md:hidden rounded-lg p-2 hover:bg-muted-bg" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block py-2 text-sm" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link href="/login" className="block py-2 text-sm" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link href="/checkout/start?plan=kit" className="mt-2 block rounded-lg bg-accent py-2 text-center text-sm font-medium text-accent-fg">
            Start migration — $49
          </Link>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted">
              Automated US tax-domicile setup and audit protection for digital nomads, expats, and remote workers leaving
              high-tax states.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-2 font-medium">Product</p>
              <ul className="space-y-1.5 text-muted">
                <li>
                  <Link href="/#calculator" className="hover:text-foreground">
                    Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/savvy-nomad" className="hover:text-foreground">
                    SavvyNomad alternative
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-foreground">
                    Compare
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="hover:text-foreground">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-medium">Playbooks</p>
              <ul className="space-y-1.5 text-muted">
                <li>Florida (primary)</li>
                <li>Texas (secondary)</li>
                <li>South Dakota (2026 warnings)</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-medium">Company</p>
              <ul className="space-y-1.5 text-muted">
                <li>
                  <a href={OWNER.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
                    {OWNER.legalName}
                  </a>
                </li>
                <li>
                  <a href={OWNER.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
                    {OWNER.host}
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-[11px] leading-relaxed text-muted">{DISCLAIMER_SHORT}</p>
        <OwnerLine className="mt-3" />
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
