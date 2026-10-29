import { ImageResponse } from "next/og";

import { displayName } from "@/config/profile";
import { TINTS, tintFor } from "@/lib/menu";
import { OG_SIZE, OgCard } from "@/lib/og-card";
import { getProjectBySlug } from "@/lib/portfolio";

export const alt = "Project preview";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const title = project?.name ?? displayName();
  const subtitle = project ? `${project.category} · ${displayName()}` : "Channel not found";
  return new ImageResponse(<OgCard title={title} subtitle={subtitle} accent={TINTS[tintFor(slug)].accent} />, size);
}
