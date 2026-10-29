import { ContactView, contactMetadata } from "@/views/contact";

export const metadata = contactMetadata("fr");

export default function ContactPage() {
  return <ContactView locale="fr" />;
}
