import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import type { ReactNode } from "react";

export function LegalPage({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">{kicker}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-accent [&_a]:hover:underline">
          {children}
        </div>
        <DisclaimerNote className="mt-10" />
      </article>
    </MarketingShell>
  );
}
