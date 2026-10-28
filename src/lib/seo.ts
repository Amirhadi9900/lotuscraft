import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { laundryCategories, sewingCategories } from "@/data/pricing";
import type { ServicePageKey } from "@/data/service-pages";

export const locales = ["fi", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fi";

export const business = {
  name: "Lotus Craft",
  alternateName: "ompelimo Lotus Crafted",
  /** Finnish trade identifier from the YTJ register. */
  businessId: "3583247-2",
  phone: "+358406812264",
  phoneDisplay: "+358 40 681 2264",
  email: "lotuscraft.fin@gmail.com",
  streetAddress: "Helsinginkatu 11 / Kustaankatu 1",
  postalCode: "00500",
  addressLocality: "Helsinki",
  addressCountry: "FI",
  district: "Kallio",
  socials: {
    instagram: "https://www.instagram.com/ompelimo_lotuscrafted/",
    facebook: "https://www.facebook.com/p/ompelimo-Lotuscraft-61590190628025/",
  },
} as const;

/**
 * Override with NEXT_PUBLIC_SITE_URL when the client leaves the Vercel
 * subdomain; canonicals, hreflang, the sitemap and schema all read from here.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://lotuscraft.vercel.app")
).replace(/\/+$/, "");

/** Root is emitted without a trailing slash so it matches the canonical Next renders. */
export function absolute(path: string): string {
  if (path === "/") return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Finnish is the default locale with localePrefix "as-needed", so it owns the root. */
export function localePath(locale: Locale, pathname = "/"): string {
  const clean = pathname === "/" ? "" : pathname;
  return locale === defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

export function resolveLocale(value: string): Locale {
  return (locales as readonly string[]).includes(value)
    ? (value as Locale)
    : defaultLocale;
}

/** Absolute hreflang map for one pathname — shared by metadata and the sitemap. */
export function hreflang(pathname = "/"): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const candidate of locales) {
    languages[candidate] = absolute(localePath(candidate, pathname));
  }

  // x-default is what Google serves when no listed language matches the user.
  languages["x-default"] = absolute(localePath(defaultLocale, pathname));

  return languages;
}

/** Canonical stays site-relative so Next resolves it against metadataBase; hreflang must be absolute. */
export function alternates(locale: Locale, pathname = "/"): Metadata["alternates"] {
  return { canonical: localePath(locale, pathname), languages: hreflang(pathname) };
}

const openingHours = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "10:00",
    closes: "18:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "10:00",
    closes: "16:00",
  },
];

// Widest spread on the published price list: placemat €3 – wedding dress €155.
const priceRange = "3–155 €";

export const ogImage = "/images/og-lotus-craft.png";

const ogLocale: Record<Locale, string> = { fi: "fi_FI", en: "en_US" };

export type PageKey =
  | "home"
  | "services"
  | "about"
  | "gallery"
  | "contact"
  | "tietosuoja"
  | ServicePageKey;

export function breadcrumbJsonLd(
  locale: Locale,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(localePath(locale, item.path)),
    })),
  };
}

export function faqJsonLd(entries: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export async function pageMetadata(
  locale: Locale,
  key: PageKey,
  pathname = "/"
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t(`pages.${key}.title`);
  const description = t(`pages.${key}.description`);
  const image = absolute(ogImage);

  return {
    title,
    description,
    alternates: alternates(locale, pathname),
    openGraph: {
      type: "website",
      url: absolute(localePath(locale, pathname)),
      siteName: business.name,
      locale: ogLocale[locale],
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${business.name} — ${t("default_title")}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export async function businessJsonLd(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "seo" });
  const tc = await getTranslations({ locale, namespace: "services.categories" });
  const td = await getTranslations({
    locale,
    namespace: "services.category_descriptions",
  });

  // The whole catalogue, on every page: this node describes the business
  // entity, and the layout that renders it is reused across client-side
  // navigations, so anything scoped to one page would go stale in the DOM.
  const catalog = [...sewingCategories, ...laundryCategories].map(
    (category) => ({
      "@type": "Offer",
      priceCurrency: "EUR",
      price: Math.min(...category.services.map((service) => service.price)),
      itemOffered: {
        "@type": "Service",
        name: tc(category.id),
        description: td(category.id),
      },
    })
  );

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "DryCleaningOrLaundry"],
    "@id": `${absolute("/")}/#business`,
    name: business.name,
    alternateName: business.alternateName,
    // The registration number, not vatID: Y-tunnus is the trade identifier and
    // says nothing about whether the business is VAT-registered.
    identifier: {
      "@type": "PropertyValue",
      propertyID: "Y-tunnus",
      value: business.businessId,
    },
    description: t("business_description"),
    url: absolute(localePath(locale)),
    // A dedicated 512px rendition: /images/logo.png is the 688KB master the
    // components feed to next/image, not something crawlers should fetch raw.
    image: absolute("/icons/logo-512.png"),
    logo: absolute("/icons/logo-512.png"),
    telephone: business.phone,
    email: business.email,
    priceRange,
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.streetAddress,
      postalCode: business.postalCode,
      addressLocality: business.addressLocality,
      addressCountry: business.addressCountry,
    },
    areaServed: { "@type": "City", name: business.addressLocality },
    knowsLanguage: [...locales],
    openingHoursSpecification: openingHours,
    sameAs: Object.values(business.socials),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t("catalog_name"),
      itemListElement: catalog,
    },
  };
}
