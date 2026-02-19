import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { sewingCategories, laundryCategories } from "@/data/pricing";
import type { Category, Service } from "@/data/pricing";
import {
  Scissors,
  Shirt,
  ArrowRight,
  Info,
  Droplets,
  Sparkles,
  Home,
  ShieldCheck,
  Building2,
  Palette,
} from "lucide-react";

const sewingIcons: Record<string, typeof Scissors> = {
  general: Scissors,
  jackets_dresses: Shirt,
  trousers: Scissors,
  jeans: Scissors,
};

const laundryIcons: Record<string, typeof Droplets> = {
  rug_washing: Home,
  everyday_garments: Shirt,
  outerwear_jackets: ShieldCheck,
  formal_silk: Sparkles,
  bedding_home: Home,
};

function PriceDisplay({
  service,
  unit,
  t,
}: {
  service: Service;
  unit?: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const unitLabel = unit === "m2" ? t("services.per_m2") : "";

  if (service.priceMax) {
    return (
      <span className="text-gold-700 text-sm sm:text-base font-semibold whitespace-nowrap">
        {service.price}–{service.priceMax} {t("services.currency")}
        {unitLabel ? ` ${unitLabel}` : ""}
      </span>
    );
  }

  return (
    <span className="text-gold-700 text-sm sm:text-base font-semibold whitespace-nowrap">
      {unit ? "" : `${t("services.from")} `}
      {service.price} {t("services.currency")}
      {unitLabel ? ` ${unitLabel}` : ""}
    </span>
  );
}

function CategorySection({
  category,
  icons,
  t,
}: {
  category: Category;
  icons: Record<string, typeof Scissors>;
  t: ReturnType<typeof useTranslations>;
}) {
  const IconComponent = icons[category.id] || Scissors;

  return (
    <div id={category.id} className="scroll-mt-24 sm:scroll-mt-28">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
          <IconComponent className="text-gold-600 w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900">
            {t(`services.categories.${category.id}`)}
          </h3>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
            {t(`services.category_descriptions.${category.id}`)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gold-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-charcoal-100">
          {category.services.map((service, index) => (
            <div
              key={service.id}
              className={`flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 transition-colors hover:bg-gold-50/50 ${
                index % 2 === 0 ? "bg-white" : "bg-charcoal-50/30"
              }`}
            >
              <span className="text-charcoal-800 text-sm sm:text-base font-medium pr-3">
                {t(`services.items.${service.id}`)}
              </span>
              <PriceDisplay
                service={service}
                unit={category.unit}
                t={t}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const t = useTranslations();

  return (
    <>
      {/* Page Header */}
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-16 bg-linear-to-b from-charcoal-900 to-charcoal-950">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white mb-3 sm:mb-4">
            {t("services.title")}
          </h1>
          <p className="text-charcoal-300 max-w-2xl mx-auto text-sm sm:text-lg">
            {t("services.subtitle")}
          </p>
          <div className="mt-4 sm:mt-6 w-16 sm:w-24 h-1 bg-gold-500 mx-auto rounded-full" />

          {/* Jump links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            <a
              href="#sewing-section"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Scissors className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              {t("services.sewing_title")}
            </a>
            <a
              href="#laundry-section"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Droplets className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              {t("services.laundry_title")}
            </a>
          </div>
        </div>
      </section>

      {/* ── Sewing & Alterations ─────────────────────────────── */}
      <section id="sewing-section" className="pt-12 sm:pt-20 pb-8 sm:pb-12 scroll-mt-20">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-charcoal-900 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <Scissors className="text-gold-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
                {t("services.sewing_title")}
              </h2>
              <p className="text-charcoal-500 text-xs sm:text-sm">
                {t("services.sewing_subtitle")}
              </p>
            </div>
          </div>

          <div className="space-y-10 sm:space-y-14">
            {sewingCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                icons={sewingIcons}
                t={t}
              />
            ))}
          </div>

          {/* Custom sewing notice */}
          <div className="mt-10 sm:mt-14 flex items-start gap-3 bg-gold-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <Palette className="text-gold-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-charcoal-700 text-xs sm:text-sm leading-relaxed pt-1 sm:pt-2">
              {t("services.custom_sewing")}
            </p>
          </div>
        </div>
      </section>

      {/* Image strip between sections */}
      <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 rounded-xl sm:rounded-2xl overflow-hidden">
          {["/images/sew-4.jpeg", "/images/craft-3.jpeg", "/images/rug-6.jpeg", "/images/craft-7.jpeg"].map(
            (src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl">
                <Image
                  src={src}
                  alt="Lotus Craft work"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="25vw"
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Laundry & Dry Cleaning ───────────────────────────── */}
      <section id="laundry-section" className="pt-8 sm:pt-12 pb-12 sm:pb-20 scroll-mt-20">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-charcoal-900 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <Droplets className="text-gold-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
                {t("services.laundry_title")}
              </h2>
              <p className="text-charcoal-500 text-xs sm:text-sm">
                {t("services.laundry_subtitle")}
              </p>
            </div>
          </div>

          <div className="space-y-10 sm:space-y-14">
            {laundryCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                icons={laundryIcons}
                t={t}
              />
            ))}
          </div>

          {/* B2B contracts notice */}
          <div className="mt-10 sm:mt-14 flex items-start gap-3 bg-charcoal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-charcoal-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-charcoal-900 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="text-gold-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-charcoal-700 text-xs sm:text-sm leading-relaxed pt-1 sm:pt-2">
              {t("services.b2b_contracts")}
            </p>
          </div>

          {/* Pricing Note */}
          <div className="mt-6 sm:mt-8 flex items-start gap-3 bg-gold-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-200">
            <Info size={20} className="text-gold-600 mt-0.5 shrink-0" />
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              {t("services.note")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-20 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            {t("cta.services_cta_title")}
          </h2>
          <p className="text-charcoal-300 text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t("cta.services_cta_subtitle")}
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gold-600 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-gold-500 transition-all shadow-lg shadow-gold-600/25"
          >
            {t("common.get_quote")}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
