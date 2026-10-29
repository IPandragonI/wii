import { Info } from "lucide-react";

import type { DataSource } from "@/types/project";

/** Makes it obvious when the page shows local sample data instead of live GitHub data. */
export function SampleDataNotice({ source }: { source: DataSource }) {
  if (source !== "fallback") return null;
  return (
    <p className="mx-auto flex w-fit items-center gap-2 rounded-full border border-wii-line bg-wii-surface px-4 py-1.5 text-xs font-bold text-wii-ink shadow-channel">
      <Info aria-hidden="true" size={14} className="text-wii-blue" />
      Sample data – live sync with GitHub is not available
    </p>
  );
}
