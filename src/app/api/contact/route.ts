/**
 * Secure Contact Form API Endpoint
 *
 * Protection layers:
 *  1. HTTP method restriction (POST only)
 *  2. Request header validation (Content-Type, User-Agent, bot detection)
 *  3. Origin/Referer validation (CSRF protection)
 *  4. Per-instance rate limit backstop (the enforced limit is the edge rule below)
 *  5. Honeypot field detection (silent rejection)
 *  6. Security token validation (time-based + nonce)
 *  7. Input type & length validation
 *  8. Input sanitization (XSS prevention)
 *  9. Spam content analysis (URLs, keywords, injection, patterns)
 * 10. Structured logging for monitoring
 * 11. Email delivery via Nodemailer (Gmail SMTP)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidMessage,
  detectSpam,
  checkRateLimit,
  validateSecurityToken,
  validateRequestHeaders,
  validateOrigin,
} from "@/lib/security";
import { sendContactEmail } from "@/lib/email";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function silentSuccess(): NextResponse {
  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    // ── Layer 1: Rate limiting (per-instance backstop) ──────────
    // The enforced limit is a Vercel Firewall rule at the edge:
    //   If      Path equals /api/contact  AND  Method equals POST
    //   Then    Rate Limit — Fixed window · 600s · 5 requests · key: IP
    //   Action  429 (default)
    // Hobby permits one rate-limit rule, so it is spent on this endpoint.
    //
    // This in-memory counter is only a backstop: every serverless isolate keeps
    // its own Map, so it cannot constrain an attacker across instances.
    //
    // `ip` is a usable key only because Vercel's edge overwrites
    // x-forwarded-for. Revisit if this is ever self-hosted behind a proxy.
    const rateCheck = checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateCheck.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // ── Layer 2: Request Header Validation ──────────────────────
    const headerCheck = validateRequestHeaders(request.headers);
    if (!headerCheck.valid) {
      console.warn(`[Contact] Header validation failed: ${headerCheck.reason}`, { ip });
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      );
    }

    // ── Layer 3: Origin Validation (CSRF) ───────────────────────
    if (!validateOrigin(request.headers)) {
      console.warn("[Contact] Origin mismatch", { ip });
      return NextResponse.json(
        { error: "invalid_origin" },
        { status: 403 }
      );
    }

    // ── Layer 4: Parse Request Body ─────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "invalid_json" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "invalid_body" },
        { status: 400 }
      );
    }

    // ── Layer 5: Honeypot Detection ─────────────────────────────
    // If bot filled hidden fields, silently accept (don't tip off the bot)
    if (body.website || body.company || body.url || body.fax) {
      console.warn("[Contact] Honeypot triggered", { ip });
      return silentSuccess();
    }

    // ── Layer 6: Security Token Validation ──────────────────────
    const tokenCheck = validateSecurityToken(body._token);
    if (!tokenCheck.valid) {
      console.warn(`[Contact] Token validation failed: ${tokenCheck.reason}`, { ip });
      if (tokenCheck.reason === "too_fast") {
        return silentSuccess();
      }
      return NextResponse.json(
        { error: "security_check_failed", detail: tokenCheck.reason },
        { status: 403 }
      );
    }

    // ── Layer 7: Extract & Type-Check Fields ────────────────────
    const { name, email, phone, message, service, preferredContact, inquiryType, businessName, industry } = body as Record<string, unknown>;

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json(
        { error: "invalid_field_types" },
        { status: 400 }
      );
    }

    if (phone !== undefined && phone !== "" && typeof phone !== "string") {
      return NextResponse.json(
        { error: "invalid_field_types" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedMessage = message.trim();

    // ── Layer 8: Input Validation ───────────────────────────────
    const errors: Record<string, string> = {};

    if (!isValidName(trimmedName)) {
      errors.name = "invalid_name";
    }
    if (!isValidEmail(trimmedEmail)) {
      errors.email = "invalid_email";
    }
    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      errors.phone = "invalid_phone";
    }
    if (!isValidMessage(trimmedMessage)) {
      errors.message = "invalid_message";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "validation_failed", fields: errors },
        { status: 400 }
      );
    }

    // ── Layer 9: Sanitize Inputs ────────────────────────────────
    const ALLOWED_SERVICES = ["sewing", "laundry", "rug_washing", "crafts", "b2b_contract", "other"];
    const ALLOWED_CONTACT = ["email", "phone", "either"];
    const ALLOWED_INQUIRY = ["individual", "business"];
    const ALLOWED_INDUSTRY = ["hotel", "hostel", "motel", "restaurant", "spa", "healthcare", "retail", "other_business"];
    const safeService = typeof service === "string" && ALLOWED_SERVICES.includes(service) ? service : "";
    const safeContact = typeof preferredContact === "string" && ALLOWED_CONTACT.includes(preferredContact) ? preferredContact : "";
    const safeInquiry = typeof inquiryType === "string" && ALLOWED_INQUIRY.includes(inquiryType) ? inquiryType : "individual";
    const safeBusinessName = typeof businessName === "string" ? sanitizeInput(businessName.trim()).slice(0, 100) : "";
    const safeIndustry = typeof industry === "string" && ALLOWED_INDUSTRY.includes(industry) ? industry : "";

    if (!safeService) errors.service = "invalid_service";
    if (!safeContact) errors.preferredContact = "invalid_contact";
    if (safeInquiry === "business") {
      if (!safeBusinessName) errors.businessName = "invalid_business_name";
      if (!safeIndustry) errors.industry = "invalid_industry";
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "validation_failed", fields: errors },
        { status: 400 }
      );
    }

    const sanitized = {
      name: sanitizeInput(trimmedName),
      email: sanitizeInput(trimmedEmail),
      phone: trimmedPhone ? sanitizeInput(trimmedPhone) : "",
      message: sanitizeInput(trimmedMessage),
      service: safeService,
      preferredContact: safeContact,
      inquiryType: safeInquiry,
      businessName: safeBusinessName,
      industry: safeIndustry,
    };

    // ── Layer 10: Spam Detection ────────────────────────────────
    const messageSpam = detectSpam(sanitized.message);
    if (messageSpam.isSpam) {
      console.warn(`[Contact] Spam detected in message: ${messageSpam.reason}`, { ip });
      return silentSuccess();
    }

    const nameSpam = detectSpam(sanitized.name);
    if (nameSpam.isSpam) {
      console.warn(`[Contact] Spam detected in name: ${nameSpam.reason}`, { ip });
      return silentSuccess();
    }

    // ── Layer 11: Send Email ─────────────────────────────────────
    console.log("[Contact] Valid submission — sending email...", {
      timestamp: new Date().toISOString(),
      ip,
      inquiryType: sanitized.inquiryType,
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone || "(not provided)",
      businessName: sanitized.businessName || "(not provided)",
      industry: sanitized.industry || "(not selected)",
      service: sanitized.service || "(not selected)",
      preferredContact: sanitized.preferredContact || "(not selected)",
      messageLength: sanitized.message.length,
    });

    const emailResult = await sendContactEmail(sanitized);

    if (!emailResult.success) {
      console.error("[Contact] Email delivery failed:", emailResult.error);
      return NextResponse.json(
        { error: "email_failed" },
        { status: 500 }
      );
    }

    console.log("[Contact] Email sent successfully to", process.env.CONTACT_EMAIL_TO);

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "X-RateLimit-Remaining": rateCheck.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("[Contact] Unexpected server error", { ip, error });
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "method_not_allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "method_not_allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "method_not_allowed" },
    { status: 405 }
  );
}
