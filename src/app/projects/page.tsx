import type { Metadata } from "next";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { WiiChannel } from "@/components/wii-menu/WiiChannel";
import { projectChannel } from "@/lib/menu";
import { getPortfolio } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Projects",
  description: "Every project in the portfolio, featured work first.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const data = await getPortfolio();

  return (
    <ChannelScreen title="Projects" icon="projects">
      <div className="mb-6 space-y-3">
        <SampleDataNotice source={data.source} />
        <p className="max-w-2xl text-lg">
          {data.projects.length === 0
            ? "No projects to show yet."
            : `${data.projects.length} project${data.projects.length === 1 ? "" : "s"}, featured work first, then by most recent update.`}
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {data.projects.map((project) => (
          <WiiChannel key={project.id} channel={projectChannel(project)} />
        ))}
      </ul>
    </ChannelScreen>
  );
}
