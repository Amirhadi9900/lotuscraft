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
  const lastModified = new Date();

  return paths.flatMap(({ pathname, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: absolute(localePath(locale as Locale, pathname)),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: hreflang(pathname) },
    }))
  );
}
