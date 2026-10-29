import { getPortfolio } from "@/lib/portfolio";
import type { PublicPortfolioResponse } from "@/types/project";

/**
 * Normalized public project list. Served from the same cache as the pages, so requests
 * here never trigger extra GitHub or Vercel calls. Provider issues stay server-side.
 */
export async function GET() {
  const data = await getPortfolio();
  const body: PublicPortfolioResponse = {
    projects: data.projects,
    source: data.source,
    lastSyncedAt: data.lastSyncedAt,
  };
  return Response.json(body);
}
