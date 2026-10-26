import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-16 sm:pb-24">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-charcoal-900 via-charcoal-950 to-charcoal-900" />

      {/* Decorative glow elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gold-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gold-500 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 sm:pt-0">
        {/* Logo */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Lotus Craft"
            width={180}
            height={180}
            className="object-contain drop-shadow-2xl w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] lg:w-[180px] lg:h-[180px] 2xl:w-[220px] 2xl:h-[220px]"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl 2xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          {t("title_part1")}
          <span className="block text-gold-400">{t("title_part2")}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl 2xl:text-2xl text-white/75 mb-8 sm:mb-10 max-w-xl sm:max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed px-2">
          {t("subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/services"
            className="group flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gold-700 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-gold-800 transition-all shadow-lg shadow-gold-600/25 w-full sm:w-auto justify-center"
          >
            {t("cta_services")}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-charcoal-900 border-2 border-charcoal-700 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-charcoal-800 hover:border-charcoal-600 transition-all w-full sm:w-auto justify-center"
          >
            {t("cta_contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
