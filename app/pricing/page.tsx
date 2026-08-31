import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pricing" };

const TIERS = [
  {
    name: "Free",
    price: "$0",
    extra: "",
    points: ["Interactive savings & audit-risk calculator", "Tax Blueprint saved on-device / email capture", "Public playbook overview"],
    cta: { href: "/#calculator", label: "Run the calculator" },
    featured: false,
  },
  {
    name: "Migration Kit",
    price: "$49",
    extra: "one-time, one target state",
    points: [
      "Full 6-step engine (FL, TX, or SD)",
      "Ready-to-sign packets + county clerk links",
      "Severing-ties letter generator",
      "BYO mailbox connect (preview) or manual address",
      "No scan overages — we don’t host your mail",
    ],
    cta: { href: "/signup?plan=kit", label: "Start migration — $49" },
    featured: true,
  },
  {
    name: "Audit Shield",
    price: "$19",
    extra: "/mo or $190/yr",
    points: [
      "183-day presence calendar (3 buckets)",
      "Second watch state",
      "Evidence vault (5 GB)",
      "1-click audit defense PDF",
      "In-app reminders (email job is a stub)",
    ],
    cta: { href: "/signup?plan=shield", label: "Add Audit Shield" },
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Pricing</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Three numbers. No warehouse fees.</h1>
        <p className="mt-3 max-w-2xl text-muted">
          SavvyNomad runs $55–$265/mo plus notary, vehicle, renewal, and scan extras. NomadShield is software. Keep the
          mailbox you already have.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`surface p-6 ${t.featured ? "border-accent/40 ring-1 ring-accent/25" : ""}`}
            >
              <p className="text-sm text-muted">{t.name}</p>
              <p className="mt-1 text-4xl font-semibold">
                {t.price} <span className="text-sm font-normal text-muted">{t.extra}</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                {t.points.map((p) => (
                  <li key={p}>— {p}</li>
                ))}
              </ul>
              <Link
                href={t.cta.href}
                className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium ${
                  t.featured ? "bg-accent text-accent-fg" : "border border-border hover:bg-muted-bg"
                }`}
              >
                {t.cta.label}
              </Link>
            </div>
          ))}
        </div>

        <div className="surface mt-8 p-6">
          <h2 className="font-semibold">Concierge add-on — waitlist</h2>
          <p className="mt-2 text-sm text-muted">
            Book a CPA partner when the facts are messy (part-year, equity, a house you still own). There is no live CPA
            chat in this product, on purpose.
          </p>
          <Link href="/signup?waitlist=1" className="mt-4 inline-flex text-sm text-accent hover:underline">
            Join the CPA partner waitlist →
          </Link>
        </div>
        <DisclaimerNote className="mt-8" />
      </div>
    </MarketingShell>
  );
}
