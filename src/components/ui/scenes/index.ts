import type { ReactNode } from "react";

import { BoardScene } from "@/components/ui/scenes/chess";
import { RaceScene } from "@/components/ui/scenes/race";
import { RoadScene } from "@/components/ui/scenes/road";
import { MusicScene } from "@/components/ui/scenes/music";
import { DartsScene } from "@/components/ui/scenes/darts";
import { NetworkScene } from "@/components/ui/scenes/network";
import { IslandScene } from "@/components/ui/scenes/island";
import { ArcadeScene } from "@/components/ui/scenes/arcade";
import { AppScene } from "@/components/ui/scenes/app";
import { ProjectsScene } from "@/components/ui/scenes/projects";
import { GitHubScene } from "@/components/ui/scenes/github";
import { AboutScene } from "@/components/ui/scenes/about";
import { LinkedInScene } from "@/components/ui/scenes/linkedin";
import { ContactScene } from "@/components/ui/scenes/contact";
import type { SceneProps } from "@/components/ui/scenes/shared";
import type { ChannelScene } from "@/types/project";

/** Every banner scene, one file each. Add a scene by creating a file here and listing it below. */
export const SCENES: Record<ChannelScene, (props: SceneProps) => ReactNode> = {
  board: BoardScene,
  race: RaceScene,
  road: RoadScene,
  music: MusicScene,
  darts: DartsScene,
  network: NetworkScene,
  island: IslandScene,
  arcade: ArcadeScene,
  app: AppScene,
  projects: ProjectsScene,
  github: GitHubScene,
  about: AboutScene,
  linkedin: LinkedInScene,
  contact: ContactScene,
};
