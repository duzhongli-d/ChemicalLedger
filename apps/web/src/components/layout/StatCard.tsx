"use client";

import { useState } from "react";

interface StatCardProps {
  title: string;
  value: number;
  trend?: number[];
  accentColor?: "orange" | "teal" | "amber" | "slate" | "red" | "rose";
  variant?: "blueprint" | "clinical";
  className?: string;
  onClick?: () => void;
}

const colorMap = {
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    gradient: "sparkline-gradient-orange",
    clinical: "#f97316",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-600",
    gradient: "sparkline-gradient-teal",
    clinical: "#14b8a6",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    gradient: "sparkline-gradient-amber",
    clinical: "#f59e0b",
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    gradient: "sparkline-gradient-slate",
    clinical: "#64748b",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    gradient: "sparkline-gradient-red",
    clinical: "#ef4444",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    gradient: "sparkline-gradient-rose",
    clinical: "#ec4899",
  },
};

function ClinicalTrendBar({ trend, color }: { trend: number[]; color: string }) {
  if (!trend || trend.length < 2) return null;

  const maxVal = Math.max(...trend);
  const minVal = Math.min(...trend);
  const range = maxVal - minVal || 1;
  const lastValue = trend[trend.length - 1];
  const fillPercent = ((lastValue - minVal) / range) * 100;

  return (
    <div className="mt-3 h-[3px] w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.max(10, Math.min(100, fillPercent))}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
        }}
      />
    </div>
  );
}

export function StatCard({
  title,
  value,
  trend,
  accentColor = "orange",
  variant = "blueprint",
  className = "",
  onClick,
}: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorMap[accentColor];

  // Clinical Minimal variant
  if (variant === "clinical") {
    const shadow = isHovered
      ? "0 4px 12px rgba(0,0,0,0.08)"
      : "0 1px 3px rgba(0,0,0,0.04)";
    return (
      <div
        className={`
          relative rounded-xl p-5 cursor-pointer overflow-hidden
          transition-all duration-200 ease-out
          ${onClick ? "hover:-translate-y-px" : ""}
          ${isHovered ? "-translate-y-px" : ""}
          ${className}
        `}
        style={{
          animationFillMode: "backwards",
          backgroundColor: "var(--card, #FFFFFF)",
          border: "1px solid var(--border, #E2E8F0)",
          boxShadow: shadow,
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 4px accent bar on the left */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
          style={{ backgroundColor: colors.clinical }}
        />

        {/* Content */}
        <div className="pl-3">
          {/* Title - JetBrains Mono style */}
          <p
            className="text-[10px] uppercase tracking-[0.08em] mb-1"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--muted-foreground, #64748b)",
            }}
          >
            {title}
          </p>

          {/* Value - Space Grotesk style */}
          <div className="flex items-end justify-between">
            <p
              className="text-[36px] font-bold leading-none"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--card-foreground, #0F172A)",
              }}
            >
              {value}
            </p>
          </div>

          {/* Trend Bar at bottom */}
          {trend && trend.length > 1 && (
            <ClinicalTrendBar trend={trend} color={colors.clinical} />
          )}
        </div>
      </div>
    );
  }

  // Blueprint variant (original)
  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-xl p-4 shadow-sm ${className} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      {/* Blueprint-style title with brackets */}
      <div className="mb-2 text-[10px] uppercase tracking-[0.08em] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        [{title}]
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-bold ${colors.text}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {value}
        </div>
        {trend && trend.length > 1 && (
          <div className="text-xs text-slate-400">
            {/* Simplified sparkline indicator */}
            <svg width="96" height="40" viewBox="0 0 96 40" className="opacity-60">
              <polyline
                fill="none"
                stroke={colors.clinical}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={trend.map((v, i) => {
                  const x = (i / (trend.length - 1)) * 96;
                  const y = 40 - ((v - Math.min(...trend)) / (Math.max(...trend) - Math.min(...trend) || 1)) * 35 - 2;
                  return `${x},${y}`;
                }).join(" ")}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
