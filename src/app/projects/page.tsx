import { ProjectsView, projectsMetadata } from "@/views/projects";

export const metadata = projectsMetadata("en");

export default function ProjectsPage() {
  return <ProjectsView locale="en" />;
}
