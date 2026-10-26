import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPathname } from "@/i18n/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Home, Scissors, Phone } from "lucide-react";
import { business, resolveLocale } from "@/lib/seo";

// Prerendered error pages cannot carry the per-request CSP nonce minted in
// src/proxy.ts, and 'strict-dynamic' then blocks every script on them.
export const dynamic = "force-dynamic";

async function locale() {
  return resolveLocale((await headers()).get("x-locale") ?? "fi");
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({
    locale: await locale(),
    namespace: "notFound",
  });
  return {
    title: t("meta_title"),
    robots: { index: false, follow: true },
  };
}

export default async function NotFound() {
  const active = await locale();
  const t = await getTranslations({ locale: active, namespace: "notFound" });
  const nav = await getTranslations({ locale: active, namespace: "navigation" });
  const f = await getTranslations({ locale: active, namespace: "footer" });

  const destinations = [
    { path: "/", Icon: Home, label: nav("home"), note: t("home_note") },
    {
      path: "/services",
      Icon: Scissors,
      label: nav("services"),
      note: t("services_note"),
    },
    {
      path: "/contact",
      Icon: Phone,
      label: nav("contact"),
      note: t("contact_note"),
    },
  ];

  // next-intl's Link is a client component and this page renders outside the
  // [locale] layout's NextIntlClientProvider, so prefixes are resolved here.
  const href = (path: string) => getPathname({ locale: active, href: path });

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border-b border-gold-100">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <a href={href("/")} className="flex items-center gap-2 sm:gap-3 h-16 sm:h-20">
            <Image
              src="/images/logo.png"
              alt={business.name}
              width={50}
              height={50}
              className="object-contain w-9 h-9 sm:w-[50px] sm:h-[50px]"
              priority
            />
            <span className="text-lg sm:text-xl font-bold text-charcoal-900">
              Lotus <span className="text-gold-700">Craft</span>
            </span>
          </a>
        </div>
      </div>

      <main className="min-h-screen bg-cream">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-charcoal-900 via-charcoal-950 to-charcoal-900" />
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gold-500 to-transparent" />
          <div className="relative z-10 max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <p className="text-gold-400 font-semibold tracking-[0.2em] text-sm sm:text-base">
              404
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {t("heading")}
            </h1>
            <p className="mt-4 text-charcoal-300 max-w-xl mx-auto text-sm sm:text-lg">
              {t("intro")}
            </p>
            <div className="mt-6 sm:mt-8 w-16 sm:w-24 h-1 bg-gold-500 mx-auto rounded-full" />
          </div>
        </section>

        <section className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {destinations.map(({ path, Icon, label, note }) => (
              <a
                key={path}
                href={href(path)}
                className="group flex flex-col items-start gap-3 bg-white rounded-2xl border border-gold-100 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-gold-200 transition-all duration-300"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700 group-hover:bg-gold-100 transition-colors">
                  <Icon size={20} />
                </span>
                <span className="text-lg font-semibold text-charcoal-900 group-hover:text-gold-700 transition-colors">
                  {label}
                </span>
                <span className="text-sm text-charcoal-600">{note}</span>
              </a>
            ))}
          </div>

          <div className="mt-10 sm:mt-14 rounded-2xl border border-gold-100 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-charcoal-900">
                {t("visit_heading")}
              </h2>
              <p className="mt-1 text-sm text-charcoal-600">
                {business.streetAddress}
                <br />
                {business.postalCode} {business.addressLocality} ·{" "}
                <a
                  href={`tel:${business.phone}`}
                  className="hover:text-gold-700 transition-colors"
                >
                  {business.phoneDisplay}
                </a>
              </p>
              <p className="mt-1 text-sm text-charcoal-600">
                {f("hours_weekday")} · {f("hours_saturday")} ·{" "}
                {f("hours_sunday")}
              </p>
            </div>
            <a
              href={href("/contact")}
              className="inline-flex items-center justify-center px-6 py-3 bg-gold-700 text-white text-sm font-medium rounded-full hover:bg-gold-800 transition-colors shadow-lg shadow-gold-700/20 whitespace-nowrap"
            >
              {t("cta")}
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
