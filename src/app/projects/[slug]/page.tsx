import type { Metadata } from "next";

import { ProjectView, projectMetadata, projectStaticParams } from "@/views/project";

export const generateStaticParams = projectStaticParams;

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return projectMetadata("en", slug);
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  return <ProjectView locale="en" slug={slug} />;
}
