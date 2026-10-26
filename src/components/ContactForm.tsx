"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Send,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader2,
  User,
  Mail,
  Phone,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Building2,
  UserCircle,
} from "lucide-react";
import { FIELD_LIMITS } from "@/lib/security";

// ─── Client-side security helpers ──────────────────────────────────

/**
 * A 429 can originate from Vercel's edge rate limiter rather than our handler,
 * in which case the body is not JSON. Never parse it unguarded.
 */
async function readJsonSafe(response: Response): Promise<{
  error?: string;
  fields?: Record<string, string>;
  retryAfter?: number;
}> {
  const text = await response.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// Matches the edge rate-limit window configured in the Vercel Firewall.
const FALLBACK_RETRY_SECONDS = 600;

function parseRetryAfter(value: string | null): number {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : FALLBACK_RETRY_SECONDS;
}

// ─── Validation patterns ───────────────────────────────────────────

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PHONE_RE = /^[+]?[\d\s()\-]{6,20}$/;

// ─── Types ─────────────────────────────────────────────────────────

type FieldName = "name" | "email" | "phone" | "message";
type ExtraField = "service" | "businessName" | "industry" | "preferredContact";
type FormErrors = Partial<Record<FieldName | ExtraField | "general", string>>;
type InquiryType = "individual" | "business";

const SERVICE_OPTIONS_B2C = ["sewing", "laundry", "rug_washing", "crafts", "other"] as const;
const SERVICE_OPTIONS_B2B = ["b2b_contract", "laundry", "rug_washing", "other"] as const;
const INDUSTRY_OPTIONS = ["hotel", "hostel", "motel", "restaurant", "spa", "healthcare", "retail", "other_business"] as const;
const CONTACT_METHOD_OPTIONS = ["email", "phone", "either"] as const;

// ─── Component ─────────────────────────────────────────────────────

export default function ContactForm({ token }: { token: string }) {
  const t = useTranslations("contact");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [inquiryType, setInquiryType] = useState<InquiryType>("individual");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [preferredContact, setPreferredContact] = useState("");

  const [securityToken] = useState(token);
  const [honeypot1, setHoneypot1] = useState("");
  const [honeypot2, setHoneypot2] = useState("");
  const submitAttempts = useRef(0);
  const lastSubmitTime = useRef(0);

  const handleInquirySwitch = (type: InquiryType) => {
    setInquiryType(type);
    setSelectedService("");
    setErrors((prev) => ({ ...prev, service: undefined, businessName: undefined, industry: undefined }));
    if (type === "individual") {
      setBusinessName("");
      setIndustry("");
    }
  };

  // ─── Validation ────────────────────────────────────────────────

  const validateField = useCallback(
    (field: FieldName, value: string): string | undefined => {
      const v = value.trim();
      switch (field) {
        case "name":
          if (!v) return t("validation.name_required");
          if (v.length < FIELD_LIMITS.name.min) return t("validation.name_min");
          if (v.length > FIELD_LIMITS.name.max) return t("validation.name_max");
          if (/https?:\/\//i.test(v)) return t("validation.name_invalid");
          return undefined;
        case "email":
          if (!v) return t("validation.email_required");
          if (v.length > FIELD_LIMITS.email.max) return t("validation.email_max");
          if (!EMAIL_RE.test(v)) return t("validation.email_invalid");
          return undefined;
        case "phone":
          if (v && v.length > FIELD_LIMITS.phone.max) return t("validation.phone_max");
          if (v && !PHONE_RE.test(v)) return t("validation.phone_invalid");
          return undefined;
        case "message":
          if (!v) return t("validation.message_required");
          if (v.length < FIELD_LIMITS.message.min) return t("validation.message_min");
          if (v.length > FIELD_LIMITS.message.max) return t("validation.message_max");
          return undefined;
        default:
          return undefined;
      }
    },
    [t]
  );

  // ─── Handlers ──────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as FieldName]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(name as FieldName, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();

    if (now - lastSubmitTime.current < 5000 && lastSubmitTime.current > 0) {
      setErrors({ general: t("validation.too_fast_submit") });
      return;
    }
    submitAttempts.current++;
    if (submitAttempts.current > 10) {
      setErrors({ general: t("validation.too_many_attempts") });
      return;
    }
    // Deliberately no client-side minimum-age gate: the server's signed token
    // already decides what an instant submission means, and the browser cannot
    // verify it anyway. Faking success here told real visitors their message
    // had been sent when nothing had left the page.

    const newErrors: FormErrors = {};
    for (const key of Object.keys(formData) as FieldName[]) {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    }
    if (!selectedService) newErrors.service = t("validation.service_required");
    if (!preferredContact) newErrors.preferredContact = t("validation.preferred_contact_required");
    if (inquiryType === "business") {
      if (!businessName.trim()) newErrors.businessName = t("validation.business_name_required");
      if (!industry) newErrors.industry = t("validation.industry_required");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    lastSubmitTime.current = now;

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        inquiryType,
        businessName: inquiryType === "business" ? businessName.trim() : "",
        industry: inquiryType === "business" ? industry : "",
        service: selectedService,
        preferredContact,
        _hp_website: honeypot1,
        _hp_company: honeypot2,
        _token: securityToken,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        // A 429 can come from Vercel's edge rate limiter, whose body is not
        // JSON, so never assume the payload parses.
        const data = await readJsonSafe(response);
        const retrySeconds =
          data.retryAfter ?? parseRetryAfter(response.headers.get("retry-after"));
        setErrors({
          general: t("validation.rate_limited", {
            minutes: Math.ceil(retrySeconds / 60),
          }),
        });
        return;
      }
      if (response.status === 403) {
        // The token is issued when the page renders and cannot be minted in
        // the browser, so a rejected one means the page must be reloaded.
        setErrors({ general: t("validation.security_expired") });
        return;
      }
      if (!response.ok) {
        const data = await readJsonSafe(response);
        if (data.fields) {
          const fieldErrors: FormErrors = {};
          for (const [field, code] of Object.entries(data.fields)) {
            fieldErrors[field as FieldName] = t(`validation.server_${code as string}`);
          }
          setErrors(fieldErrors);
          return;
        }
        throw new Error(data.error || "unknown_error");
      }
      setSubmitted(true);
    } catch {
      setErrors({ general: t("validation.server_error") });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success State ─────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="text-center py-10 sm:py-16">
        <div className="relative mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
          <div className="relative w-full h-full bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
            <CheckCircle className="text-green-500 w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2">
          {t("form_success_title")}
        </h3>
        <p className="text-sm sm:text-base text-charcoal-600 max-w-md mx-auto leading-relaxed">
          {t("form_success")}
        </p>
      </div>
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────

  const inputBase =
    "w-full rounded-xl border bg-white text-charcoal-900 text-sm sm:text-base transition-all duration-200 outline-none";

  const fieldClasses = (field: FieldName) =>
    `${inputBase} pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 ${
      errors[field]
        ? "border-red-300 focus:ring-2 focus:ring-red-600 focus:border-red-600"
        : "border-charcoal-200 hover:border-charcoal-300 focus:ring-2 focus:ring-gold-700 focus:border-gold-700"
    }`;

  const selectClasses = (hasValue: boolean, hasError = false) =>
    `${inputBase} pl-3 sm:pl-4 pr-10 py-2.5 sm:py-3 appearance-none cursor-pointer ${
      hasError
        ? "border-red-300 focus:ring-2 focus:ring-red-600 focus:border-red-600"
        : "border-charcoal-200 hover:border-charcoal-300 focus:ring-2 focus:ring-gold-700 focus:border-gold-700"
    } ${hasValue ? "text-charcoal-900" : "text-charcoal-600"}`;

  // Links each control to its own error message for assistive technology.
  const a11y = (field: keyof FormErrors) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  const serviceOptions = inquiryType === "business" ? SERVICE_OPTIONS_B2B : SERVICE_OPTIONS_B2C;

  const messagePlaceholder =
    inquiryType === "business"
      ? selectedService === "b2b_contract"
        ? t("form_message_ph_b2b")
        : t("form_message_ph_business")
      : selectedService === "sewing"
        ? t("form_message_ph_sewing")
        : selectedService === "laundry"
          ? t("form_message_ph_laundry")
          : selectedService === "rug_washing"
            ? t("form_message_ph_rug")
            : selectedService === "crafts"
              ? t("form_message_ph_crafts")
              : t("form_message_ph_default");

  // ─── Render ────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 sm:space-y-6"
      noValidate
      autoComplete="on"
    >
      {/* ── Honeypot fields ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden opacity-0 pointer-events-none"
        tabIndex={-1}
      >
        <label htmlFor="_hp_website">Website</label>
        <input type="text" id="_hp_website" name="_hp_website" value={honeypot1} onChange={(e) => setHoneypot1(e.target.value)} tabIndex={-1} autoComplete="off" />
        <label htmlFor="_hp_company">Company</label>
        <input type="text" id="_hp_company" name="_hp_company" value={honeypot2} onChange={(e) => setHoneypot2(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="_token" value={securityToken} />

      {/* ── Error banner ──────────────────────────────────────── */}
      {errors.general && (
        <div role="alert" className="flex items-start gap-3 p-3.5 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className="text-red-700 text-xs sm:text-sm pt-1">{errors.general}</p>
        </div>
      )}

      {/* ── B2C / B2B Toggle ──────────────────────────────────── */}
      <div>
        <p
          id="inquiry-type-label"
          className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-3"
        >
          <UserCircle size={14} className="text-gold-500" />
          {t("form_inquiry_type")}
        </p>
        <div
          role="group"
          aria-labelledby="inquiry-type-label"
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          {(["individual", "business"] as const).map((type) => {
            const active = inquiryType === type;
            const Icon = type === "individual" ? User : Building2;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleInquirySwitch(type)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  active
                    ? "bg-charcoal-900 text-white border-charcoal-900 shadow-md"
                    : "bg-white text-charcoal-600 border-charcoal-200 hover:border-charcoal-300"
                }`}
              >
                <Icon size={16} className={active ? "text-gold-400" : "text-charcoal-600"} />
                {t(`form_inquiry_${type}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Service Selection ─────────────────────────────────── */}
      <div>
        <label htmlFor="service" className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2">
          <Sparkles size={14} className="text-gold-500" />
          {t("form_service")} <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            id="service" {...a11y("service")}
            name="service"
            required
            value={selectedService}
            onChange={(e) => { setSelectedService(e.target.value); setErrors((prev) => ({ ...prev, service: undefined })); }}
            className={selectClasses(!!selectedService, !!errors.service)}
          >
            <option value="">{t("form_service_placeholder")}</option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>{t(`form_service_options.${opt}`)}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-charcoal-600 pointer-events-none" />
        </div>
        {errors.service && <div className="mt-1.5"><FieldError field="service" message={errors.service} /></div>}
      </div>

      {/* ── Business Fields (conditional) ─────────────────────── */}
      {inquiryType === "business" && (
        <div className="space-y-5 sm:space-y-6 p-4 sm:p-5 bg-charcoal-50/50 rounded-xl border border-charcoal-100">
          <div>
            <label htmlFor="businessName" className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2">
              <Building2 size={14} className="text-gold-500" />
              {t("form_business_name")} <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                <Building2 size={16} className="text-charcoal-300" />
              </div>
              <input
                type="text"
                id="businessName" {...a11y("businessName")}
                required
                maxLength={100}
                autoComplete="organization"
                placeholder={t("form_business_name_placeholder")}
                value={businessName}
                onChange={(e) => { setBusinessName(e.target.value); setErrors((prev) => ({ ...prev, businessName: undefined })); }}
                className={`${inputBase} pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 ${
                  errors.businessName
                    ? "border-red-300 focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    : "border-charcoal-200 hover:border-charcoal-300 focus:ring-2 focus:ring-gold-700 focus:border-gold-700"
                }`}
              />
            </div>
            {errors.businessName && <div className="mt-1.5"><FieldError field="businessName" message={errors.businessName} /></div>}
          </div>
          <div>
            <label htmlFor="industry" className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2">
              <Sparkles size={14} className="text-gold-500" />
              {t("form_industry")} <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <select
                id="industry" {...a11y("industry")}
                required
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setErrors((prev) => ({ ...prev, industry: undefined })); }}
                className={selectClasses(!!industry, !!errors.industry)}
              >
                <option value="">{t("form_industry_placeholder")}</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{t(`form_industry_options.${opt}`)}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-charcoal-600 pointer-events-none" />
            </div>
            {errors.industry && <div className="mt-1.5"><FieldError field="industry" message={errors.industry} /></div>}
          </div>
        </div>
      )}

      {/* ── Name ──────────────────────────────────────────────── */}
      <div>
        <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2">
          <User size={14} className="text-gold-500" />
          {t("form_name")} <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
            <User size={16} className="text-charcoal-300" />
          </div>
          <input
            type="text"
            id="name" {...a11y("name")}
            name="name"
            required
            maxLength={FIELD_LIMITS.name.max}
            autoComplete="name"
            placeholder={t("form_name_placeholder")}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClasses("name")}
          />
        </div>
        <div className="flex items-start justify-between mt-1.5 gap-2">
          {errors.name ? <FieldError field="name" message={errors.name} /> : <span />}
          <CharCounter current={formData.name.length} max={FIELD_LIMITS.name.max} />
        </div>
      </div>

      {/* ── Email & Phone ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2">
            <Mail size={14} className="text-gold-500" />
            {t("form_email")} <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
              <Mail size={16} className="text-charcoal-300" />
            </div>
            <input
              type="email"
              id="email" {...a11y("email")}
              name="email"
              required
              maxLength={FIELD_LIMITS.email.max}
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClasses("email")}
            />
          </div>
          <div className="flex items-start justify-between mt-1.5 gap-2">
            {errors.email ? <FieldError field="email" message={errors.email} /> : <span />}
            <CharCounter current={formData.email.length} max={FIELD_LIMITS.email.max} />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2">
            <Phone size={14} className="text-gold-500" />
            {t("form_phone")}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
              <Phone size={16} className="text-charcoal-300" />
            </div>
            <input
              type="tel"
              id="phone" {...a11y("phone")}
              name="phone"
              maxLength={FIELD_LIMITS.phone.max}
              autoComplete="tel"
              placeholder="+358 40 123 4567"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClasses("phone")}
            />
          </div>
          <div className="flex items-start justify-between mt-1.5 gap-2">
            {errors.phone ? <FieldError field="phone" message={errors.phone} /> : <span />}
            <CharCounter current={formData.phone.length} max={FIELD_LIMITS.phone.max} />
          </div>
        </div>
      </div>

      {/* ── Preferred Contact ─────────────────────────────────── */}
      <div>
        <p
          id="preferred-contact-label"
          className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2"
        >
          <MessageSquare size={14} className="text-gold-500" />
          {t("form_preferred_contact")} <span aria-hidden="true" className="text-red-600">*</span>
        </p>
        <div
          role="group"
          aria-labelledby="preferred-contact-label"
          aria-describedby={errors.preferredContact ? "preferredContact-error" : undefined}
          className="flex flex-wrap gap-2 sm:gap-3"
        >
          {CONTACT_METHOD_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={preferredContact === opt}
              onClick={() => { setPreferredContact(opt); setErrors((prev) => ({ ...prev, preferredContact: undefined })); }}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border ${
                preferredContact === opt
                  ? "bg-gold-700 text-white border-gold-700 shadow-md shadow-gold-600/20"
                  : errors.preferredContact
                    ? "bg-white text-charcoal-600 border-red-300 hover:border-red-400"
                    : "bg-white text-charcoal-600 border-charcoal-200 hover:border-gold-300 hover:text-gold-700"
              }`}
            >
              {t(`form_preferred_contact_options.${opt}`)}
            </button>
          ))}
        </div>
        {errors.preferredContact && <div className="mt-1.5"><FieldError field="preferredContact" message={errors.preferredContact} /></div>}
      </div>

      {/* ── Message ───────────────────────────────────────────── */}
      <div>
        <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-charcoal-700 mb-2">
          <MessageSquare size={14} className="text-gold-500" />
          {t("form_message")} <span className="text-red-600">*</span>
        </label>
        <textarea
          id="message" {...a11y("message")}
          name="message"
          required
          rows={5}
          maxLength={FIELD_LIMITS.message.max}
          placeholder={messagePlaceholder}
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${inputBase} px-3 py-2.5 sm:px-4 sm:py-3 resize-none ${
            errors.message
              ? "border-red-300 focus:ring-2 focus:ring-red-600 focus:border-red-600"
              : "border-charcoal-200 hover:border-charcoal-300 focus:ring-2 focus:ring-gold-700 focus:border-gold-700"
          }`}
        />
        <div className="flex items-start justify-between mt-1.5 gap-2">
          {errors.message ? <FieldError field="message" message={errors.message} /> : <span />}
          <CharCounter current={formData.message.length} max={FIELD_LIMITS.message.max} warnAt={0.9} />
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────────────── */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="group relative flex items-center justify-center gap-2.5 w-full px-6 py-3.5 sm:px-8 sm:py-4 bg-gold-700 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-gold-800 hover:shadow-xl hover:shadow-gold-600/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-gold-600/20 overflow-hidden"
        >
          <span className="absolute inset-0 bg-linear-to-r from-gold-500 to-gold-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-2.5">
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("form_submitting")}
              </>
            ) : (
              <>
                {t("form_submit")}
                <Send size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </span>
        </button>
      </div>

      {/* ── Security badge ────────────────────────────────────── */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-charcoal-600 select-none pt-1">
        <Shield size={13} className="shrink-0" />
        {t("form_secured")}
      </p>
    </form>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function FieldError({ field, message }: { field: string; message: string }) {
  return (
    <p id={`${field}-error`} role="alert" className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
      <AlertCircle size={13} className="shrink-0" />
      {message}
    </p>
  );
}

function CharCounter({ current, max, warnAt = 0.8 }: { current: number; max: number; warnAt?: number }) {
  const ratio = current / max;
  const color = ratio >= 1 ? "text-red-600 font-semibold" : ratio >= warnAt ? "text-red-500 font-medium" : "text-charcoal-600";
  if (current === 0) return null;
  return <span className={`text-xs shrink-0 tabular-nums transition-colors ${color}`}>{current}/{max}</span>;
}
