import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { ProjectActions } from "@/components/project/ProjectActions";
import { ProjectDetails } from "@/components/project/ProjectDetails";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { LocaleProvider } from "@/i18n/client";
import { alternatesFor, localePath, type Locale } from "@/i18n/config";
import { categoryLabel, messagesFor } from "@/i18n/messages";
import { tintFor } from "@/lib/menu";
import { getPortfolio, getProjectBySlug } from "@/lib/portfolio";

export async function projectStaticParams() {
  const { projects } = await getPortfolio();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function projectMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const project = await getProjectBySlug(slug);
  if (!project) return { title: messagesFor(locale).project.notFound, robots: { index: false } };

  const description = project.description || `${project.name} – ${categoryLabel(locale, project.category)}`;
  const path = `/projects/${project.slug}`;
  return {
    title: project.name,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: { title: project.name, description, url: localePath(locale, path), type: "website" },
  };
}

/**
 * Unknown slugs render the not-found channel. With Partial Prerendering the very first request
 * for an unseen slug streams from the route's shell, so it answers 200 with a `noindex` tag;
 * the result is then cached and later requests get a real 404. The lookup reads the cached
 * portfolio, so it adds no provider calls.
 */
export async function ProjectView({ locale, slug }: { locale: Locale; slug: string }) {
  const [project, data] = await Promise.all([getProjectBySlug(slug), getPortfolio()]);
  if (!project) notFound();

  return (
    <LocaleProvider locale={locale}>
      <ChannelScreen
        title={project.name}
        icon={project.channelIcon}
        category={project.category}
        tint={tintFor(project.slug)}
        eyebrow={<span className="text-sm font-bold text-wii-ink-soft">{categoryLabel(locale, project.category)}</span>}
        actions={<ProjectActions project={project} locale={locale} />}
      >
        {data.source === "fallback" && (
          <div className="mb-6">
            <SampleDataNotice source={data.source} locale={locale} />
          </div>
        )}
        <ProjectDetails project={project} locale={locale} />
      </ChannelScreen>
    </LocaleProvider>
  );
}
