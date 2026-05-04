"use client";

import { SparklineChart } from "@/components/ui/SparklineChart";
import { BlueprintBrackets } from "@/components/ui/BlueprintBrackets";

interface StatCardProps {
  title: string;
  value: number;
  trend?: number[];
  accentColor?: "orange" | "teal" | "amber" | "slate" | "red" | "rose";
  className?: string;
  onClick?: () => void;
}

const colorMap = {
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    gradient: "sparkline-gradient-orange",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-600",
    gradient: "sparkline-gradient-teal",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    gradient: "sparkline-gradient-amber",
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    gradient: "sparkline-gradient-slate",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    gradient: "sparkline-gradient-red",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    gradient: "sparkline-gradient-rose",
  },
};

export function StatCard({
  title,
  value,
  trend,
  accentColor = "orange",
  className = "",
  onClick,
}: StatCardProps) {
  const colors = colorMap[accentColor];

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-xl p-4 shadow-sm ${className} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      {/* Blueprint-style title with brackets */}
      <BlueprintBrackets title={title} className="mb-2" />

      {/* Value and Sparkline */}
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-bold ${colors.text}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {value}
        </div>
        {trend && trend.length > 1 && (
          <div className="w-24">
            <SparklineChart
              data={trend}
              width={96}
              height={40}
              strokeWidth={2}
              showArea={true}
              gradientId={colors.gradient}
            />
          </div>
        )}
      </div>
    </div>
  );
}
