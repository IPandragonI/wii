"use client";

import { usePathname } from "next/navigation";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { LocaleProvider } from "@/i18n/client";
import { parseLocalePath } from "@/i18n/config";
import { messagesFor } from "@/i18n/messages";

export default function NotFound() {
  const locale = parseLocalePath(usePathname()).locale;
  const t = messagesFor(locale).notFound;
  return (
    <LocaleProvider locale={locale}>
      <ChannelScreen title={t.title}>
        <section className="wii-panel max-w-xl p-8">
          <p className="text-6xl font-extrabold text-wii-line" aria-hidden="true">
            404
          </p>
          <p className="mt-4 text-lg leading-relaxed">{t.body}</p>
        </section>
      </ChannelScreen>
    </LocaleProvider>
  );
}
