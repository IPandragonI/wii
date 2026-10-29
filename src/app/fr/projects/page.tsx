import { ProjectsView, projectsMetadata } from "@/views/projects";

export const metadata = projectsMetadata("fr");

export default function ProjectsPageFr() {
  return <ProjectsView locale="fr" />;
}
