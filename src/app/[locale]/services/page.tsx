import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { pageMetadata, resolveLocale } from "@/lib/seo";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { sewingCategories, laundryCategories } from "@/data/pricing";
import { CategorySection } from "@/components/PriceTable";
import {
  Scissors,
  ArrowRight,
  Info,
  Droplets,
  Building2,
  Palette,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "services", "/services");
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
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-charcoal-900 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <Scissors className="text-gold-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
                {t("services.sewing_title")}
              </h2>
              <p className="text-charcoal-600 text-xs sm:text-sm">
                {t("services.sewing_subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 sm:mb-12">
            {["korjausompelu"].map((key) => (
              <Link
                key={key}
                href={`/${key}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 hover:text-gold-700"
              >
                {t(`servicePages.${key}.nav`)}
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>

          <div className="space-y-10 sm:space-y-14">
            {sewingCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>

          {/* Custom sewing notice */}
          <div className="mt-10 sm:mt-14 flex items-start gap-3 bg-gold-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <Palette className="text-gold-700 w-4 h-4 sm:w-5 sm:h-5" />
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
          {[
            { src: "/images/sew-4.jpeg", alt: "i24", contain: true },
            { src: "/images/craft-3.jpeg", alt: "i12", contain: false },
            { src: "/images/rug-6.jpeg", alt: "i6", contain: false },
            { src: "/images/craft-7.jpeg", alt: "i16", contain: false },
          ].map((img, i) => (
              <div key={i} className={`relative aspect-square overflow-hidden rounded-lg sm:rounded-xl ${img.contain ? "bg-charcoal-50" : ""}`}>
                <Image
                  src={img.src}
                  alt={t(`images.gallery.${img.alt}`)}
                  fill
                  className={`${img.contain ? "object-contain p-1" : "object-cover"} hover:scale-105 transition-transform duration-500`}
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
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-charcoal-900 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <Droplets className="text-gold-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
                {t("services.laundry_title")}
              </h2>
              <p className="text-charcoal-600 text-xs sm:text-sm">
                {t("services.laundry_subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 sm:mb-12">
            {["mattopesu", "kuivapesu", "hotellipesula"].map((key) => (
              <Link
                key={key}
                href={`/${key}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 hover:text-gold-700"
              >
                {t(`servicePages.${key}.nav`)}
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>

          <div className="space-y-10 sm:space-y-14">
            {laundryCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
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
            <Info size={20} className="text-gold-700 mt-0.5 shrink-0" />
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
            className="group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gold-700 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-gold-800 transition-all shadow-lg shadow-gold-600/25"
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
