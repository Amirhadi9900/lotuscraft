import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Home, Scissors, Phone } from "lucide-react";
import { business } from "@/lib/seo";

// Prerendered error pages cannot carry the per-request CSP nonce minted in
// src/proxy.ts, and 'strict-dynamic' then blocks every script on them.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "404 – Sivua ei löytynyt | Lotus Craft",
  robots: { index: false, follow: true },
};

const destinations = [
  {
    href: "/",
    Icon: Home,
    fi: "Etusivu",
    en: "Home",
    fiNote: "Tutustu palveluihin ja galleriaan.",
    enNote: "Sewing, alterations and laundry in Kallio.",
  },
  {
    href: "/services",
    Icon: Scissors,
    fi: "Palvelut ja hinnat",
    en: "Services & pricing",
    fiNote: "Kaikki hinnat ja työt.",
    enNote: "Every service with its price.",
  },
  {
    href: "/contact",
    Icon: Phone,
    fi: "Yhteystiedot",
    en: "Contact",
    fiNote: "Soita tai lähetä viesti.",
    enNote: "Call, write or drop by.",
  },
];

export default function NotFound() {
  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border-b border-gold-100">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 h-16 sm:h-20">
            <Image
              src="/images/logo.png"
              alt="Lotus Craft"
              width={50}
              height={50}
              className="object-contain w-9 h-9 sm:w-[50px] sm:h-[50px]"
              priority
            />
            <span className="text-lg sm:text-xl font-bold text-charcoal-900">
              Lotus <span className="text-gold-700">Craft</span>
            </span>
          </Link>
        </div>
      </div>

      <main className="min-h-screen bg-cream">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-charcoal-900 via-charcoal-950 to-charcoal-900" />
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gold-500 to-transparent" />
          <div className="relative z-10 max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <p className="text-gold-400 font-semibold tracking-[0.2em] text-sm sm:text-base">
              404
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Sivua ei löytynyt
            </h1>
            <p className="mt-4 text-charcoal-300 max-w-xl mx-auto text-sm sm:text-lg">
              Valitettavasti tätä sivua ei löydy.{" "}
              <span lang="en">The page you were looking for has moved or never existed.</span>
            </p>
            <div className="mt-6 sm:mt-8 w-16 sm:w-24 h-1 bg-gold-500 mx-auto rounded-full" />
          </div>
        </section>

        <section className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {destinations.map(({ href, Icon, fi, en, fiNote, enNote }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-start gap-3 bg-white rounded-2xl border border-gold-100 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-gold-200 transition-all duration-300"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700 group-hover:bg-gold-100 transition-colors">
                  <Icon size={20} />
                </span>
                <span className="text-lg font-semibold text-charcoal-900 group-hover:text-gold-700 transition-colors">
                  {fi}
                </span>
                <span className="text-sm text-charcoal-600">
                  {fiNote} <span lang="en">· {en}</span>
                </span>
                <span className="sr-only">{enNote}</span>
              </Link>
            ))}
          </div>

          <div className="mt-10 sm:mt-14 rounded-2xl border border-gold-100 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-charcoal-900">
                Poikkeaminen ei haittaa — käy meillä
              </h2>
              <p className="mt-1 text-sm text-charcoal-600">
                {business.streetAddress}, Helsinki · {business.phone}
              </p>
              <p className="mt-1 text-sm text-charcoal-600">
                Ma–Pe 10:00–18:00 · La 10:00–16:00 · Su kiinni
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold-700 text-white text-sm font-medium rounded-full hover:bg-gold-800 transition-colors shadow-lg shadow-gold-700/20 whitespace-nowrap"
            >
              Ota yhteyttä · Contact us
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
