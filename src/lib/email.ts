import { createTransport, type Transporter } from "nodemailer";
import { escapeHtml } from "@/lib/security";
import { logEvent } from "@/lib/log";

// ─── SMTP Transporter (singleton) ──────────────────────────────

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const secure = process.env.SMTP_SECURE === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error(
        "Missing SMTP configuration. Check .env.local for SMTP_HOST, SMTP_USER, SMTP_PASS."
      );
    }

    transporter = createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      // Without these, a Gmail endpoint that accepts the connection but stops
      // talking holds the serverless function open until the platform kills it,
      // turning one slow upstream into a pool of stuck request slots.
      connectionTimeout: 10_000,
      greetingTimeout: 5_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

// ─── Types ─────────────────────────────────────────────────────

interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
  service: string;
  preferredContact: string;
  inquiryType: string;
  businessName: string;
  industry: string;
  /** ISO timestamp recorded when the sender accepted the privacy notice. */
  consentAt: string;
}

// ─── Label maps ────────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  sewing: "Sewing & Alterations",
  laundry: "Laundry & Dry Cleaning",
  rug_washing: "Rug Washing",
  crafts: "Custom Crafts",
  b2b_contract: "Contract-Based Laundry (B2B)",
  other: "Other / General Inquiry",
};

const CONTACT_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  either: "No preference",
};

const INDUSTRY_LABELS: Record<string, string> = {
  hotel: "Hotel",
  hostel: "Hostel",
  motel: "Motel",
  restaurant: "Restaurant / Café",
  spa: "Spa / Wellness",
  healthcare: "Healthcare / Clinic",
  retail: "Retail / Fashion",
  other_business: "Other",
};

// ─── Build HTML email ──────────────────────────────────────────

function quarantineBanner(reason: string): string {
  return `
              <div style="margin:0 0 24px;padding:16px 18px;background-color:#fdf3e3;border-left:4px solid #d08b2d;border-radius:8px;">
                <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;color:#995420;font-weight:700;">Flagged by the automated filter — please review</p>
                <p style="margin:0;font-size:14px;color:#4a4458;line-height:1.6;">Reason: ${escapeHtml(reason)}. This message was <strong>not discarded</strong>, because the filter also catches genuine enquiries. Check it before ignoring it.</p>
              </div>`;
}

function buildEmailHtml(data: ContactSubmission, quarantine?: string): string {
  const esc = escapeHtml;
  const serviceLabel = SERVICE_LABELS[data.service] || "Not specified";
  const contactLabel = CONTACT_LABELS[data.preferredContact] || "Not specified";
  const industryLabel = INDUSTRY_LABELS[data.industry] || "";
  const isB2B = data.inquiryType === "business";
  const inquiryLabel = isB2B ? "Business (B2B)" : "Individual (B2C)";
  const escapedMessage = esc(data.message).replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f6f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f6f3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1625;padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#d4a843;letter-spacing:0.5px;">
                Lotus Craft
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#a09cae;">
                New Contact Form Submission
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">
              ${quarantine ? quarantineBanner(quarantine) : ""}
              <!-- Greeting -->
              <p style="margin:0 0 24px;font-size:15px;color:#4a4458;line-height:1.6;">
                You have received a new message from the Lotus Craft website contact form.
              </p>

              <!-- Info Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 16px;background-color:${isB2B ? "#eef0f5" : "#faf8f5"};border-left:3px solid ${isB2B ? "#4a5568" : "#d4a843"};border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Inquiry Type</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;font-weight:600;">${inquiryLabel}</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                ${isB2B && data.businessName ? `<tr>
                  <td style="padding:14px 16px;background-color:#eef0f5;border-left:3px solid #4a5568;border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Business Name</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;font-weight:500;">${esc(data.businessName)}</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>` : ""}
                ${isB2B && industryLabel ? `<tr>
                  <td style="padding:14px 16px;background-color:#eef0f5;border-left:3px solid #4a5568;border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Industry</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;font-weight:500;">${industryLabel}</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>` : ""}
                <tr>
                  <td style="padding:14px 16px;background-color:#faf8f5;border-left:3px solid #d4a843;border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Name</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;font-weight:500;">${esc(data.name)}</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#faf8f5;border-left:3px solid #d4a843;border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Email</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;">
                      <a href="mailto:${esc(data.email)}" style="color:#d4a843;text-decoration:none;">${esc(data.email)}</a>
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                ${data.phone ? `<tr>
                  <td style="padding:14px 16px;background-color:#faf8f5;border-left:3px solid #d4a843;border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Phone</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;">
                      <a href="tel:${esc(data.phone)}" style="color:#d4a843;text-decoration:none;">${esc(data.phone)}</a>
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>` : ""}
                <tr>
                  <td style="padding:14px 16px;background-color:#faf8f5;border-left:3px solid #d4a843;border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Service Interested In</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;font-weight:500;">${serviceLabel}</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#faf8f5;border-left:3px solid #d4a843;border-radius:6px;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Preferred Contact Method</p>
                    <p style="margin:0;font-size:15px;color:#1a1625;font-weight:500;">${contactLabel}</p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="padding:20px;background-color:#faf8f5;border-radius:10px;border:1px solid #eee8df;">
                <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8a8698;font-weight:600;">Message</p>
                <p style="margin:0;font-size:14px;color:#2d2840;line-height:1.7;">
                  ${escapedMessage}
                </p>
              </div>

              <p style="margin:12px 0 0;font-size:11px;color:#8a8698;">
                Privacy consent accepted by the sender at ${esc(data.consentAt)}
              </p>

              <!-- Reply Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${esc(data.email)}?subject=Re: Your inquiry to Lotus Craft" style="display:inline-block;padding:12px 32px;background-color:#d4a843;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">
                      Reply to ${esc(data.name)}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0ede8;padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#8a8698;">
                This email was sent from the Lotus Craft website contact form.
              </p>
              <p style="margin:0;font-size:11px;color:#a09cae;">
                ${new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─── Build plain text fallback ─────────────────────────────────

function buildEmailText(data: ContactSubmission, quarantine?: string): string {
  const serviceLabel = SERVICE_LABELS[data.service] || "Not specified";
  const contactLabel = CONTACT_LABELS[data.preferredContact] || "Not specified";
  const industryLabel = INDUSTRY_LABELS[data.industry] || "";
  const isB2B = data.inquiryType === "business";

  return [
    "NEW CONTACT FORM SUBMISSION — Lotus Craft",
    "━".repeat(48),
    "",
    quarantine
      ? `** FLAGGED BY THE AUTOMATED FILTER: ${quarantine}`
      : null,
    quarantine
      ? "   Not discarded — please review before ignoring it. **"
      : null,
    quarantine ? "" : null,
    `Inquiry Type:       ${isB2B ? "Business (B2B)" : "Individual (B2C)"}`,
    isB2B && data.businessName ? `Business Name:      ${data.businessName}` : null,
    isB2B && industryLabel ? `Industry:           ${industryLabel}` : null,
    "",
    `Name:               ${data.name}`,
    `Email:              ${data.email}`,
    data.phone ? `Phone:              ${data.phone}` : null,
    `Service:            ${serviceLabel}`,
    `Preferred Contact:  ${contactLabel}`,
    "",
    "━".repeat(48),
    "MESSAGE:",
    "━".repeat(48),
    "",
    data.message,
    "",
    "━".repeat(48),
    `Sent on ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    `Privacy consent:    accepted by the sender at ${data.consentAt}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

// ─── Send contact email ────────────────────────────────────────

export async function sendContactEmail(
  data: ContactSubmission,
  quarantine?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = getTransporter();
    const to = process.env.CONTACT_EMAIL_TO || process.env.SMTP_USER;

    if (!to) {
      throw new Error("No recipient email configured (CONTACT_EMAIL_TO).");
    }

    const serviceLabel = SERVICE_LABELS[data.service] || "General";
    const isB2B = data.inquiryType === "business";
    const subjectPrefix = isB2B ? "B2B Inquiry" : "New Inquiry";
    const businessSuffix = isB2B && data.businessName ? ` (${data.businessName})` : "";

    await transport.sendMail({
      from: `"Lotus Craft Website" <${process.env.SMTP_USER}>`,
      to,
      replyTo: data.email,
      subject: `${quarantine ? "[SPAM CHECK] " : ""}${subjectPrefix}: ${serviceLabel} — from ${data.name}${businessSuffix}`,
      text: buildEmailText(data, quarantine),
      html: buildEmailHtml(data, quarantine),
    });

    return { success: true };
  } catch (err) {
    // SMTP rejections quote the recipient address, so strip addresses before
    // this string is logged or handed back to the route handler.
    const raw = err instanceof Error ? err.message : "Unknown email error";
    const message = raw.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)*/g, "[redacted]");
    logEvent("error", "email_send_failed", { message });
    return { success: false, error: message };
  }
}
