import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing";
import { DisclaimerNote } from "@/components/ui";
import { allSlugs, getPost, POSTS } from "@/lib/blog";
import { siteUrl } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      url: `${siteUrl()}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const url = `${siteUrl()}/blog/${post.slug}`;
  const others = POSTS.filter((p) => p.slug !== post.slug);

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.date,
          mainEntityOfPage: url,
          author: { "@type": "Organization", name: "NomadShield" },
          publisher: { "@type": "Organization", name: "SwiftAppLab LLC", url: "https://swiftapplab.com" },
        }}
      />
      <article className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-xs text-muted">
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>{" "}
          · {formatDate(post.date)}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-4 text-lg text-muted">{post.description}</p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
          {post.body.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2 key={i} className="pt-2 text-xl font-semibold text-foreground">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "p") {
              return (
                <p key={i} className="text-muted">
                  {block.text}
                </p>
              );
            }
            if (block.type === "callout") {
              return (
                <p key={i} className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
                  {block.text}
                </p>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={i} className="list-disc space-y-1 pl-5">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <ol key={i} className="list-decimal space-y-1 pl-5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          })}
        </div>
        <div className="surface mt-12 p-6">
          <h2 className="font-semibold text-foreground">Run the numbers, then keep the file</h2>
          <p className="mt-2 text-sm text-muted">
            Free calculator on the homepage. $49 Migration Kit for the 6-step engine. $19/mo Audit Shield for the 183-day
            log.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/#calculator" className="text-sm text-accent hover:underline">
              Calculator →
            </Link>
            <Link href="/checkout/start?plan=kit" className="text-sm text-accent hover:underline">
              Start migration — $49 →
            </Link>
            <Link href="/savvy-nomad" className="text-sm text-accent hover:underline">
              How we differ from a mailbox concierge →
            </Link>
          </div>
        </div>
        {others.length > 0 && (
          <div className="mt-10">
            <p className="text-xs uppercase tracking-wider text-muted">More guides</p>
            <ul className="mt-2 space-y-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="text-sm text-accent hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <DisclaimerNote className="mt-10" />
      </article>
    </MarketingShell>
  );
}
