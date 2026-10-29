import { HomeView, homeMetadata } from "@/views/home";

export const metadata = homeMetadata("fr");

export default function HomePageFr() {
  return <HomeView locale="fr" />;
}
