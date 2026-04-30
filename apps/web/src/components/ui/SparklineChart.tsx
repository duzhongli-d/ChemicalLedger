"use client";
import { useEffect, useState, useRef } from "react";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  showArea?: boolean;
  gradientId?: string;
}

export function SparklineChart({
  data,
  width = 200,
  height = 60,
  strokeWidth = 2,
  showArea = true,
  gradientId = "sparkline-gradient"
}: SparklineChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (data.length < 2) return null;

  const maxVal = data.reduce((a, b) => Math.max(a, b), -Infinity);
  const minVal = data.reduce((a, b) => Math.min(a, b), Infinity);
  const range = maxVal - minVal || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 10) - 5;
    return { x, y };
  });

  const linePath = points.map((p, i) =>
    i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`
  ).join(" ");

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const pathLength = width * 2; // Approximate for stroke-dasharray

  return (
    <div ref={ref} className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id={`${gradientId}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {showArea && (
          <path
            d={areaPath}
            fill={`url(#${gradientId}-area)`}
            style={{ opacity: isVisible ? 1 : 0 }}
          />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isVisible ? 0 : pathLength,
            transition: "stroke-dashoffset 1s ease-out"
          }}
        />

        {/* End dot */}
        {isVisible && points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3"
            fill="#0d9488"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 0.3s ease-out 0.8s"
            }}
          />
        )}
      </svg>
    </div>
  );
}