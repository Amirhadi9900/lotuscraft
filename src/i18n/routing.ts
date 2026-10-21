import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fi", "en"],
  defaultLocale: "fi",
  localePrefix: "as-needed",
  // Without this, an English Accept-Language header serves English content at
  // the Finnish root URL, so the URL Google indexes and the language it reads
  // would disagree.
  localeDetection: false,
});
