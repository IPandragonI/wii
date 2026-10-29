import { displayName } from "@/config/profile";
import { OG_SIZE, sceneOgImage } from "@/lib/og-card";
import { getProjectBySlug } from "@/lib/portfolio";

export const alt = "Project preview";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return sceneOgImage({
    scene: project?.banner ?? "projects",
    title: project?.name ?? displayName(),
    subtitle: project ? `${project.category} · ${displayName()}` : undefined,
  });
}
