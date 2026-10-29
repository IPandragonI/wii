import { displayName } from "@/config/profile";
import { OG_SIZE, sceneOgImage } from "@/lib/og-card";

export const alt = `LinkedIn · ${displayName()}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return sceneOgImage({ scene: "linkedin", title: "LinkedIn", subtitle: displayName() });
}
