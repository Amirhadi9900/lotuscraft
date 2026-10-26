import type { MetadataRoute } from "next";
import { absolute, hreflang, localePath, locales, type Locale } from "@/lib/seo";
import { servicePageKeys } from "@/data/service-pages";

const paths: {
  pathname: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
}[] = [
  { pathname: "/", priority: 1, changeFrequency: "weekly" },
  { pathname: "/services", priority: 0.9, changeFrequency: "weekly" },
  { pathname: "/contact", priority: 0.8, changeFrequency: "monthly" },
  ...servicePageKeys.map((key) => ({
    pathname: `/${key}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  })),
  { pathname: "/about", priority: 0.7, changeFrequency: "monthly" },
  { pathname: "/gallery", priority: 0.6, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified: this file is generated per request, so any value here
  // would read as "changed a moment ago" on every crawl and carry no signal.
  return paths.flatMap(({ pathname, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: absolute(localePath(locale as Locale, pathname)),
      changeFrequency,
      priority,
      alternates: { languages: hreflang(pathname) },
    }))
  );
}
