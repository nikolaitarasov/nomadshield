import { publicSiteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function origin() {
  const fromEnv = publicSiteUrl();
  if (fromEnv) return fromEnv;
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "").split(",")[0].trim();
  const proto = h.get("x-forwarded-proto") || "https";
  if (host && !/localhost|127\.0\.0\.1/i.test(host)) return `${proto}://${host}`.replace(/\/$/, "");
  return null;
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await origin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/", "/auth/", "/checkout/"],
      },
    ],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}
