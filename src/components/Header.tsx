"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";

export default function Header() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/services" as const, label: t("services") },
    { href: "/about" as const, label: t("about") },
    { href: "/gallery" as const, label: t("gallery") },
    { href: "/contact" as const, label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gold-100">
      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Lotus Craft"
              width={50}
              height={50}
              className="object-contain w-9 h-9 sm:w-[50px] sm:h-[50px]"
            />
            <span className="text-lg sm:text-xl font-bold text-charcoal-900">
              Lotus <span className="text-gold-600">Craft</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gold-600 whitespace-nowrap ${
                  pathname === link.href
                    ? "text-gold-600"
                    : "text-charcoal-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <Link
              href="/contact"
              className="hidden lg:inline-flex items-center px-5 py-2.5 bg-gold-600 text-white text-sm font-medium rounded-full hover:bg-gold-700 transition-colors whitespace-nowrap"
            >
              {t("contact")}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gold-100">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "text-gold-600"
                    : "text-charcoal-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-5 py-2.5 bg-gold-600 text-white text-sm font-medium rounded-full hover:bg-gold-700 transition-colors"
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
