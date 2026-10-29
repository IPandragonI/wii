import { CalendarClock, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { GitHubMark } from "@/components/ui/ChannelIcon";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { formatDate } from "@/lib/format";
import { getPortfolio } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "GitHub",
  description: "Recently updated public repositories.",
  alternates: { canonical: "/github" },
};

export default async function GitHubPage() {
  const data = await getPortfolio();
  const live = data.source === "live";

  return (
    <ChannelScreen
      title="GitHub"
      icon="github"
      tint="slate"
      actions={
        data.githubProfileUrl && (
          <a href={data.githubProfileUrl} target="_blank" rel="noopener noreferrer" className="wii-button wii-button-primary">
            <GitHubMark size={18} />
            Open GitHub profile
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )
      }
    >
      <div className="mb-6 space-y-3">
        <SampleDataNotice source={data.source} />
        <p className="max-w-2xl text-lg">Recently updated repositories, newest first.</p>
      </div>

      {live && data.recent.length > 0 ? (
        <ol className="wii-panel divide-y divide-wii-line-soft overflow-hidden">
          {data.recent.map((project) => {
            const updated = formatDate(project.lastUpdatedAt);
            return (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-wii-cyan-soft/40 focus-visible:bg-wii-cyan-soft/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0">
                    <span className="block font-extrabold text-wii-ink-strong">{project.name}</span>
                    {project.description && <span className="block truncate text-sm">{project.description}</span>}
                  </span>
                  <span className="flex shrink-0 flex-wrap items-center gap-3 text-sm">
                    {project.technologies[0] && <span className="font-bold">{project.technologies[0]}</span>}
                    {project.githubStars !== undefined && (
                      <span className="flex items-center gap-1">
                        <Star aria-hidden="true" size={14} />
                        <span className="sr-only">Stars:</span>
                        {project.githubStars}
                      </span>
                    )}
                    {updated && (
                      <span className="flex items-center gap-1">
                        <CalendarClock aria-hidden="true" size={14} />
                        <span className="sr-only">Updated</span>
                        {updated}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="wii-panel p-6">
          {live ? "No public repositories yet." : "Repository activity appears here once GitHub sync is configured."}
        </p>
      )}
    </ChannelScreen>
  );
}
