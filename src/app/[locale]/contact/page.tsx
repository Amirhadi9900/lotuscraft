import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { pageMetadata, resolveLocale } from "@/lib/seo";
import { issueFormToken } from "@/lib/form-token";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock, CreditCard } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(resolveLocale(locale), "contact", "/contact");
}

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <>
      {/* Page Header */}
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-16 bg-linear-to-b from-charcoal-900 to-charcoal-950">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white mb-3 sm:mb-4">
            {t("title")}
          </h1>
          <p className="text-charcoal-300 max-w-2xl mx-auto text-sm sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-4 sm:mt-6 w-16 sm:w-24 h-1 bg-gold-500 mx-auto rounded-full" />
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 sm:py-24">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 lg:p-10 shadow-sm border border-gold-100">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-5 sm:mb-8">
                  {t("form_title")}
                </h2>
                <ContactForm token={issueFormToken()} />
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              {/* Address */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm border border-gold-100">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold-50 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-gold-700 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm sm:text-base">
                    {t("address_title")}
                  </h3>
                </div>
                <p className="text-charcoal-600 text-sm pl-12 sm:pl-[52px]">
                  Helsinginkatu 11
                  <br />
                  Kustaankatu 1<br />
                  00500 Helsinki
                </p>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm border border-gold-100">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold-50 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-gold-700 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm sm:text-base">
                    {t("phone_title")}
                  </h3>
                </div>
                <a
                  href="tel:+358406812264"
                  className="text-charcoal-600 hover:text-gold-700 transition-colors text-sm pl-12 sm:pl-[52px] block"
                >
                  +358 40 681 2264
                </a>
              </div>

              {/* Email */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm border border-gold-100">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold-50 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-gold-700 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm sm:text-base">
                    {t("email_title")}
                  </h3>
                </div>
                <a
                  href="mailto:lotuscraft.fin@gmail.com"
                  className="text-charcoal-600 hover:text-gold-700 transition-colors text-sm pl-12 sm:pl-[52px] block break-all"
                >
                  lotuscraft.fin@gmail.com
                </a>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm border border-gold-100">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold-50 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <CreditCard size={18} className="text-gold-700 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm sm:text-base">
                    {t("payment_title")}
                  </h3>
                </div>
                <p className="text-charcoal-600 text-sm pl-12 sm:pl-[52px]">
                  {t("payment_value")}
                </p>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm border border-gold-100">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold-50 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-gold-700 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm sm:text-base">
                    {t("hours_title")}
                  </h3>
                </div>
                <ul className="text-charcoal-600 text-sm space-y-1 pl-12 sm:pl-[52px]">
                  <li>{t("hours_weekday")}</li>
                  <li>{t("hours_saturday")}</li>
                  <li>{t("hours_sunday")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
