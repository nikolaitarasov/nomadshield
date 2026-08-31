import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SavvyNomad vs NomadShield vs Escapees",
  description:
    "Honest comparison: SavvyNomad (Florida mailbox concierge), NomadShield (software playbook + audit vault), Escapees, and DIY. Pricing, mail, South Dakota, and what happens after you move.",
  keywords: ["SavvyNomad vs NomadShield", "Savvy Nomad comparison", "Escapees vs SavvyNomad", "Florida domicile comparison"],
  alternates: { canonical: "/compare" },
};

const ROWS: [string, string, string, string, string][] = [
  [
    "Model",
    "Bundled FL address + mail + concierge",
    "Software playbook + audit vault; mail optional",
    "RV / traveler mail service (TX Livingston is common) + community",
    "You assemble forms, folders, and a spreadsheet",
  ],
  [
    "States",
    "Florida-first (SD discontinued after legislative / payroll / DMV friction)",
    "FL primary, TX secondary, SD with explicit 2026 risk warnings",
    "Historically strong on TX (Escapees) and previously SD",
    "Whatever you pick — including the wrong one",
  ],
  [
    "Mail",
    "Proprietary warehouse. Basic plan is often essential mail only; scans extra",
    "Bring-your-own: Anytime Mailbox, PostScan, iPostal1, Traveling Mailbox, Escapees, US Global Mail, or manual",
    "Their mail service is the product",
    "You already pay $10–20/mo somewhere else",
  ],
  [
    "Pricing",
    "$55–$90/mo basic/mid, ~$265/mo premium, plus notary / vehicle / renewal / scan extras",
    "Free calculator · $49 Migration Kit · $19/mo or $190/yr Audit Shield",
    "Membership + mail fees (varies by plan) — not a domicile SaaS",
    "$0 software, high time cost, easy to miss a tie",
  ],
  [
    "After the move",
    "Compliance alerts + limited CPA chat minutes",
    "183-day calendar, evidence vault, 1-click defense PDF",
    "Mail continues; audit file is on you",
    "Hope the folder is complete when a notice arrives",
  ],
  [
    "Speed",
    "Signup + notary + wait on humans",
    "Instant checklist + generated letters the same session",
    "Depends on mail setup and travel",
    "As fast as you are organized",
  ],
];

export default function ComparePage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Compare</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight">
          We are not “SavvyNomad cheaper.” We are software they didn’t productize.
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          SavvyNomad is a good Florida mailbox-plus-concierge. Escapees is a real traveler institution. DIY works if you
          already know the county clerk’s PDF name. NomadShield is the playbook + the year-after file.
        </p>

        <div className="mt-10 space-y-4 md:hidden">
          {[
            { name: "SavvyNomad", idx: 1, featured: false },
            { name: "NomadShield", idx: 2, featured: true },
            { name: "Escapees", idx: 3, featured: false },
            { name: "DIY", idx: 4, featured: false },
          ].map((col) => (
            <div key={col.name} className={`surface p-5 ${col.featured ? "border-accent/40 ring-1 ring-accent/20" : ""}`}>
              <h2 className={`font-semibold ${col.featured ? "text-accent" : ""}`}>{col.name}</h2>
              <dl className="mt-3 space-y-3">
                {ROWS.map((r) => (
                  <div key={r[0]}>
                    <dt className="text-[11px] uppercase tracking-wide text-muted">{r[0]}</dt>
                    <dd className="mt-0.5 text-sm">{r[col.idx]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-10 hidden overflow-x-auto rounded-2xl border border-border md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-card-2 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium"> </th>
                <th className="px-4 py-3 font-medium">SavvyNomad</th>
                <th className="px-4 py-3 font-medium text-accent">NomadShield</th>
                <th className="px-4 py-3 font-medium">Escapees</th>
                <th className="px-4 py-3 font-medium">DIY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROWS.map((r) => (
                <tr key={r[0]} className="align-top">
                  <td className="px-4 py-3 font-medium">{r[0]}</td>
                  <td className="px-4 py-3 text-muted">{r[1]}</td>
                  <td className="px-4 py-3">{r[2]}</td>
                  <td className="px-4 py-3 text-muted">{r[3]}</td>
                  <td className="px-4 py-3 text-muted">{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="surface p-6">
            <h2 className="font-semibold">When SavvyNomad is the better fit</h2>
            <p className="mt-2 text-sm text-muted">
              You want one vendor to hand you a Florida residential-style address, forward paper, and walk you through
              notary + DL on a concierge clock. You do not already have a mailbox you like.
            </p>
          </div>
          <div className="surface p-6">
            <h2 className="font-semibold">When NomadShield is the better fit</h2>
            <p className="mt-2 text-sm text-muted">
              You already pay for Anytime Mailbox / PostScan / iPostal1 / Traveling Mailbox / Escapees / US Global Mail.
              You want the savings number, a state-specific packet tonight, and an audit file next April — not another
              warehouse subscription.
            </p>
          </div>
        </div>

        <Link
          href="/signup?plan=kit"
          className="mt-8 inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
        >
          Start migration — $49
        </Link>
        <DisclaimerNote className="mt-8" />
      </div>
    </MarketingShell>
  );
}
