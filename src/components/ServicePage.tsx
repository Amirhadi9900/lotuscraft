import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CategorySection } from "@/components/PriceTable";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Phone,
} from "lucide-react";
import {
  breadcrumbJsonLd,
  business,
  faqJsonLd,
  type Locale,
} from "@/lib/seo";
import {
  servicePageCategories,
  servicePageConfig,
  servicePageKeys,
  type ServicePageKey,
} from "@/data/service-pages";

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function ServicePage({
  pageKey,
  locale,
}: {
  pageKey: ServicePageKey;
  locale: Locale;
}) {
  const t = useTranslations();
  const path = `/${pageKey}`;
  const categories = servicePageCategories(pageKey);
  const images = servicePageConfig[pageKey].images;

  const faq = [1, 2, 3].map((n) => ({
    question: t(`servicePages.faq.${pageKey}_q${n}`),
    answer: t(`servicePages.faq.${pageKey}_a${n}`),
  }));

  // Pages only state the facts the business has confirmed, so empty values are
  // dropped rather than rendered as blank promises.
  const facts = [
    {
      label: t("servicePages.shared.turnaround_label"),
      value: t(`servicePages.${pageKey}.turnaround`),
    },
    {
      label: t("servicePages.shared.delivery_label"),
      value: t(`servicePages.${pageKey}.delivery`),
    },
    {
      label: t("servicePages.shared.payment_label"),
      value: t("servicePages.shared.payment_value"),
    },
  ].filter((fact) => fact.value.length > 0);

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: t("navigation.home"), path: "/" },
    { name: t("navigation.services"), path: "/services" },
    { name: t(`servicePages.${pageKey}.nav`), path },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={faqJsonLd(faq)} />

      {/* Page header */}
      <section className="pt-12 pb-10 sm:pt-20 sm:pb-16 bg-linear-to-b from-charcoal-900 to-charcoal-950">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 sm:mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-charcoal-400">
              <li>
                <Link href="/" className="hover:text-gold-400">
                  {t("navigation.home")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/services" className="hover:text-gold-400">
                  {t("navigation.services")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-charcoal-200" aria-current="page">
                {t(`servicePages.${pageKey}.nav`)}
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white mb-4 sm:mb-6">
            {t(`servicePages.${pageKey}.h1`)}
          </h1>
          <p className="text-charcoal-300 max-w-2xl text-sm sm:text-lg leading-relaxed">
            {t(`servicePages.${pageKey}.intro`)}
          </p>
          <div className="mt-4 sm:mt-6 w-16 sm:w-24 h-1 bg-gold-500 rounded-full" />

          <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-10">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-600 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-gold-500 transition-colors"
            >
              {t("common.get_quote")}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal-900 border-2 border-charcoal-700 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-charcoal-800 transition-colors"
            >
              {t("servicePages.shared.all_prices")}
            </Link>
          </div>
        </div>
      </section>

      {images.length > 0 && (
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div
            className={`grid gap-2 sm:gap-3 rounded-xl sm:rounded-2xl overflow-hidden ${
              images.length >= 4 ? "grid-cols-4" : "grid-cols-3"
            }`}
          >
            {images.map((src) => (
              <div
                key={src}
                className="relative aspect-4/3 overflow-hidden rounded-lg sm:rounded-xl bg-charcoal-50"
              >
                <Image
                  src={src}
                  alt={t(`images.${servicePageConfig[pageKey].altKey}`)}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intro detail + confirmed service facts */}
      <section className="py-10 sm:py-16">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            {t(`servicePages.${pageKey}.intro2`)}
          </p>

          {facts.length > 0 && (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-10">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="bg-white rounded-xl border border-gold-100 px-4 sm:px-5 py-3 sm:py-4"
                >
                  <dt className="text-xs uppercase tracking-wider text-gold-700 font-semibold">
                    {fact.label}
                  </dt>
                  <dd className="text-charcoal-800 text-sm sm:text-base mt-1 leading-snug">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Prices */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-8 sm:mb-12">
            {t("servicePages.shared.prices")}
          </h2>

          <div className="space-y-10 sm:space-y-14">
            {categories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>

          <div className="mt-10 sm:mt-14 flex items-start gap-3 bg-gold-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-200">
            <Info size={20} className="text-gold-600 mt-0.5 shrink-0" />
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              {t("servicePages.shared.price_note")}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-8 sm:mb-10">
            {t("servicePages.shared.faq")}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {faq.map((item) => (
              <details
                key={item.question}
                className="group bg-white rounded-xl sm:rounded-2xl border border-gold-100 shadow-sm px-4 sm:px-6 py-3 sm:py-4"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-charcoal-900 text-sm sm:text-base">
                  {item.question}
                  <ArrowRight
                    size={16}
                    className="text-gold-600 shrink-0 rotate-90 group-open:-rotate-90 transition-transform"
                  />
                </summary>
                <p className="mt-3 text-charcoal-600 text-sm sm:text-base leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Visit / NAP */}
      <section className="py-12 sm:py-16 bg-charcoal-900">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
            {t("servicePages.shared.visit")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gold-500 mt-0.5 shrink-0" />
              <p className="text-charcoal-300 text-sm">
                {business.streetAddress}
                <br />
                {business.postalCode} {business.addressLocality}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-gold-500 mt-0.5 shrink-0" />
              <a
                href={`tel:${business.phone}`}
                className="text-charcoal-300 hover:text-gold-400 text-sm transition-colors"
              >
                {business.phoneDisplay}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-gold-500 mt-0.5 shrink-0" />
              <p className="text-charcoal-300 text-sm">
                {t("contact.hours_weekday")}
                <br />
                {t("contact.hours_saturday")}
                <br />
                {t("contact.hours_sunday")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg sm:text-xl font-semibold text-charcoal-900 mb-5 sm:mb-6">
            {t("servicePages.shared.related")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {servicePageKeys
              .filter((key) => key !== pageKey)
              .map((key) => (
                <Link
                  key={key}
                  href={`/${key}`}
                  className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gold-100 hover:border-gold-300 hover:shadow-md transition-all px-4 sm:px-5 py-3 sm:py-4"
                >
                  <span className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-gold-600 shrink-0"
                    />
                    <span className="text-charcoal-800 text-sm sm:text-base font-medium">
                      {t(`servicePages.${key}.nav`)}
                    </span>
                  </span>
                  <ArrowRight size={16} className="text-charcoal-400" />
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
