import { ChannelArt } from "@/components/ui/ChannelArt";
import { tintFor } from "@/lib/menu";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { categoryLabel, messagesFor } from "@/i18n/messages";
import type { PortfolioProject } from "@/types/project";

/** The large banner at the top of a project channel. */
export function ProjectPreview({ project, locale = DEFAULT_LOCALE }: { project: PortfolioProject; locale?: Locale }) {
  return (
    <div className="aspect-16/10 overflow-hidden rounded-[28px] border-2 border-wii-line bg-wii-surface p-1.5 shadow-panel sm:aspect-video">
      <div className="h-full w-full overflow-hidden rounded-[22px]">
        <ChannelArt
          title={project.name}
          subtitle={categoryLabel(locale, project.category)}
          greeting={messagesFor(locale).common.hello}
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
