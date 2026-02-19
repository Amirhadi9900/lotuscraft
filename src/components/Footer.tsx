import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin, Phone, Mail, Instagram } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("navigation");

  return (
    <footer className="bg-charcoal-900 text-white">
      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="Lotus Craft"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-lg font-bold">
                Lotus <span className="text-gold-400">Craft</span>
              </span>
            </div>
            <p className="text-charcoal-400 text-sm leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">
              {t("quick_links")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/" as const, label: nav("home") },
                { href: "/services" as const, label: nav("services") },
                { href: "/about" as const, label: nav("about") },
                { href: "/gallery" as const, label: nav("gallery") },
                { href: "/contact" as const, label: nav("contact") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-charcoal-300 hover:text-gold-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">
              {t("contact_info")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="text-gold-500 mt-0.5 shrink-0"
                />
                <span className="text-charcoal-300 text-sm">
                  Helsinginkatu 11
                  <br />
                  Kustaankatu 1<br />
                  00500 Helsinki
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold-500 shrink-0" />
                <a
                  href="tel:+358406812264"
                  className="text-charcoal-300 hover:text-gold-400 text-sm transition-colors"
                >
                  +358 40 681 2264
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold-500 shrink-0" />
                <a
                  href="mailto:lotuscraft.fin@gmail.com"
                  className="text-charcoal-300 hover:text-gold-400 text-sm transition-colors break-all"
                >
                  lotuscraft.fin@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram size={18} className="text-gold-500 shrink-0" />
                <a
                  href="https://www.instagram.com/ompelimo_lotuscrafted/?g=5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-charcoal-300 hover:text-gold-400 text-sm transition-colors"
                >
                  @ompelimo_lotuscrafted
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">
              {t("hours_title")}
            </h3>
            <ul className="space-y-3 text-sm text-charcoal-300">
              <li>{t("hours_weekday")}</li>
              <li>{t("hours_saturday")}</li>
              <li>{t("hours_sunday")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-charcoal-800">
          <p className="text-center text-xs sm:text-sm text-charcoal-500">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
