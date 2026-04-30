"use client";

/**
 * Reusable blueprint-style title brackets: [ title ]
 * Used across StatCard, BlueprintHeader, and similar dashboard components
 * to maintain consistent visual language.
 */
export function BlueprintBrackets({
  title,
  subtitle,
  className = "",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span
          className="text-base font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#f97316" }}
        >
          [
        </span>
        <span
          className="tracking-wide"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </span>
        <span
          className="text-base font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#f97316" }}
        >
          ]
        </span>
      </div>
      {subtitle && (
        <div
          className="text-sm ml-6"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#64748b",
            letterSpacing: "0.05em",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}