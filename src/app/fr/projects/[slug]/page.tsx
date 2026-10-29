import type { Metadata } from "next";

import { ProjectView, projectMetadata, projectStaticParams } from "@/views/project";

export const generateStaticParams = projectStaticParams;

export async function generateMetadata({ params }: PageProps<"/fr/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return projectMetadata("fr", slug);
}

export default async function ProjectPageFr({ params }: PageProps<"/fr/projects/[slug]">) {
  const { slug } = await params;
  return <ProjectView locale="fr" slug={slug} />;
}
