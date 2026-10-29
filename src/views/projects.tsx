import type { Metadata } from "next";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { WiiChannel } from "@/components/wii-menu/WiiChannel";
import { LocaleProvider } from "@/i18n/client";
import { alternatesFor, type Locale } from "@/i18n/config";
import { messagesFor } from "@/i18n/messages";
import { projectChannel } from "@/lib/menu";
import { getPortfolio } from "@/lib/portfolio";

export function projectsMetadata(locale: Locale): Metadata {
  const t = messagesFor(locale);
  return {
    title: t.channels.projects.title,
    description: t.projects.description,
    alternates: alternatesFor(locale, "/projects"),
  };
}

export async function ProjectsView({ locale }: { locale: Locale }) {
  const data = await getPortfolio();
  const t = messagesFor(locale);

  return (
    <LocaleProvider locale={locale}>
      <ChannelScreen title={t.channels.projects.title} icon="projects">
        <div className="mb-6 space-y-3">
          <SampleDataNotice source={data.source} locale={locale} />
          <p className="max-w-2xl text-lg">
            {data.projects.length === 0 ? t.projects.empty : t.projects.count(data.projects.length)}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {data.projects.map((project) => (
            <WiiChannel key={project.id} channel={projectChannel(project, locale)} />
          ))}
        </ul>
      </ChannelScreen>
    </LocaleProvider>
  );
}
