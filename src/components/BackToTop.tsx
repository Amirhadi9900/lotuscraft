"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER_PX = 600;

export default function BackToTop() {
  const t = useTranslations("navigation");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "instant" : "smooth" });
  }

  // visibility:hidden rather than an unmount so the button can fade, and stays
  // out of the tab order and the accessibility tree while it is off-screen.
  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("back_to_top")}
      title={t("back_to_top")}
      className={`fixed bottom-5 right-4 sm:bottom-8 sm:right-8 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gold-700 text-white shadow-lg shadow-gold-600/25 transition-all duration-300 hover:bg-gold-800 hover:shadow-xl hover:shadow-gold-600/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ${
        visible
          ? "opacity-100 translate-y-0"
          : "invisible opacity-0 translate-y-3"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
