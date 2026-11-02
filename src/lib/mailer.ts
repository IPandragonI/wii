import "server-only";

import { profile } from "@/config/profile";
import type { ContactInput } from "@/lib/contact";

const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;
/** Resend's shared sender; until a domain is verified it can only deliver to the Resend account's own address. */
const DEFAULT_FROM = "Portfolio <onboarding@resend.dev>";

export interface MailerConfig {
  apiKey: string;
  to: string;
  from: string;
}

/** Reads the delivery settings. Returns null when the provider is not configured. */
export function readMailerConfig(env: NodeJS.ProcessEnv = process.env): MailerConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    // The recipient stays server-side; it defaults to the address already published in the profile.
    to: env.CONTACT_TO_EMAIL?.trim() || profile.email,
    from: env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
  };
}

export type SendResult = { ok: true } | { ok: false; status?: number };

/**
 * Hands the message to Resend and reports success only when the provider accepted it (2xx).
 * The visitor's address goes in Reply-To, so replying answers them. The body is plain text.
 * `idempotencyKey` makes a retried request deliver once.
 */
export async function sendContactEmail(
  message: ContactInput,
  options: { config: MailerConfig; idempotencyKey: string; fetchImpl?: typeof fetch },
): Promise<SendResult> {
  const { config, idempotencyKey, fetchImpl = fetch } = options;
  try {
    const response = await fetchImpl(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: message.email,
        subject: `[Portfolio] ${message.subject}`,
        text: `From: ${message.name} <${message.email}>\n\n${message.message}\n`,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    return response.ok ? { ok: true } : { ok: false, status: response.status };
  } catch {
    return { ok: false };
  }
}
