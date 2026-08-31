import { siteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();
  const paths = [
    "",
    "/savvy-nomad",
    "/compare",
    "/pricing",
    "/faq",
    "/login",
    "/signup",
  ];
  return paths.map((path, i) => ({
    url: `${base}${path || "/"}`,
    lastModified,
    changeFrequency: path === "/savvy-nomad" || path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/savvy-nomad" ? 0.95 : 0.7 - i * 0.02,
  }));
}
