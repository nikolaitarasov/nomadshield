import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import { playbookBySlug, PUBLIC_PLAYBOOKS } from "@/lib/playbooks";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return PUBLIC_PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = playbookBySlug(slug);
  if (!found) return { title: "Playbook" };
  return {
    title: `${found.playbook.name} domicile playbook`,
    description: found.playbook.tagline,
    alternates: { canonical: `/playbooks/${found.slug}` },
  };
}

export default async function PlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = playbookBySlug(slug);
  if (!found) notFound();
  const { playbook, label } = found;

  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-xs text-muted">
          <Link href="/playbooks" className="hover:text-foreground">
            Playbooks
          </Link>{" "}
          · {label}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{playbook.name} domicile playbook</h1>
        <p className="mt-3 text-lg text-muted">{playbook.tagline}</p>
        {playbook.warnings.length > 0 && (
          <ul className="mt-4 space-y-2">
            {playbook.warnings.map((w) => (
              <li key={w} className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
                {w}
              </li>
            ))}
          </ul>
        )}
        <ol className="mt-10 space-y-6">
          {playbook.steps.map((step) => (
            <li key={step.key} className="surface p-5">
              <p className="font-mono text-xs text-accent">
                Step {step.number} of 6
              </p>
              <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted">{step.summary}</p>
              {step.warnings?.map((w) => (
                <p key={w} className="mt-2 text-xs text-warning">
                  {w}
                </p>
              ))}
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {step.items.map((item) => (
                  <li key={item.key}>— {item.label}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/checkout/start?plan=kit"
            className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Start migration — $49
          </Link>
          <Link href="/#calculator" className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted-bg">
            Run the calculator
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">
          Other playbooks:{" "}
          {PUBLIC_PLAYBOOKS.filter((p) => p.slug !== slug).map((p, i, arr) => (
            <span key={p.slug}>
              <Link href={`/playbooks/${p.slug}`} className="text-accent hover:underline">
                {p.label}
              </Link>
              {i < arr.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
        <DisclaimerNote className="mt-10" />
      </article>
    </MarketingShell>
  );
}
