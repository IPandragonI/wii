/**
 * Contact form rules shared by the browser (instant feedback) and the API route (the check that
 * counts). Errors are codes, not sentences, so each language words them itself.
 */

export const CONTACT_FIELDS = ["name", "email", "subject", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  messageMin: 10,
  message: 5000,
} as const;

/** A human needs a few seconds to write a message; a script that posts sooner is rejected. */
export const MIN_FILL_MS = 3_000;
/** A form left open longer than this is stale; the visitor is asked to try again. */
export const MAX_FILL_MS = 24 * 60 * 60 * 1000;

export type FieldError = "required" | "invalid" | "tooLong" | "tooShort";
export type FieldErrors = Partial<Record<ContactField, FieldError>>;

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const LINE_BREAK = /[\r\n]/;

/** Trims and validates the four visible fields. Single-line fields may not contain line breaks. */
export function validateContact(
  raw: Partial<Record<ContactField, unknown>>,
): { ok: true; data: ContactInput } | { ok: false; errors: FieldErrors } {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const data: ContactInput = {
    name: text(raw.name),
    email: text(raw.email),
    subject: text(raw.subject),
    message: text(raw.message).replace(/\r\n/g, "\n"),
  };
  const errors: FieldErrors = {};

  for (const field of ["name", "subject"] as const) {
    if (!data[field]) errors[field] = "required";
    else if (LINE_BREAK.test(data[field])) errors[field] = "invalid";
    else if (data[field].length > CONTACT_LIMITS[field]) errors[field] = "tooLong";
  }

  if (!data.email) errors.email = "required";
  else if (data.email.length > CONTACT_LIMITS.email) errors.email = "tooLong";
  else if (!EMAIL.test(data.email)) errors.email = "invalid";

  if (!data.message) errors.message = "required";
  else if (data.message.length < CONTACT_LIMITS.messageMin) errors.message = "tooShort";
  else if (data.message.length > CONTACT_LIMITS.message) errors.message = "tooLong";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

/** What `POST /api/contact` answers. `ok` is only true once the email provider accepted the message. */
export type ContactResponse =
  | { ok: true }
  | { ok: false; code: "invalid"; errors: FieldErrors }
  | { ok: false; code: "spam" | "expired" | "rate_limited" | "unavailable" | "delivery_failed" | "bad_request" };
