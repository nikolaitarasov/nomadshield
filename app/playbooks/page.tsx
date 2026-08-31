import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import { PUBLIC_PLAYBOOKS, getPlaybook } from "@/lib/playbooks";
import { TARGET_STATES } from "@/lib/states";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Domicile playbooks — Florida, Texas, South Dakota",
  description:
    "Public previews of NomadShield’s Florida, Texas, and South Dakota domicile playbooks: address, presence, DL, voter, letters, and residency filings. You or your CPA file.",
  alternates: { canonical: "/playbooks" },
};

export default function PlaybooksIndexPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Playbooks</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Pick a state. See the six steps.</h1>
        <p className="mt-3 text-muted">
          These are the same checklists you get in the Migration Kit — published so you can see the work before you pay.
          Florida is primary, Texas is secondary, South Dakota is documented with 2026 context.
        </p>
        <div className="mt-10 space-y-4">
          {PUBLIC_PLAYBOOKS.map((p) => {
            const book = getPlaybook(p.state);
            const pitch = TARGET_STATES.find((t) => t.abbr === p.state)?.pitch;
            return (
              <Link key={p.slug} href={`/playbooks/${p.slug}`} className="surface block p-6 hover:border-accent/30">
                <p className="text-xs text-accent">{p.label}</p>
                <h2 className="mt-1 text-lg font-semibold">{book.name} domicile playbook</h2>
                <p className="mt-2 text-sm text-muted">{book.tagline}</p>
                {pitch && <p className="mt-2 text-sm text-muted">{pitch}</p>}
                <p className="mt-3 text-xs text-accent">Open the six steps →</p>
              </Link>
            );
          })}
        </div>
        <DisclaimerNote className="mt-10" />
      </div>
    </MarketingShell>
  );
}
