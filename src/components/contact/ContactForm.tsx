"use client";

import { CircleCheck, Loader2, Send, TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { useMessages } from "@/i18n/client";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  validateContact,
  type ContactField,
  type ContactResponse,
  type FieldErrors,
} from "@/lib/contact";
import { playSound } from "@/lib/sound";

type Status = "idle" | "sending" | "sent" | "failed";

const EMPTY: Record<ContactField, string> = { name: "", email: "", subject: "", message: "" };

const INPUT =
  "w-full rounded-2xl border-[3px] bg-white px-4 py-3 text-base text-wii-ink-strong shadow-[inset_0_2px_4px_rgb(0_0_0/0.05)] outline-none transition-colors placeholder:text-wii-ink-soft focus:border-wii-cyan sm:text-lg";

function newKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * The contact form. Validation runs in the browser for quick feedback and again on the server,
 * which is the check that counts. "Sent" is only shown after the server confirms that the email
 * provider accepted the message.
 */
export function ContactForm() {
  const t = useMessages().contact.form;
  const formId = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<string>();
  const sendingRef = useRef(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const openedAt = useRef(0);
  const idempotencyKey = useRef("");

  useEffect(() => {
    openedAt.current = Date.now();
    idempotencyKey.current = newKey();
  }, []);

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  const fieldError = (field: ContactField): string | undefined => {
    const error = errors[field];
    if (!error) return undefined;
    if (error === "required") return t.fieldErrors.required;
    if (error === "tooLong") return t.fieldErrors.tooLong(CONTACT_LIMITS[field]);
    if (error === "tooShort") return t.fieldErrors.tooShort(CONTACT_LIMITS.messageMin);
    return field === "email" ? t.fieldErrors.invalidEmail : t.fieldErrors.invalid;
  };

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as ContactField;
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    // A changed message is a different message: it must not reuse the previous delivery key.
    idempotencyKey.current = newKey();
  };

  const focusFirstInvalid = (found: FieldErrors) => {
    const first = CONTACT_FIELDS.find((field) => found[field]);
    if (first) document.getElementById(`${formId}-${first}`)?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current || status === "sent") return;

    const checked = validateContact(values);
    if (!checked.ok) {
      setErrors(checked.errors);
      setStatus("idle");
      setFailure(undefined);
      focusFirstInvalid(checked.errors);
      return;
    }

    // The ref blocks a second submit in the same tick, before React re-renders the disabled button.
    sendingRef.current = true;
    setErrors({});
    setFailure(undefined);
    setStatus("sending");
    playSound("select");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checked.data,
          website: honeypotRef.current?.value ?? "",
          startedAt: openedAt.current,
          idempotencyKey: idempotencyKey.current,
        }),
      });
      const result = (await response.json().catch(() => null)) as ContactResponse | null;

      if (result?.ok) {
        setValues(EMPTY);
        setStatus("sent");
        openedAt.current = Date.now();
        idempotencyKey.current = newKey();
        playSound("start");
      } else if (result && result.code === "invalid") {
        setErrors(result.errors);
        setStatus("idle");
        focusFirstInvalid(result.errors);
      } else {
        setFailure(result ? t.errors[result.code] : t.errors.delivery_failed);
        setStatus("failed");
        playSound("back");
      }
    } catch {
      setFailure(t.errors.network);
      setStatus("failed");
      playSound("back");
    } finally {
      sendingRef.current = false;
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <CircleCheck aria-hidden="true" size={40} className="text-wii-green" />
        <h2 ref={successRef} tabIndex={-1} className="text-2xl font-extrabold text-wii-ink-strong outline-none">
          {t.successTitle}
        </h2>
        <p className="text-lg leading-relaxed">{t.successBody}</p>
        <button type="button" className="wii-button" onClick={() => setStatus("idle")}>
          {t.sendAnother}
        </button>
      </div>
    );
  }

  const sending = status === "sending";
  const hasErrors = CONTACT_FIELDS.some((name) => errors[name]);
  const field = (name: ContactField, label: string, input: "text" | "email" | "textarea", autoComplete?: string) => {
    const id = `${formId}-${name}`;
    const message = fieldError(name);
    const shared = {
      id,
      name,
      value: values[name],
      onChange,
      disabled: sending,
      "aria-required": true,
      "aria-invalid": message ? true : undefined,
      "aria-describedby": message ? `${id}-error` : undefined,
      className: `${INPUT} ${message ? "border-[#c03a3a]" : "border-wii-line"} disabled:opacity-60`,
    } as const;
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-sm font-extrabold uppercase tracking-wider text-wii-ink-soft">
          {label}
          <span className="text-xs font-bold normal-case tracking-normal">({t.required})</span>
        </label>
        {input === "textarea" ? (
          <textarea {...shared} rows={7} maxLength={CONTACT_LIMITS.message + 200} />
        ) : (
          <input
            {...shared}
            type={input}
            autoComplete={autoComplete}
            inputMode={input === "email" ? "email" : undefined}
            maxLength={CONTACT_LIMITS[name as "name" | "email" | "subject"] + 50}
          />
        )}
        {message && (
          <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-bold text-[#c03a3a]">
            <TriangleAlert aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
            {message}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={sending} className="space-y-5">
      <h2 className="text-2xl font-extrabold text-wii-ink-strong">{t.heading}</h2>

      {hasErrors && (
        <p role="alert" className="rounded-2xl border-2 border-[#e9b6b6] bg-[#fce9e9] px-4 py-3 text-sm font-bold text-[#a02f2f]">
          {t.errorSummary}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", t.name, "text", "name")}
        {field("email", t.email, "email", "email")}
      </div>
      {field("subject", t.subject, "text")}
      {field("message", t.message, "textarea")}

      {/* Honeypot: invisible to people and to assistive technology; scripts that fill every field give themselves away. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {status === "failed" && failure && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl border-2 border-[#e9b6b6] bg-[#fce9e9] px-4 py-3 font-bold text-[#a02f2f]">
          <TriangleAlert aria-hidden="true" size={20} className="mt-0.5 shrink-0" />
          {failure}
        </p>
      )}

      <button type="submit" disabled={sending} className="wii-button wii-button-primary disabled:cursor-wait disabled:opacity-70">
        {sending ? (
          <Loader2 aria-hidden="true" size={18} strokeWidth={2.5} className="animate-spin motion-reduce:animate-none" />
        ) : (
          <Send aria-hidden="true" size={18} strokeWidth={2.5} />
        )}
        {sending ? t.sending : t.send}
      </button>
    </form>
  );
}
