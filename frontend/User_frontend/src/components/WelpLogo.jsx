/**
 * Brand lockup — raster from /public/welp-logo.png (user-provided asset).
 * Replace the file in public/ to update the logo site-wide.
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
