import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The contact form's anti-automation token. Issued server-side when the page
 * renders and HMAC-signed, so it cannot be forged without loading the page.
 *
 * Single-use tracking is per serverless isolate, so it raises the cost of a
 * replay rather than making replay impossible; the edge rate limit in the
 * Vercel Firewall is the enforcement layer.
 */

const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 30 * 60 * 1000;

function signingKey(): string {
  const secret = process.env.FORM_SIGNING_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "FORM_SIGNING_SECRET is missing or shorter than 32 characters. " +
        "Add it to .env.local and the Vercel project before deploying."
    );
  }

  return secret;
}

function signature(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function issueFormToken(): string {
  const payload = `${Date.now()}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${signature(payload)}`;
}

export interface TokenResult {
  valid: boolean;
  reason?: string;
}

const spentNonces = new Map<string, number>();

function rememberNonce(nonce: string): void {
  const now = Date.now();

  for (const [spent, expiresAt] of spentNonces) {
    if (expiresAt < now) spentNonces.delete(spent);
  }

  spentNonces.set(nonce, now + MAX_AGE_MS);
}

export function verifyFormToken(token: unknown): TokenResult {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "invalid_format" };
  }

  const [issuedAt, nonce, providedSignature] = parts;

  const expected = Buffer.from(signature(`${issuedAt}.${nonce}`));
  const provided = Buffer.from(providedSignature);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return { valid: false, reason: "bad_signature" };
  }

  const issued = Number(issuedAt);
  if (!Number.isFinite(issued) || issued <= 0) {
    return { valid: false, reason: "invalid_timestamp" };
  }

  // Replay must be checked before the minimum-age rule: a token younger than
  // MIN_AGE_MS returns early with `too_fast`, so a spent token would otherwise
  // be accepted again for its first three seconds — which is exactly the window
  // an automated client submits inside.
  if (spentNonces.has(nonce)) {
    return { valid: false, reason: "replayed" };
  }

  const age = Date.now() - issued;
  if (age < MIN_AGE_MS) {
    return { valid: false, reason: "too_fast" };
  }
  if (age > MAX_AGE_MS) {
    return { valid: false, reason: "token_expired" };
  }

  return { valid: true };
}

/**
 * Marks a token spent. Kept separate from verification so that a submission
 * rejected by validation leaves the visitor's token usable — spending it there
 * forced a page reload and lost the message they had just typed. Call this only
 * once the submission is certain to be delivered.
 */
export function consumeFormToken(token: string): void {
  const nonce = token.split(".")[1];
  if (nonce) rememberNonce(nonce);
}
