import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

// The document shell lives here rather than in [locale]/layout.tsx so that
// routes outside the locale segment — the 404 page in particular — render
// inside a real <html>/<body> instead of tripping Next's missing-root-layout
// runtime error.
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerLocale = (await headers()).get("x-locale");
  const lang = (routing.locales as readonly string[]).includes(headerLocale ?? "")
    ? headerLocale!
    : routing.defaultLocale;

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
