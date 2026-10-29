import { BriefcaseBusiness, ExternalLink, GraduationCap, MapPin } from "lucide-react";
import type { Metadata } from "next";

import { ChannelScreen } from "@/components/channel/ChannelScreen";
import { displayName, linkedinUrl, profile } from "@/config/profile";
import { safeExternalUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "LinkedIn",
  description: `${displayName()}'s professional profile on LinkedIn.`,
  alternates: { canonical: "/linkedin" },
};

export default function LinkedInPage() {
  const url = safeExternalUrl(linkedinUrl());
  const current = profile.experience[0];
  const degree = profile.education[0];
  const label = url?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const openProfile = (className: string, compactLabel = false) =>
    url && (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        <ExternalLink aria-hidden="true" size={18} strokeWidth={2.5} />
        {compactLabel ? (
          <>
            <span className="sm:hidden">Open profile</span>
            <span className="hidden sm:inline">Open LinkedIn profile</span>
          </>
        ) : (
          "Open LinkedIn profile"
        )}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );

  return (
    <ChannelScreen
      title="LinkedIn"
      icon="linkedin"
      actions={openProfile("wii-button wii-button-primary h-12 min-h-0 px-4 text-base sm:h-[3.4rem] sm:px-7 sm:text-lg", true)}
    >
      {url ? (
        <section className="wii-panel max-w-3xl overflow-hidden" aria-labelledby="linkedin-name">
          <div className="h-24 bg-gradient-to-r from-[#0a66c2] to-[#378fe9] sm:h-28" />
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex h-24 w-24 items-end justify-center overflow-hidden rounded-full border-4 border-white bg-[#e8f3fc] shadow-channel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/models/mii/wave-a.png" alt="" className="h-[150%] max-w-none translate-y-[22%]" />
            </div>
            <h2 id="linkedin-name" className="mt-4 text-2xl font-extrabold text-wii-ink-strong">
              {profile.name}
            </h2>
            <p className="text-lg font-bold text-wii-ink">{profile.role}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {profile.location && (
                <li className="flex items-center gap-2">
                  <MapPin aria-hidden="true" size={16} className="text-wii-ink-soft" />
                  {profile.location}
                </li>
              )}
              {current && (
                <li className="flex items-center gap-2">
                  <BriefcaseBusiness aria-hidden="true" size={16} className="text-wii-ink-soft" />
                  {current.role} at {current.organization} ({current.start} – {current.end})
                </li>
              )}
              {degree && (
                <li className="flex items-center gap-2">
                  <GraduationCap aria-hidden="true" size={16} className="text-wii-ink-soft" />
                  {degree.degree}, {degree.school}
                </li>
              )}
            </ul>
            {profile.availability && <p className="mt-4 leading-relaxed">{profile.availability}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {openProfile("wii-button wii-button-primary")}
              <span className="text-sm text-wii-ink-soft">{label}</span>
            </div>
          </div>
        </section>
      ) : (
        <p className="wii-panel max-w-2xl p-6">
          No LinkedIn profile is configured yet. Add it to the <code>links</code> in <code>src/config/profile.ts</code>.
        </p>
      )}
    </ChannelScreen>
  );
}
