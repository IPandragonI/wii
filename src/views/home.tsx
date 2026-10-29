import type { Metadata } from "next";

import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { WiiMenu } from "@/components/wii-menu/WiiMenu";
import { getProfile, displayName } from "@/config/profile";
import { LocaleProvider } from "@/i18n/client";
import { alternatesFor, localePath, type Locale } from "@/i18n/config";
import { messagesFor } from "@/i18n/messages";
import { buildMenuChannels } from "@/lib/menu";
import { featuredForMenu, getPortfolio } from "@/lib/portfolio";

export function homeMetadata(locale: Locale): Metadata {
  const t = messagesFor(locale);
  const description = t.site.description(getProfile(locale).role);
  return {
    title: { absolute: t.site.menuTitle(displayName()) },
    description,
    alternates: alternatesFor(locale, "/"),
    openGraph: { type: "website", siteName: displayName(), title: displayName(), description, url: localePath(locale, "/") },
  };
}

export async function HomeView({ locale }: { locale: Locale }) {
  const data = await getPortfolio();
  const channels = buildMenuChannels(featuredForMenu(data), locale);

  return (
    <LocaleProvider locale={locale}>
      <div lang={locale} className="flex min-h-dvh flex-col">
        {data.source === "fallback" && (
          <div className="px-4 pt-4">
            <SampleDataNotice source={data.source} locale={locale} />
          </div>
        )}
        <WiiMenu channels={channels} heading={messagesFor(locale).common.menuHeading(displayName())} />
      </div>
    </LocaleProvider>
  );
}
