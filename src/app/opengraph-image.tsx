import { displayName, profile } from "@/config/profile";
import { OG_SIZE, sceneOgImage } from "@/lib/og-card";

export const alt = `${displayName()}, ${profile.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return sceneOgImage({ scene: "about", title: displayName(), subtitle: profile.role });
}
