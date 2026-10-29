import { CalendarClock, GitFork, Rocket, Star } from "lucide-react";
import type { ReactNode } from "react";

import { ProjectPreview } from "@/components/project/ProjectPreview";
import { formatCount, formatDate } from "@/lib/format";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { messagesFor } from "@/i18n/messages";
import type { PortfolioProject } from "@/types/project";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="wii-panel p-5 sm:p-6">
      <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-wii-ink-soft">{title}</h2>
      {children}
    </section>
  );
}

export function ProjectDetails({ project, locale = DEFAULT_LOCALE }: { project: PortfolioProject; locale?: Locale }) {
  const t = messagesFor(locale).project;
  const facts = [
    { label: t.lastUpdate, value: formatDate(project.lastUpdatedAt, locale), Icon: CalendarClock },
    { label: t.lastDeployment, value: formatDate(project.lastDeploymentAt, locale), Icon: Rocket },
    { label: t.stars, value: formatCount(project.githubStars, locale), Icon: Star },
    { label: t.forks, value: formatCount(project.githubForks, locale), Icon: GitFork },
  ].filter((fact) => fact.value !== undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <div className="space-y-6">
        <ProjectPreview project={project} locale={locale} />
        {(project.description || project.details) && (
          <Section title={t.about}>
            {project.description && <p className="text-lg leading-relaxed text-wii-ink-strong">{project.description}</p>}
            {project.details &&
              project.details.split(/\n{2,}/).map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
          </Section>
        )}
        {project.highlights.length > 0 && (
          <Section title={t.notes}>
            <ul className="space-y-2">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wii-cyan" />
                  {highlight}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <aside className="space-y-6">
        {project.technologies.length > 0 && (
          <Section title={t.builtWith}>
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <li
                  key={technology}
                  className="rounded-full border border-wii-line bg-wii-bg px-3 py-1 text-sm font-bold text-wii-ink-strong"
                >
                  {technology}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {facts.length > 0 && (
          <Section title={t.details}>
            <dl className="divide-y divide-wii-line-soft">
              {facts.map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="flex items-center gap-2 text-sm">
                    <Icon aria-hidden="true" size={16} className="text-wii-ink-soft" />
                    {label}
                  </dt>
                  <dd className="font-bold text-wii-ink-strong tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {!project.productionUrl && project.source === "live" && (
          <p className="rounded-2xl border border-dashed border-wii-line px-4 py-3 text-sm">
            {t.noDeployment}
          </p>
        )}
      </aside>
    </div>
  );
}
