import { BriefcaseBusiness, GraduationCap, Heart, Languages, MapPin, Sparkles, Wrench } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MiiStage } from "@/components/about/MiiStage";
import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { MII_FAVORITE_COLOR } from "@/components/ui/MiiAvatar";
import { displayName, getProfile } from "@/config/profile";
import { LocaleProvider } from "@/i18n/client";
import { alternatesFor, type Locale } from "@/i18n/config";
import { messagesFor } from "@/i18n/messages";

export function aboutMetadata(locale: Locale): Metadata {
  const t = messagesFor(locale);
  return {
    title: t.channels.about.title,
    description: t.about.description(displayName(), getProfile(locale).role),
    alternates: alternatesFor(locale, "/about"),
  };
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="wii-panel p-6 sm:p-8" aria-labelledby={id}>
      <h2 id={id} className="mb-5 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-wii-ink-soft">
        <span aria-hidden="true" className="text-wii-blue">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-wii-line bg-wii-bg px-3 py-1 text-sm font-bold">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** A vertical timeline: a light-blue rail with a dot per entry, newest first. */
function Timeline({ children }: { children: ReactNode }) {
  return <ol className="relative space-y-8 border-l-2 border-wii-cyan-soft pl-6">{children}</ol>;
}

function TimelineItem({ when, children }: { when: string; children: ReactNode }) {
  return (
    <li className="relative">
      <span aria-hidden="true" className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-[3px] border-white bg-wii-cyan shadow-channel" />
      <p className="text-sm font-bold text-wii-blue">{when}</p>
      {children}
    </li>
  );
}

export function AboutView({ locale }: { locale: Locale }) {
  const profile = getProfile(locale);
  const messages = messagesFor(locale);
  const t = messages.about;
  const name = profile.name.trim();

  return (
    <LocaleProvider locale={locale}>
      <ChannelScreen title={messages.channels.about.title} icon="about">
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start lg:gap-8">
          {/* The Mii stands in a small plaza: soft sky, a tiled floor in perspective, a nameplate. */}
          <section
            aria-label={t.miiSection}
            className="wii-panel relative isolate flex select-none flex-col items-center overflow-hidden px-6 pb-6 pt-4 md:sticky md:top-28 md:min-h-[30rem] md:justify-end"
          >
            <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#e6f5fd] via-white to-white" />
            <span
              aria-hidden="true"
              className="absolute inset-x-[-50%] bottom-0 -z-10 h-[42%] origin-bottom"
              style={{
                transform: "perspective(400px) rotateX(55deg)",
                background:
                  "linear-gradient(to right, #dfe3e8 1px, transparent 1px) 0 0 / 48px 48px, linear-gradient(to bottom, #dfe3e8 1px, #f6f7f9 1px) 0 0 / 48px 48px",
              }}
            />
            <div className="relative h-64 w-full sm:h-72 md:h-[22rem]">
              <MiiStage label={t.miiLabel(name || t.me)} />
            </div>
            <p className="relative mt-3 flex items-center gap-2 rounded-full bg-white px-5 py-2 text-lg font-extrabold text-wii-ink-strong shadow-channel ring-1 ring-black/5">
              <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: MII_FAVORITE_COLOR }} />
              {name || t.me}
            </p>
          </section>

          <div className="space-y-6">
            {/* A speech bubble from the Mii: tail points up on mobile, left on wider screens. */}
            <section className="wii-panel relative space-y-4 p-6 sm:p-8" aria-labelledby="intro-heading">
              <span
                aria-hidden="true"
                className="absolute -top-[11px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-wii-line-soft bg-white md:-left-[11px] md:top-16 md:translate-x-0 md:-rotate-45"
              />
              <h2 id="intro-heading" className="text-2xl font-extrabold text-wii-ink-strong">
                {name ? t.greeting(name) : t.greetingAnonymous} <span className="text-wii-blue">{profile.role}.</span>
              </h2>
              {(profile.location || profile.availability) && (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-wii-ink">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin aria-hidden="true" size={16} className="text-wii-ink-soft" />
                      {profile.location}
                    </span>
                  )}
                  {profile.availability && <span className="rounded-full bg-wii-cyan-soft px-3 py-1 text-wii-blue">{profile.availability}</span>}
                </p>
              )}
              {profile.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>

            {profile.experience.length > 0 && (
              <Section id="experience-heading" title={t.experience} icon={<BriefcaseBusiness size={16} />}>
                <Timeline>
                  {profile.experience.map((job) => (
                    <TimelineItem key={`${job.organization}-${job.start}`} when={`${job.start} – ${job.end}`}>
                      <h3 className="mt-1 text-lg font-extrabold text-wii-ink-strong">
                        {job.role} · {job.organization}
                      </h3>
                      <p className="text-sm font-bold text-wii-ink-soft">{job.type}</p>
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed marker:text-wii-cyan">
                        {job.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                      {job.keyProjects && job.keyProjects.length > 0 && (
                        <div className="mt-4 rounded-2xl bg-wii-bg p-4">
                          <p className="mb-2 text-sm font-extrabold text-wii-ink-strong">{t.keyProjects}</p>
                          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-wii-cyan">
                            {job.keyProjects.map((project) => (
                              <li key={project}>{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-4">
                        <Chips items={job.technologies} />
                      </div>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Section>
            )}

            {profile.studyProjects.length > 0 && (
              <Section id="study-heading" title={t.studyProjects} icon={<Sparkles size={16} />}>
                <div className="grid gap-4 lg:grid-cols-2">
                  {profile.studyProjects.map((project) => (
                    <article key={project.title} className="rounded-2xl border-2 border-wii-line-soft p-5">
                      <p className="text-sm font-bold text-wii-blue">{project.date}</p>
                      <h3 className="mt-1 font-extrabold text-wii-ink-strong">{project.title}</h3>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-wii-cyan">
                        {project.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                      <div className="mt-3">
                        <Chips items={project.technologies} />
                      </div>
                    </article>
                  ))}
                </div>
              </Section>
            )}

            {profile.education.length > 0 && (
              <Section id="education-heading" title={t.education} icon={<GraduationCap size={16} />}>
                <Timeline>
                  {profile.education.map((entry) => (
                    <TimelineItem key={entry.degree} when={entry.period}>
                      <h3 className="mt-1 font-extrabold text-wii-ink-strong">{entry.degree}</h3>
                      <p className="text-sm">
                        {entry.school}
                        {entry.detail && <span className="text-wii-ink-soft"> · {entry.detail}</span>}
                      </p>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Section>
            )}

            {profile.skills.length > 0 && (
              <Section id="skills-heading" title={t.skills} icon={<Wrench size={16} />}>
                <dl className="grid gap-5 sm:grid-cols-2">
                  {profile.skills.map((group) => (
                    <div key={group.group}>
                      <dt className="mb-2 font-bold text-wii-ink-strong">{group.group}</dt>
                      <dd>
                        <Chips items={group.items} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {profile.languages.length > 0 && (
                <Section id="languages-heading" title={t.languages} icon={<Languages size={16} />}>
                  <ul className="space-y-2">
                    {profile.languages.map((entry) => (
                      <li key={entry.language}>
                        <span className="font-extrabold text-wii-ink-strong">{entry.language}</span>
                        <span className="text-wii-ink"> · {entry.level}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {profile.interests.length > 0 && (
                <Section id="interests-heading" title={t.interests} icon={<Heart size={16} />}>
                  <ul className="space-y-2">
                    {profile.interests.map((entry) => (
                      <li key={entry.topic}>
                        <span className="font-extrabold text-wii-ink-strong">{entry.topic}</span>
                        <span className="text-wii-ink"> · {entry.detail}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </div>
        </div>
      </ChannelScreen>
    </LocaleProvider>
  );
}
