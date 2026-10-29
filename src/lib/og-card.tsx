import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import type { ChannelScene } from "@/types/project";

/**
 * Social preview images (rendered by next/og, so inline styles only).
 *
 * The animated banner scenes can't be rendered by next/og, so each scene has a still
 * 1200×630 frame in assets/og-scenes, captured from the real component. A card shows the
 * project's own scene inside a console-style channel frame, with a title plate.
 */

export const OG_SIZE = { width: 1200, height: 630 };

async function sceneFrame(scene: ChannelScene): Promise<string | undefined> {
  try {
    const file = await readFile(join(process.cwd(), "assets/og-scenes", `${scene}.jpg`));
    return `data:image/jpeg;base64,${file.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function sceneOgImage({ scene, title, subtitle }: { scene: ChannelScene; title: string; subtitle?: string }) {
  const frame = await sceneFrame(scene);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#e7e9ec", padding: 28, fontFamily: "sans-serif" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            overflow: "hidden",
            borderRadius: 44,
            border: "8px solid #c9cdd1",
            background: "#ffffff",
            boxShadow: "0 0 0 6px rgba(52, 190, 237, 0.35)",
          }}
        >
          {frame && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frame} alt="" width={1128} height={574} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
          )}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.94)",
                borderRadius: 32,
                padding: "18px 44px",
                boxShadow: "0 8px 28px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div style={{ fontSize: 64, fontWeight: 800, color: "#4f545b" }}>{title}</div>
              {subtitle && <div style={{ marginTop: 6, fontSize: 30, color: "#8a8f96" }}>{subtitle}</div>}
            </div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
