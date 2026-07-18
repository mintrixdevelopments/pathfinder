import Image from "next/image";

const SOURCE_WIDTH = 1717;
const SOURCE_HEIGHT = 916;
const CONTENT_WIDTH_RATIO = 0.8276;
const CONTENT_HEIGHT_RATIO = 0.4007;
const CONTENT_LEFT_RATIO = 0.0967;
const CONTENT_TOP_RATIO = 0.2915;

interface LogoProps {
  height?: number;
  priority?: boolean;
  className?: string;
  themeAware?: boolean;
}

/**
 * Renders the visible Pathfinder mark without the large white padding that is
 * baked into logo-full.png. `height` always refers to the visible logo height.
 */
export function Logo({ height = 36, priority = false, className = "", themeAware = false }: LogoProps) {
  const renderedImageHeight = height / CONTENT_HEIGHT_RATIO;
  const renderedImageWidth = renderedImageHeight * (SOURCE_WIDTH / SOURCE_HEIGHT);
  const visibleWidth = renderedImageWidth * CONTENT_WIDTH_RATIO;

  return (
    <span
      aria-label="Pathfinder"
      className={`relative inline-block shrink-0 overflow-hidden ${className}`}
      style={{ height, width: visibleWidth }}
    >
      <Image
        src="/logo-full.png"
        alt=""
        width={SOURCE_WIDTH}
        height={SOURCE_HEIGHT}
        priority={priority}
        sizes={`${Math.ceil(visibleWidth)}px`}
        className={themeAware ? "dark:hidden" : undefined}
        style={{
          position: "absolute",
          height: renderedImageHeight,
          width: renderedImageWidth,
          maxWidth: "none",
          left: -(CONTENT_LEFT_RATIO * renderedImageWidth),
          top: -(CONTENT_TOP_RATIO * renderedImageHeight),
        }}
      />
      {themeAware && (
        <Image
          src="/logot.png"
          alt=""
          fill
          priority={priority}
          sizes={`${Math.ceil(visibleWidth)}px`}
          className="hidden object-contain dark:block"
        />
      )}
    </span>
  );
}
