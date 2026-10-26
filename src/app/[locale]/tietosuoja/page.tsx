import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pageMetadata, resolveLocale } from "@/lib/seo";

type Section = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "tietosuoja", "/tietosuoja");
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");
  const tn = useTranslations("navigation");
  const sections = t.raw("sections") as Section[];

  return (
    <>
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-14 bg-linear-to-b from-charcoal-900 to-charcoal-950">
        <div className="max-w-3xl 2xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t("title")}
          </h1>
          <p className="mt-4 text-charcoal-300 text-sm sm:text-lg max-w-2xl">
            {t("intro")}
          </p>
          <p className="mt-4 text-charcoal-400 text-xs sm:text-sm">{t("updated")}</p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-cream">
        <div className="max-w-3xl 2xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-9 sm:space-y-11">
            {sections.map((section, index) => (
              <article key={index}>
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="mt-3 text-sm sm:text-base leading-relaxed text-charcoal-700"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets.length > 0 && (
                  <ul className="mt-3 space-y-2 pl-5 list-disc text-sm sm:text-base leading-relaxed text-charcoal-700 marker:text-gold-700">
                    {section.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <div className="mt-12 sm:mt-14 pt-8 border-t border-gold-200">
            <p className="text-sm sm:text-base text-charcoal-700">
              {t("questions")}{" "}
              <Link
                href="/contact"
                className="text-gold-700 font-medium hover:underline"
              >
                {tn("contact")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
