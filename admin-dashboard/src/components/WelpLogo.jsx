/**
 * Brand lockup — raster from /public/welp-logo.png.
 * Replace that file to update the logo everywhere.
 */
export default function WelpLogo({ className = "" }) {
  return (
    <img
      src="/welp-logo.png"
      alt="WELP"
      width={200}
      height={44}
      draggable={false}
      decoding="async"
      className={[
        "block h-8 w-auto max-w-[min(200px,52vw)] object-contain object-left md:h-9",
        className,
      ].join(" ")}
    />
  );
}
