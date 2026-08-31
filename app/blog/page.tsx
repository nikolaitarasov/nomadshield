import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import { POSTS } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — domicile, 183 days, Florida vs South Dakota",
  description:
    "Practical guides for US digital nomads leaving CA, NY, and other high-tax states: California to Florida domicile, the 183-day rule, and South Dakota vs Florida in 2026.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Playbook</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Guides for leaving a high-tax state</h1>
        <p className="mt-3 text-muted">
          Workflow notes, not tax advice. Use them with the calculator and the 6-step engine.
        </p>
        <div className="mt-10 space-y-4">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="surface block p-6 hover:border-accent/30">
              <p className="text-xs text-muted">{formatDate(post.date)}</p>
              <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-muted">{post.description}</p>
              <p className="mt-3 text-xs text-accent">Read →</p>
            </Link>
          ))}
        </div>
        <DisclaimerNote className="mt-10" />
      </div>
    </MarketingShell>
  );
}
