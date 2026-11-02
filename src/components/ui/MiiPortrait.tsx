/**
 * The head of the 3D character, framed for a circular avatar.
 *
 * The source is a full-body 480×560 render. Its head (hair to chin) spans about x 125–362,
 * y 92–300, centered on (243, 196). The image is scaled so that head fills 72% of the circle's
 * width and shifted so the head center is the circle center. All values are percentages of
 * the circle, so the framing holds at any size, and the height follows the aspect ratio
 * (the model is never stretched). Put it inside a `relative overflow-hidden rounded-full` box.
 */
const SOURCE = { width: 480, headCenterX: 243, headCenterY: 196, headWidth: 237 };
const FILL = 0.72;

const scale = 100 / (SOURCE.headWidth / FILL); // percent of the circle per source pixel

export function MiiPortrait({ src = "/models/mii/wave-a.png" }: { src?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      className="absolute max-w-none select-none"
      style={{
        width: `${SOURCE.width * scale}%`,
        left: `${50 - SOURCE.headCenterX * scale}%`,
        top: `${50 - SOURCE.headCenterY * scale}%`,
      }}
    />
  );
}
