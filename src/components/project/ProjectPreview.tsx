import { ChannelArt } from "@/components/ui/ChannelArt";
import { tintFor } from "@/lib/menu";
import type { PortfolioProject } from "@/types/project";

/** The large banner at the top of a project channel. */
export function ProjectPreview({ project }: { project: PortfolioProject }) {
  return (
    <div className="aspect-16/10 overflow-hidden rounded-[28px] border-2 border-wii-line bg-wii-surface p-1.5 shadow-panel sm:aspect-video">
      <div className="h-full w-full overflow-hidden rounded-[22px]">
        <ChannelArt
          title={project.name}
          subtitle={project.category}
          icon={project.channelIcon}
          category={project.category}
          image={project.coverImage ?? project.siteImage}
          accent={project.siteColor}
          banner={project.banner}
          tint={tintFor(project.slug)}
          decorative={false}
          priority
        />
      </div>
    </div>
  );
}
