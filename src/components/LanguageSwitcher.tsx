"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "en" ? "fi" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-charcoal-600 hover:text-gold-600 transition-colors rounded-full border border-charcoal-200 hover:border-gold-300"
      aria-label="Switch language"
    >
      <Globe size={16} />
      <span>{locale === "en" ? "FI" : "EN"}</span>
    </button>
  );
}
