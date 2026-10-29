import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { WiiMenu } from "@/components/wii-menu/WiiMenu";
import { displayName } from "@/config/profile";
import { buildMenuChannels } from "@/lib/menu";
import { featuredForMenu, getPortfolio } from "@/lib/portfolio";

export default async function HomePage() {
  const data = await getPortfolio();
  const channels = buildMenuChannels(featuredForMenu(data));

  return (
    <div className="flex min-h-dvh flex-col">
      {data.source === "fallback" && (
        <div className="px-4 pt-4">
          <SampleDataNotice source={data.source} />
        </div>
      )}
      <WiiMenu channels={channels} heading={`${displayName()} – channel menu`} />
    </div>
  );
}
