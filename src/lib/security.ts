/**
 * Security utilities for form protection.
 * Multi-layered defense against bots, spam, and abuse.
 */

// ─── Input Sanitization ────────────────────────────────────────────

/**
 * Escape HTML entities. Apply this where a value is rendered into HTML, never
 * to input on its way in — escaping early and again at render is what produced
 * the double-encoded text customers currently receive.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Drops control characters that corrupt mail headers and log lines, keeping
// tab and newline because they are legitimate inside a message.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\r\u000E-\u001F\u007F]/g;

/**
 * Normalise untrusted input: strip control characters and surrounding
 * whitespace. Output escaping is each renderer's job.
 */
export function sanitizeInput(input: string): string {
  return input.replace(CONTROL_CHARS, "").trim();
}

// ─── Field Limits (single source of truth) ─────────────────────────

export const FIELD_LIMITS = {
  name: { min: 2, max: 50 },
  email: { min: 5, max: 80 },
  phone: { min: 6, max: 20 },
  message: { min: 10, max: 5000 },
} as const;

// ─── Validation ────────────────────────────────────────────────────

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PHONE_REGEX = /^[+]?[\d\s()\-]{6,20}$/;

export function isValidEmail(email: string): boolean {
  return (
    email.length >= FIELD_LIMITS.email.min &&
    email.length <= FIELD_LIMITS.email.max &&
    EMAIL_REGEX.test(email)
  );
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  if (phone.length > FIELD_LIMITS.phone.max) return false;
  return PHONE_REGEX.test(phone);
}

export function isValidName(name: string): boolean {
  if (name.length < FIELD_LIMITS.name.min || name.length > FIELD_LIMITS.name.max) return false;
  const urlPattern = /https?:\/\//i;
  if (urlPattern.test(name)) return false;
  const scriptPattern = /<script|javascript:|on\w+\s*=/i;
  if (scriptPattern.test(name)) return false;
  return true;
}

export function isValidMessage(message: string): boolean {
  return (
    message.length >= FIELD_LIMITS.message.min &&
    message.length <= FIELD_LIMITS.message.max
  );
}

// ─── Spam Detection ────────────────────────────────────────────────

export interface SpamResult {
  isSpam: boolean;
  reason?: string;
}

export function detectSpam(text: string): SpamResult {
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = text.match(urlPattern);
  if (urls && urls.length > 2) {
    return { isSpam: true, reason: "excessive_urls" };
  }

  const spamKeywords = [
    /\b(viagra|cialis|casino|lottery|prize|winner|crypto\s*airdrop)\b/i,
    /\b(click here|buy now|free money|earn \$|make money fast)\b/i,
    /\b(SEO services|backlinks|web traffic|guaranteed results)\b/i,
  ];
  for (const pattern of spamKeywords) {
    if (pattern.test(text)) {
      return { isSpam: true, reason: "spam_keywords" };
    }
  }

  const injectionPatterns = [
    /<script\b/i,
    /javascript\s*:/i,
    /on(click|load|error|mouseover|focus)\s*=/i,
    /data\s*:\s*text\/html/i,
    /\beval\s*\(/i,
    /\bdocument\.(cookie|location|write)/i,
    /\bwindow\.(location|open)\b/i,
  ];
  for (const pattern of injectionPatterns) {
    if (pattern.test(text)) {
      return { isSpam: true, reason: "injection_attempt" };
    }
  }

  if (text.length > 30) {
    const upperCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.75) {
      return { isSpam: true, reason: "excessive_caps" };
    }
  }

  const words = text.toLowerCase().split(/\s+/);
  if (words.length > 5) {
    const wordCounts = new Map<string, number>();
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
    const maxRepeat = Math.max(...wordCounts.values());
    if (maxRepeat > words.length * 0.5 && maxRepeat > 5) {
      return { isSpam: true, reason: "repetitive_content" };
    }
  }

  return { isSpam: false };
}

// ─── Rate Limiting (in-memory; use Redis in production) ────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanupRateLimitStore() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupRateLimitStore();
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// ─── Request Header Validation ─────────────────────────────────────

export function validateRequestHeaders(headers: Headers): {
  valid: boolean;
  reason?: string;
} {
  const contentType = headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return { valid: false, reason: "invalid_content_type" };
  }

  const userAgent = headers.get("user-agent");
  if (!userAgent || userAgent.length < 10) {
    return { valid: false, reason: "missing_user_agent" };
  }

  // Search-engine crawlers are not the threat this form faces — they do not POST
  // enquiries — and the previous /bot(?!.*googlebot)/ lookahead never behaved as
  // it read: it matched the "bot" inside Googlebot's own UA and rejected it.
  if (!/googlebot|bingbot/i.test(userAgent)) {
    const botPatterns = [
      /bot/i,
      /spider/i,
      /crawl/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /http-client/i,
    ];
    for (const pattern of botPatterns) {
      if (pattern.test(userAgent)) {
        return { valid: false, reason: "bot_user_agent" };
      }
    }
  }

  return { valid: true };
}

// ─── Origin Validation ─────────────────────────────────────────────

/**
 * Normalises a Host header or an Origin/Referer URL down to `hostname[:port]`.
 * Parsing rather than string surgery matters: `http://localhost:3000@evil.example`
 * and `http://localhost:3000.evil.example` both read as "this host" to a
 * split-on-slash/split-on-colon routine, while URL() reports the real hostname.
 * Default ports are dropped so https://example.com matches Host: example.com.
 */
function hostAndPort(value: string): string | null {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const defaultPort = url.protocol === "https:" ? "443" : "80";
    const port = url.port && url.port !== defaultPort ? `:${url.port}` : "";
    return `${url.hostname.toLowerCase()}${port}`;
  } catch {
    return null;
  }
}

/**
 * Same-origin check for the contact form. This fails CLOSED: a request that
 * cannot show it came from this site is rejected. It previously returned true
 * whenever Origin or Host was absent, so any non-browser client could simply
 * omit the header and walk past the CSRF layer.
 */
export function validateOrigin(headers: Headers): {
  allowed: boolean;
  reason?: string;
} {
  const host = headers.get("host");
  if (!host) return { allowed: false, reason: "missing_host" };

  // Browsers send Origin on cross-origin POSTs; Referer is the fallback for
  // the clients that omit it.
  const candidate = headers.get("origin") ?? headers.get("referer");

  if (!candidate) return { allowed: false, reason: "missing_origin" };

  // Sandboxed frames and some privacy configurations report an opaque origin.
  if (candidate === "null") return { allowed: false, reason: "opaque_origin" };

  const expected = hostAndPort(host);
  const sent = hostAndPort(candidate);

  if (!expected || !sent) {
    return { allowed: false, reason: "unparseable_origin" };
  }

  return sent === expected
    ? { allowed: true }
    : { allowed: false, reason: "origin_mismatch" };
}
