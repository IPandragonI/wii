import { LinkedInView, linkedinMetadata } from "@/views/linkedin";

export const metadata = linkedinMetadata("en");

export default function LinkedInPage() {
  return <LinkedInView locale="en" />;
}
