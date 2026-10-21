/**
 * Secure Contact Form API Endpoint
 *
 * Protection layers:
 *  1. HTTP method restriction (POST only)
 *  2. Request header validation (Content-Type, User-Agent, bot detection)
 *  3. Origin/Referer validation (CSRF protection)
 *  4. Per-instance rate limit backstop (the enforced limit is the edge rule below)
 *  5. Honeypot field detection (the only silent discard)
 *  6. Signed, single-use form token issued when the page renders
 *  7. Input type & length validation
 *  8. Input sanitization (control-character removal)
 *  9. Spam content analysis — flags for review, never discards
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
  validateRequestHeaders,
  validateOrigin,
} from "@/lib/security";
import { verifyFormToken } from "@/lib/form-token";
import { logEvent, newRequestId } from "@/lib/log";
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
  const requestId = newRequestId();

  try {
    // ── Layer 1: Rate limiting (per-instance backstop) ──────────
    // The enforced limit is a Vercel Firewall rule at the edge:
    //   If      Path equals /api/contact  AND  Method equals POST
    //   Then    Rate Limit — Fixed window · 600s · 10 requests · key: IP
    //   Action  429
    // Hobby permits one rate-limit rule, so it is spent on this endpoint.
    //
    // This in-memory counter must stay strictly LOOSER than the edge rule.
    // It previously allowed 5 per 15 minutes, which tripped before the edge's
    // 10 per 10 minutes and made an unpredictable per-isolate limit the de
    // facto control. Kept at 6× the edge budget it only blunts a flood that
    // repeatedly reaches one warm isolate.
    //
    // `ip` is a usable key only because Vercel's edge overwrites
    // x-forwarded-for. Revisit if this is ever self-hosted behind a proxy.
    const rateCheck = checkRateLimit(ip, 60, 10 * 60 * 1000);
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
      logEvent("warn", "contact_rejected", { requestId, stage: "headers", reason: headerCheck.reason });
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      );
    }

    // ── Layer 3: Origin Validation (CSRF) ───────────────────────
    const originCheck = validateOrigin(request.headers);
    if (!originCheck.allowed) {
      logEvent("warn", "contact_rejected", { requestId, stage: "origin", reason: originCheck.reason });
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

    // ── Layer 5: Honeypot detection ─────────────────────────────
    // The only signal that still discards silently. The fields are hidden from
    // sight and keyboard, so a human cannot fill them: a value here is proof of
    // an automated client, with no realistic false positive.
    if (body.website || body.company || body.url || body.fax) {
      logEvent("warn", "contact_rejected", { requestId, stage: "honeypot" });
      return silentSuccess();
    }

    // ── Layer 6: Signed token validation ────────────────────────
    let quarantine: string | undefined;

    const tokenCheck = verifyFormToken(body._token);
    if (!tokenCheck.valid) {
      if (tokenCheck.reason === "too_fast") {
        // Suspicious timing is not proof of a bot — browser autofill can beat
        // the minimum age — so keep the enquiry and flag it for review.
        quarantine = "sent less than three seconds after the page opened";
        logEvent("warn", "contact_quarantined", {
          requestId,
          stage: "token",
          reason: tokenCheck.reason,
        });
      } else {
        logEvent("warn", "contact_rejected", { requestId, stage: "token", reason: tokenCheck.reason });
        return NextResponse.json(
          { error: "security_check_failed" },
          { status: 403 }
        );
      }
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

    // ── Layer 10: Spam detection ────────────────────────────────
    // Flagged rather than discarded. A developer's enquiry can quote a tag
    // containing "javascript:", and a hotel can legitimately write the words
    // "SEO services" — silently throwing those away loses customers without
    // anyone ever knowing.
    const messageSpam = detectSpam(sanitized.message);
    if (messageSpam.isSpam) {
      quarantine ??= `message matched "${messageSpam.reason}"`;
      logEvent("warn", "contact_quarantined", {
        requestId,
        stage: "spam",
        where: "message",
        reason: messageSpam.reason,
      });
    }

    const nameSpam = detectSpam(sanitized.name);
    if (nameSpam.isSpam) {
      quarantine ??= `name matched "${nameSpam.reason}"`;
      logEvent("warn", "contact_quarantined", {
        requestId,
        stage: "spam",
        where: "name",
        reason: nameSpam.reason,
      });
    }

    // ── Layer 11: Send Email ─────────────────────────────────────
    // Operational metadata only — no name, email, phone or business name, and
    // no IP. The submission goes to the business inbox and nowhere else.
    logEvent("info", "contact_accepted", {
      requestId,
      inquiryType: sanitized.inquiryType,
      industry: sanitized.industry || undefined,
      service: sanitized.service,
      messageLength: sanitized.message.length,
    });

    const emailResult = await sendContactEmail(sanitized, quarantine);

    if (!emailResult.success) {
      logEvent("error", "contact_delivery_failed", {
        requestId,
        reason: emailResult.error,
      });
      return NextResponse.json(
        { error: "email_failed" },
        { status: 500 }
      );
    }

    logEvent("info", "contact_delivered", {
      requestId,
      quarantined: quarantine !== undefined,
    });

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "X-RateLimit-Remaining": rateCheck.remaining.toString(),
        },
      }
    );
  } catch (error) {
    logEvent("error", "contact_error", {
      requestId,
      message: error instanceof Error ? error.message : "unknown",
    });
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
