"use client";

export function BrandLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      aria-label="Abachem QC Logo"
    >
      {/* Q: Hexagon as benzene ring/molecular structure */}
      <path
        d="M22 16 L30 16 L36 22 L36 30 L30 36 L22 36 L16 30 L16 22 Z"
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Bond connection on Q (like chemical bond) */}
      <line
        x1="36" y1="30"
        x2="42" y2="36"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Small terminal circle for Q tail */}
      <circle cx="44" cy="40" r="3" fill="#f97316" />

      {/* C: Arc as electron orbital, wrapping from right to left */}
      <path
        d="M52 24 C 48 16, 36 14, 26 18 C 16 22, 12 32, 14 40 C 16 48, 26 52, 36 50"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Small accent dots to suggest molecular connections */}
      <circle cx="22" cy="16" r="1.5" fill="#14b8a6" />
      <circle cx="36" cy="22" r="1.5" fill="#14b8a6" />
    </svg>
  );
}