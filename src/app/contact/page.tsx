import { BriefcaseBusiness, ExternalLink, Globe, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { GitHubMark } from "@/components/ui/ChannelIcon";
import { displayName, profile, type ProfileLink } from "@/config/profile";
import { getPortfolio } from "@/lib/portfolio";
import { safeExternalUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${displayName()}.`,
  alternates: { canonical: "/contact" },
};

const ICONS: Record<ProfileLink["kind"], typeof Mail | typeof GitHubMark> = {
  github: GitHubMark,
  linkedin: BriefcaseBusiness,
  email: Mail,
  website: Globe,
  other: ExternalLink,
};

export default async function ContactPage() {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : undefined;
  // The GitHub profile comes from the GitHub integration (GITHUB_USERNAME), not from the profile.
  const { githubProfileUrl } = await getPortfolio();
  const configured: ProfileLink[] = [
    ...profile.links,
    ...(githubProfileUrl ? [{ label: "GitHub", href: githubProfileUrl, kind: "github" as const }] : []),
  ];
  const links = configured.flatMap((link) => {
    const href = safeExternalUrl(link.href);
    return href ? [{ ...link, href }] : [];
  });

  return (
    <ChannelScreen
      title="Contact"
      icon="contact"
      actions={
        email && (
          <a href={`mailto:${email}`} className="wii-button wii-button-primary">
            <Mail aria-hidden="true" size={18} strokeWidth={2.5} />
            Send an email
          </a>
        )
      }
    >
      <section className="wii-panel max-w-2xl p-6 sm:p-8">
        <p className="text-lg leading-relaxed">
          {email || links.length
            ? "Have a project in mind, or just want to say hello? Reach out here."
            : "Contact details have not been published yet."}
        </p>
        {(profile.location || profile.availability) && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-wii-ink">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" size={16} className="text-wii-ink-soft" />
                {profile.location}
              </span>
            )}
            {profile.availability && <span className="text-wii-ink-soft">{profile.availability}</span>}
          </p>
        )}
        {email && (
          <p className="mt-4 text-xl font-extrabold text-wii-ink-strong">
            <a href={`mailto:${email}`} className="underline decoration-wii-cyan decoration-2 underline-offset-4">
              {email}
            </a>
          </p>
        )}
        {links.length > 0 && (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {links.map((link) => {
              const Icon = ICONS[link.kind];
              return (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="wii-button w-full justify-start">
                    <Icon aria-hidden="true" size={18} />
                    {link.label}
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </ChannelScreen>
  );
}
