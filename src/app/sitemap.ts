import type { MetadataRoute } from "next";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = rawSiteUrl
  ? rawSiteUrl.startsWith("http://") || rawSiteUrl.startsWith("https://")
    ? rawSiteUrl
    : `https://${rawSiteUrl}`
  : "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const normalizedUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;

  return [
    {
      url: `${normalizedUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
