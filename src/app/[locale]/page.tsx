import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { pageMetadata, resolveLocale } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Hero from "@/components/Hero";
import { sewingCategories, laundryCategories } from "@/data/pricing";
import type { Category } from "@/data/pricing";
import {
  Scissors,
  Shirt,
  ArrowRight,
  Star,
  Heart,
  Leaf,
  Users,
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

const laundryIcons: Record<string, typeof Scissors> = {
  rug_washing: Home,
  everyday_garments: Shirt,
  outerwear_jackets: ShieldCheck,
  formal_silk: Sparkles,
  bedding_home: Home,
};

// Categories with a dedicated landing page link there; the rest stay anchored on the hub.
const categoryPages: Record<string, string> = {
  general: "/korjausompelu",
  jackets_dresses: "/korjausompelu",
  trousers: "/korjausompelu",
  jeans: "/korjausompelu",
  rug_washing: "/mattopesu",
  everyday_garments: "/kuivapesu",
  outerwear_jackets: "/kuivapesu",
  formal_silk: "/kuivapesu",
};

function ServiceCard({
  category,
  icons,
  t,
  anchor,
}: {
  category: Category;
  icons: Record<string, typeof Scissors>;
  t: ReturnType<typeof useTranslations>;
  anchor: string;
}) {
  const IconComponent = icons[category.id] || Scissors;
  const lowestPrice = Math.min(...category.services.map((s) => s.price));
  const unitLabel = category.unit === "m2" ? ` ${t("services.per_m2")}` : "";

  return (
    <Link
      href={categoryPages[category.id] ?? `/services#${anchor}`}
      className="group bg-white rounded-2xl p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gold-100 hover:border-gold-300"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gold-50 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-gold-100 transition-colors">
          <IconComponent className="text-gold-600 w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <span className="text-xs sm:text-sm text-gold-600 font-semibold bg-gold-50 px-2.5 py-1 rounded-full">
          {t("services.from")} {lowestPrice} {t("services.currency")}
          {unitLabel}
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-charcoal-900 mb-1.5 sm:mb-2">
        {t(`services.categories.${category.id}`)}
      </h3>
      <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
        {t(`services.category_descriptions.${category.id}`)}
      </p>
      <div className="text-charcoal-400 text-xs">
        {category.services.length}{" "}
        {category.services.length === 1 ? "service" : "services"}
      </div>
    </Link>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "home", "/");
}

export default function HomePage() {
  const t = useTranslations();

  const values = [
    { key: "quality", icon: Star },
    { key: "care", icon: Heart },
    { key: "sustainability", icon: Leaf },
    { key: "customer", icon: Users },
  ];

  return (
    <>
      <Hero />

      {/* ── Sewing Services Overview ─────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal-900 text-gold-400 text-xs sm:text-sm font-medium mb-4">
              <Scissors className="w-3.5 h-3.5" />
              {t("services.sewing_title")}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-charcoal-900 mb-3 sm:mb-4">
              {t("services.sewing_title")}
            </h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto text-sm sm:text-base">
              {t("services.sewing_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {sewingCategories.map((category) => (
              <ServiceCard
                key={category.id}
                category={category}
                icons={sewingIcons}
                t={t}
                anchor={category.id}
              />
            ))}
          </div>

          {/* Custom sewing notice */}
          <div className="mt-8 sm:mt-12 flex items-start gap-3 sm:gap-4 bg-gold-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-200">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold-100 rounded-xl flex items-center justify-center shrink-0">
              <Palette className="text-gold-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-charcoal-700 text-sm sm:text-base leading-relaxed pt-1.5 sm:pt-1">
              {t("services.custom_sewing")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Image Showcase (Rug Washing) ──────────────────────── */}
      <section className="pb-4 sm:pb-8">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 rounded-xl sm:rounded-2xl overflow-hidden">
            {["/images/sew-1.jpeg", "/images/sew-2.jpeg", "/images/sew-3.jpeg"].map(
              (src, i) => (
                <div key={i} className="relative aspect-4/3 overflow-hidden bg-charcoal-50">
                  <Image
                    src={src}
                    alt={t("images.sewing_home")}
                    fill
                    className="object-contain p-1 hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 33vw, 33vw"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Laundry Services Overview ────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal-900 text-gold-400 text-xs sm:text-sm font-medium mb-4">
              <Droplets className="w-3.5 h-3.5" />
              {t("services.laundry_title")}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-charcoal-900 mb-3 sm:mb-4">
              {t("services.laundry_title")}
            </h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto text-sm sm:text-base">
              {t("services.laundry_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {laundryCategories.map((category) => (
              <ServiceCard
                key={category.id}
                category={category}
                icons={laundryIcons}
                t={t}
                anchor={category.id}
              />
            ))}
          </div>

          {/* B2B contracts notice */}
          <div className="mt-8 sm:mt-12 flex items-start gap-3 sm:gap-4 bg-charcoal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-charcoal-200">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-charcoal-900 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="text-gold-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-charcoal-700 text-sm sm:text-base leading-relaxed pt-1.5 sm:pt-1">
              {t("services.b2b_contracts")}
            </p>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3 bg-charcoal-900 text-white text-sm sm:text-base font-medium rounded-full hover:bg-charcoal-800 transition-colors"
            >
              {t("common.view_pricing")}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-charcoal-900 mb-3 sm:mb-4">
              {t("about.why_choose_title")}
            </h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto text-sm sm:text-base">
              {t("about.why_choose_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {values.map((value) => {
              const IconComponent = value.icon;
              return (
                <div key={value.key} className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <IconComponent className="text-gold-600 w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-charcoal-900 mb-1 sm:mb-2">
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

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-charcoal-300 text-sm sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/contact"
              className="group flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gold-600 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-gold-500 transition-all shadow-lg shadow-gold-600/25 w-full sm:w-auto justify-center"
            >
              {t("common.get_quote")}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="tel:+358406812264"
              className="px-6 py-3 sm:px-8 sm:py-4 bg-charcoal-900 border-2 border-charcoal-700 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-charcoal-800 hover:border-charcoal-600 transition-all w-full sm:w-auto text-center"
            >
              +358 40 681 2264
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
