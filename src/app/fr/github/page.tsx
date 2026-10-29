import { GitHubView, githubMetadata } from "@/views/github";

export const metadata = githubMetadata("fr");

export default function GitHubPageFr() {
  return <GitHubView locale="fr" />;
}
