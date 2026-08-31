import { siteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/", "/auth/", "/checkout/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
