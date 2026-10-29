// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectActions } from "@/components/project/ProjectActions";
import type { PortfolioProject } from "@/types/project";

const project = (overrides: Partial<PortfolioProject> = {}): PortfolioProject => ({
  id: "gh-1",
  slug: "islebound",
  name: "Islebound",
  description: "",
  category: "Game",
  technologies: [],
  highlights: [],
  featured: true,
  order: 1,
  status: "production",
  banner: "app",
  source: "live",
  ...overrides,
});

describe("ProjectActions", () => {
  it("links to the production deployment and source code in new tabs", () => {
    render(
      <ProjectActions
        project={project({ productionUrl: "https://islebound.app/", githubUrl: "https://github.com/octo/islebound" })}
      />,
    );
    const launch = screen.getByRole("link", { name: /Launch project/ });
    expect(launch).toHaveAttribute("href", "https://islebound.app/");
    expect(launch).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: /View source/ })).toHaveAttribute("href", "https://github.com/octo/islebound");
  });

  it("hides buttons whose URL is missing", () => {
    render(<ProjectActions project={project()} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
