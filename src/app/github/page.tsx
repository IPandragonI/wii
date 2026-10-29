import { GitHubView, githubMetadata } from "@/views/github";

export const metadata = githubMetadata("en");

export default function GitHubPage() {
  return <GitHubView locale="en" />;
}
