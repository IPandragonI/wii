"use client";

import { House, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { localePath, parseLocalePath } from "@/i18n/config";
import { messagesFor } from "@/i18n/messages";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = parseLocalePath(usePathname()).locale;
  const t = messagesFor(locale);
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <section className="wii-panel max-w-lg p-8 text-center">
        <h1 className="text-2xl font-extrabold text-wii-ink-strong">{t.error.title}</h1>
        <p className="mt-3 leading-relaxed">{t.error.body}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={localePath(locale, "/")} className="wii-button">
            <House aria-hidden="true" size={18} />
            {t.common.menu}
          </Link>
          <button type="button" onClick={reset} className="wii-button wii-button-primary">
            <RefreshCw aria-hidden="true" size={18} />
            {t.error.retry}
          </button>
        </div>
      </section>
    </main>
  );
}
