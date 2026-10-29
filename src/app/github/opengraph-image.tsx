import { displayName } from "@/config/profile";
import { OG_SIZE, sceneOgImage } from "@/lib/og-card";

export const alt = `GitHub · ${displayName()}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return sceneOgImage({ scene: "github", title: "GitHub", subtitle: displayName() });
}
