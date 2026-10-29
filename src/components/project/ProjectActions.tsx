import { CodeXml, Play } from "lucide-react";

import type { PortfolioProject } from "@/types/project";

const BUTTON = "wii-button h-12 min-h-0 px-4 text-base sm:h-[3.4rem] sm:px-7 sm:text-lg";

/**
 * Source and Launch buttons for the channel bar. Each only renders when its URL exists, so
 * there is never a dead button. Labels shorten on small screens.
 */
export function ProjectActions({ project }: { project: PortfolioProject }) {
  return (
    <>
      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={BUTTON}>
          <CodeXml aria-hidden="true" size={18} strokeWidth={2.5} />
          <span className="sm:hidden">Source</span>
          <span className="hidden sm:inline">View source</span>
          <span className="sr-only">(opens GitHub in a new tab)</span>
        </a>
      )}
      {project.productionUrl && (
        <a href={project.productionUrl} target="_blank" rel="noopener noreferrer" className={`${BUTTON} wii-button-primary`}>
          <Play aria-hidden="true" size={18} strokeWidth={2.5} className="fill-current" />
          <span className="sm:hidden">Launch</span>
          <span className="hidden sm:inline">Launch project</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </>
  );
}
