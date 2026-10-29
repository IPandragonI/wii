import { LinkedInView, linkedinMetadata } from "@/views/linkedin";

export const metadata = linkedinMetadata("fr");

export default function LinkedInPage() {
  return <LinkedInView locale="fr" />;
}
