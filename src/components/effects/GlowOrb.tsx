"use client";

export default function GlowOrb({
  color = "accent",
  size = 400,
  top,
  left,
  right,
  bottom,
  opacity = 0.08,
  blur = 120,
  animate = true,
}: {
  color?: "accent" | "secondary" | "mixed";
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity?: number;
  blur?: number;
  animate?: boolean;
}) {
  const colorMap = {
    accent: "rgba(0, 229, 255",
    secondary: "rgba(168, 85, 247",
    mixed: "rgba(100, 157, 247",
  };

  return (
    <div
      className={`absolute rounded-full pointer-events-none ${animate ? "animate-float-slow" : ""}`}
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: `radial-gradient(circle, ${colorMap[color]}, ${opacity}), transparent 70%)`,
        filter: `blur(${blur}px)`,
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
