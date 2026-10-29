import { AboutView, aboutMetadata } from "@/views/about";

export const metadata = aboutMetadata("fr");

export default function AboutPage() {
  return <AboutView locale="fr" />;
}
