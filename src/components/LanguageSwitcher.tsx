"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

/**
 * Flag geometry taken from the public-domain flag-icons set rather than drawn
 * by hand — the Union Jack's counterchanged saltire is easy to get subtly
 * wrong. Emoji flags are not an option: Windows renders them as the letters
 * "FI"/"GB", which is the same as having no flag at all.
 */

function FlagFinland() {
  return (
    <svg
      viewBox="0 0 640 480"
      aria-hidden="true"
      focusable="false"
      className="h-[15px] w-[20px] shrink-0 rounded-[2px] ring-1 ring-charcoal-900/20"
    >
      <path fill="#fff" d="M0 0h640v480H0z" />
      <path fill="#002f6c" d="M0 174.5h640v131H0z" />
      <path fill="#002f6c" d="M175.5 0h130.9v480h-131z" />
    </svg>
  );
}

function FlagUnitedKingdom() {
  return (
    <svg
      viewBox="0 0 640 480"
      aria-hidden="true"
      focusable="false"
      className="h-[15px] w-[20px] shrink-0 rounded-[2px] ring-1 ring-charcoal-900/20"
    >
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path
        fill="#FFF"
        d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z"
      />
      <path
        fill="#C8102E"
        d="m424 281 216 159v40L369 281zm-184 20 6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z"
      />
      <path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z" />
      <path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z" />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("navigation");
  const router = useRouter();
  const pathname = usePathname();

  // The control advertises the language you would switch TO, not the current one.
  const target = locale === "en" ? "fi" : "en";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: target })}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-charcoal-600 hover:text-gold-600 transition-colors rounded-full border border-charcoal-200 hover:border-gold-300"
      aria-label={
        target === "fi" ? t("switch_to_fi") : t("switch_to_en")
      }
      title={target === "fi" ? t("switch_to_fi") : t("switch_to_en")}
    >
      {target === "fi" ? <FlagFinland /> : <FlagUnitedKingdom />}
      <span>{target === "fi" ? "FI" : "EN"}</span>
    </button>
  );
}
