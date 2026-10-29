import { at, type SceneProps } from "@/components/ui/scenes/shared";

/** Web apps: calm geometric motion in the project's color, in one of three variants. */
export function AppScene({ title }: SceneProps) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const variant = hash % 3;
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-br from-white to-[var(--tint-soft)]" />
      <span
        className="wii-blob wii-ambient absolute rounded-full"
        style={{ ...at(-80, -20, 90, 90), background: "radial-gradient(circle, color-mix(in srgb, var(--tint) 30%, white), transparent 70%)" }}
      />
      <span
        className="wii-blob wii-blob-slow wii-ambient absolute rounded-full"
        style={{ ...at(10, 20, 100, 100), background: "radial-gradient(circle, color-mix(in srgb, var(--tint) 22%, white), transparent 70%)" }}
      />
      {variant === 0 &&
        // A grid of rounded squares that light up in a diagonal wave.
        Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 9 }, (_, column) => (
            <span
              key={`${row}-${column}`}
              className="wii-wave-tile wii-ambient absolute rounded-[2cqh]"
              style={{ ...at(-60 + column * 14, 4 + row * 14, 10, 10), background: "var(--tint)", animationDelay: `${(row + column) * 0.12}s` }}
            />
          )),
        )}
      {variant === 1 &&
        // Concentric rings expanding from the center.
        [0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className="wii-ring wii-ambient absolute rounded-full border-[0.8cqh]"
            style={{ ...at(-35, 2, 70, 70), borderColor: "var(--tint)", animationDelay: `${index * -1.1}s` }}
          />
        ))}
      {variant === 2 &&
        // Flowing diagonal lines.
        [0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className="wii-flow wii-ambient absolute rounded-full"
            style={{
              ...at(-80, 6 + index * 12, 160, 2),
              background: "linear-gradient(to right, transparent, var(--tint), transparent)",
              opacity: 0.25 + index * 0.08,
              animationDelay: `${index * -0.9}s`,
            }}
          />
        ))}
    </>
  );
}
