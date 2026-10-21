import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { pageMetadata, resolveLocale } from "@/lib/seo";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Star, Heart, Leaf, Users, ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "about", "/about");
}

export default function AboutPage() {
  const t = useTranslations();

  const values = [
    { key: "quality", icon: Star },
    { key: "care", icon: Heart },
    { key: "sustainability", icon: Leaf },
    { key: "customer", icon: Users },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-16 bg-linear-to-b from-charcoal-900 to-charcoal-950">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white mb-3 sm:mb-4">
            {t("about.title")}
          </h1>
          <p className="text-charcoal-300 max-w-2xl mx-auto text-sm sm:text-lg">
            {t("about.subtitle")}
          </p>
          <div className="mt-4 sm:mt-6 w-16 sm:w-24 h-1 bg-gold-500 mx-auto rounded-full" />
        </div>
      </section>

      {/* Our Story */}
      <section className="py-14 sm:py-24">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-10 sm:mb-16 text-center">
            {t("about.story_title")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div>
              <div className="space-y-3 sm:space-y-4 text-charcoal-600 text-sm sm:text-base leading-relaxed">
                <p>{t("about.story_p1")}</p>
                <p>{t("about.story_p2")}</p>
                <p>{t("about.story_p3")}</p>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="relative aspect-4/3 rounded-xl sm:rounded-2xl overflow-hidden">
                  <Image
                    src="/images/craft-1.jpeg"
                    alt={t("images.handmade_creation")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-4/3 rounded-xl sm:rounded-2xl overflow-hidden mt-6 sm:mt-8">
                  <Image
                    src="/images/rug-7.jpeg"
                    alt={t("images.rug_washing")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-4/3 rounded-xl sm:rounded-2xl overflow-hidden">
                  <Image
                    src="/images/rug-4.jpeg"
                    alt={t("images.rug_washing")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-4/3 rounded-xl sm:rounded-2xl overflow-hidden mt-6 sm:mt-8">
                  <Image
                    src="/images/craft-5.jpeg"
                    alt={t("images.handmade_creation")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-full h-full bg-gold-200/30 rounded-2xl sm:rounded-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-4 sm:mb-6">
            {t("about.mission_title")}
          </h2>
          <p className="text-base sm:text-xl text-charcoal-600 leading-relaxed">
            {t("about.mission")}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 sm:py-24">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 text-center mb-10 sm:mb-16">
            {t("about.values_title")}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {values.map((value) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={value.key}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center shadow-sm border border-gold-100"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                    <IconComponent className="text-gold-600 w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-charcoal-900 mb-1.5 sm:mb-3">
                    {t(`about.values.${value.key}.title`)}
                  </h3>
                  <p className="text-charcoal-500 text-xs sm:text-sm">
                    {t(`about.values.${value.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 bg-gold-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-3 sm:mb-4">
            {t("cta.about_cta_title")}
          </h2>
          <p className="text-charcoal-500 text-sm sm:text-base mb-6 sm:mb-8">
            {t("cta.about_cta_subtitle")}
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
