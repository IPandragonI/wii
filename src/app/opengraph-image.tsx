import { ImageResponse } from "next/og";

import { displayName, profile } from "@/config/profile";
import { OG_SIZE, OgCard } from "@/lib/og-card";

export const alt = "Portfolio channel menu";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<OgCard title={displayName()} subtitle={`${profile.role} · Channel Menu`} />, size);
}
