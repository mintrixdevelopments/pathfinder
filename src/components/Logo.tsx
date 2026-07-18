"use client";

const CONTENT_W_PCT = 82.76;
const CONTENT_H_PCT = 40.07;
const LEFT_PCT = 9.67;
const TOP_PCT = 29.15;
const ORIGINAL_ASPECT = 1717 / 916;

export function Logo({ height = 32 }: { height?: number }) {
  const scaledImgHeight = height / (CONTENT_H_PCT / 100);
  const scaledImgWidth = scaledImgHeight * ORIGINAL_ASPECT;
  const wrapperWidth = scaledImgWidth * (CONTENT_W_PCT / 100);
  const top = -((TOP_PCT / 100) * scaledImgHeight);
  const left = -((LEFT_PCT / 100) * scaledImgWidth);

  return (
    <div style={{ height, width: wrapperWidth, position: "relative", overflow: "hidden" }}>
      <img
        src="/logo-full.png"
        alt="Pathfinder"
        style={{ position: "absolute", height: scaledImgHeight, width: scaledImgWidth, top, left, maxWidth: "none" }}
      />
    </div>
  );
}
