import { ChannelScreen } from "@/components/channel/ChannelScreen";

export default function NotFound() {
  return (
    <ChannelScreen title="Channel not found">
      <section className="wii-panel max-w-xl p-8">
        <p className="text-6xl font-extrabold text-wii-line" aria-hidden="true">
          404
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          This channel isn&apos;t installed. It may have been renamed or removed. Head back to the menu to see
          everything that&apos;s available.
        </p>
      </section>
    </ChannelScreen>
  );
}
