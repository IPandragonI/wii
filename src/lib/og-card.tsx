/** Shared layout for generated social preview images (rendered by next/og, so inline styles only). */
export function OgCard({ title, subtitle, accent = "#2cb7ea" }: { title: string; subtitle: string; accent?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f4f5f7",
        padding: 56,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#ffffff",
          border: "6px solid #cfd3d8",
          borderRadius: 48,
          boxShadow: `0 0 0 6px ${accent}33`,
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 800, color: "#34373b", textAlign: "center", padding: "0 48px" }}>{title}</div>
        <div style={{ marginTop: 16, fontSize: 36, color: "#8a8f96" }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
        <div style={{ width: 220, height: 14, borderRadius: 7, background: accent }} />
      </div>
    </div>
  );
}

export const OG_SIZE = { width: 1200, height: 630 };
