import { ChannelArt } from "@/components/ui/ChannelArt";
import { tintFor } from "@/lib/menu";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { categoryLabel, messagesFor } from "@/i18n/messages";
import type { PortfolioProject } from "@/types/project";

/**
 * The hero at the top of a project channel. The project's own animated scene (a dartboard,
 * a circuit, a chess board...) always fills the frame, tinted with its accent color, so every
 * project keeps its own identity. When the site publishes a screenshot, it sits on top as an
 * inset card instead of replacing the scene.
 */
export function ProjectPreview({ project, locale = DEFAULT_LOCALE }: { project: PortfolioProject; locale?: Locale }) {
  const t = messagesFor(locale);
  const screenshot = project.coverImage ?? project.siteImage;
  return (
    <section
      aria-label={t.project.preview(project.name)}
      className="relative h-[clamp(15rem,36vw,26rem)] overflow-hidden rounded-[28px] border-2 border-wii-line bg-wii-surface p-1.5 shadow-panel"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[22px]">
        <ChannelArt
          title={project.name}
          subtitle={categoryLabel(locale, project.category)}
          greeting={t.common.hello}
          icon={project.channelIcon}
          category={project.category}
          accent={project.siteColor}
          banner={project.banner}
          tint={tintFor(project.slug)}
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/55 via-transparent to-white/10" />
        {screenshot && (
          <figure className="absolute right-3 top-3 hidden w-[36%] max-w-sm rotate-[1.5deg] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-channel sm:block">
            {/* Plain <img>: remote screenshots are not routed through the image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshot}
              alt={t.project.preview(project.name)}
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              className="aspect-video w-full object-cover"
            />
          </figure>
        )}
      </div>
    </section>
  );
}
