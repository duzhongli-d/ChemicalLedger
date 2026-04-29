"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function StatusPanel() {
  const t = useTranslations("home");
  const [mounted, setMounted] = useState(false);
  const [activeLed, setActiveLed] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // LED cycling effect - only start after mount to prevent hydration mismatch
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setActiveLed(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, [mounted]);

  const statusLeds = [
    { label: "SYSTEM", color: "#10b981" },  // green
    { label: "ANALYTICAL", color: "#f59e0b" },  // amber
    { label: "AI ENGINE", color: "#f97316" },  // orange
  ];

  // Sample data for sparkline (percentage values)
  const sparkData = [40, 55, 45, 60, 75, 65, 80, 70, 85, 78, 92, 88];

  // Calculate SVG path for sparkline
  const maxVal = Math.max(...sparkData);
  const minVal = Math.min(...sparkData);
  const range = maxVal - minVal || 1;
  const width = 200;
  const height = 60;

  const points = sparkData.map((val, i) => {
    const x = (i / (sparkData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const linePath = `M${points.split(" ").map(p => p).join(" L")}`;

  return (
    <div
      className="relative p-5 rounded-xl"
      style={{
        background: "rgba(10, 15, 26, 0.95)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)"
      }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.2) 1px, transparent 1px)`,
          backgroundSize: "16px 16px"
        }}
      />

      <div className="relative z-10">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4 pb-3"
             style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.15)" }}>
          <span
            className="text-xs font-semibold tracking-wider"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#f97316" }}
          >
            SYSTEM STATUS
          </span>
          <span
            className="text-xs"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#10b981" }}
          >
            v2.4.1
          </span>
        </div>

        {/* Status LEDs */}
        <div className="flex gap-4 mb-4">
          {statusLeds.map((led, i) => (
            <div key={led.label} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-led-pulse"
                style={{
                  background: led.color,
                  opacity: activeLed === i ? 1 : 0.3,
                  boxShadow: activeLed === i ? `0 0 8px ${led.color}` : "none"
                }}
              />
              <span
                className="text-[10px] tracking-wider"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#94a3b8" }}
              >
                {led.label}
              </span>
            </div>
          ))}
        </div>

        {/* Sparkline chart */}
        <div className="mb-4">
          <div
            className="text-[10px] mb-2 tracking-wider"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#64748b" }}
          >
            ACTIVITY LAST 24H
          </div>
          <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none">
            {/* Gradient fill */}
            <defs>
              <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`${linePath} L200,60 L0,60 Z`}
              fill="url(#sparkGrad)"
            />
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#sparkGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-line-draw"
              style={{
                stroke: "#f97316",
                strokeDasharray: 200,
                strokeDashoffset: 200,
                animation: "line-draw 1.5s ease-out forwards"
              }}
            />
          </svg>
        </div>

        {/* Data metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-lg"
            style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.1)" }}
          >
            <div
              className="text-lg font-semibold"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#2dd4bf" }}
            >
              168
            </div>
            <div
              className="text-[10px]"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#64748b" }}
            >
              RECORDS TODAY
            </div>
          </div>
          <div
            className="p-3 rounded-lg"
            style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.1)" }}
          >
            <div
              className="text-lg font-semibold"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#2dd4bf" }}
            >
              99.8%
            </div>
            <div
              className="text-[10px]"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#64748b" }}
            >
              ACCURACY
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div
          className="mt-4 pt-3 flex items-center justify-between text-[10px]"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#64748b",
            borderTop: "1px solid rgba(148, 163, 184, 0.15)"
          }}
        >
          <span>LAST SYNC: 2 MIN AGO</span>
          <span style={{ color: "#10b981" }}>● ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </div>
  );
}