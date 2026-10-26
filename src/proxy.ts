import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Next's runtime sets inline style attributes (next/image colour
    // placeholder, route announcer positioning). script-src stays nonce-locked,
    // which is where the real XSS risk is; data exfiltration via injected CSS
    // is closed off by the img/connect restrictions below.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    IS_PRODUCTION
      ? "connect-src 'self'"
      : // Turbopack's dev server needs a live WebSocket for HMR.
        "connect-src 'self' ws: http://localhost:*",
    "object-src 'none'",
    "base-uri 'self'",
    // The contact form must only ever post to our own endpoint.
    "form-action 'self'",
    "frame-ancestors 'self'",
    "frame-src 'none'",
  ].join("; ");
}

export default function proxy(request: NextRequest) {
  const nonce = createNonce();

  // The root layout owns <html lang>, including for routes outside [locale]
  // such as the 404 page, so it needs the locale resolved before rendering.
  // An unprefixed or unknown path is the default locale, which is what
  // next-intl's as-needed prefix scheme serves.
  const firstSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  const locale = (routing.locales as readonly string[]).includes(firstSegment ?? "")
    ? firstSegment!
    : routing.defaultLocale;

  // Both headers must be set before handing the request to next-intl: its
  // middleware forwards a cloned header set, so anything written afterwards is
  // dropped before the renderer sees it.
  request.headers.set("x-nonce", nonce);
  request.headers.set("x-locale", locale);

  const response = nextIntlMiddleware(request);

  response.headers.set("x-nonce", nonce);
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
