import { randomBytes } from "node:crypto";

/**
 * Structured logging that carries no customer data.
 *
 * Fields are serialised as JSON so a value containing a newline cannot forge an
 * additional log line. The client IP is deliberately absent from every event:
 * Vercel's firewall already holds IP-level abuse visibility, and that is the
 * right place to look an offender up. Repeating it here would only widen the
 * amount of personal data sitting in retained logs.
 */

export function newRequestId(): string {
  return randomBytes(6).toString("base64url");
}

type LogValue = string | number | boolean | undefined;

export function logEvent(
  level: "info" | "warn" | "error",
  event: string,
  fields: Record<string, LogValue> = {}
): void {
  const line = JSON.stringify({ event, ...fields });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
