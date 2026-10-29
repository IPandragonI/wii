import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { ProjectActions } from "@/components/project/ProjectActions";
import { ProjectDetails } from "@/components/project/ProjectDetails";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { tintFor } from "@/lib/menu";
import { getPortfolio, getProjectBySlug } from "@/lib/portfolio";

export async function generateStaticParams() {
  const { projects } = await getPortfolio();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Channel not found", robots: { index: false } };

  const description = project.description || `${project.name} – ${project.category}`;
  return {
    title: project.name,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.name, description, url: `/projects/${project.slug}`, type: "website" },
  };
}

/**
 * Unknown slugs render the not-found channel. With Partial Prerendering the very first request
 * for an unseen slug streams from the route's shell, so it answers 200 with a `noindex` tag;
 * the result is then cached and later requests get a real 404. The lookup reads the cached
 * portfolio, so it adds no provider calls.
 */
export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const [project, data] = await Promise.all([getProjectBySlug(slug), getPortfolio()]);
  if (!project) notFound();

  return (
    <ChannelScreen
      title={project.name}
      icon={project.channelIcon}
      category={project.category}
      tint={tintFor(project.slug)}
      eyebrow={<span className="text-sm font-bold text-wii-ink-soft">{project.category}</span>}
      actions={<ProjectActions project={project} />}
    >
      {data.source === "fallback" && (
        <div className="mb-6">
          <SampleDataNotice source={data.source} />
        </div>
      )}
      <ProjectDetails project={project} />
    </ChannelScreen>
  );
}
