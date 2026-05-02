"use client";

export function BrandLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      aria-label="Abachem QC Logo"
    >
      <defs>
        <linearGradient id="qcOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="qcTeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>

      {/* Q: Circle with diagonal tail */}
      <circle cx="26" cy="28" r="14" fill="none" stroke="url(#qcOrange)" strokeWidth="4.5" />
      <path
        d="M36 38 L44 46 L40 50"
        fill="none"
        stroke="url(#qcOrange)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* C: Arc wrapping around left side */}
      <path
        d="M14 40 C 8 40, 4 32, 6 24 C 8 16, 16 12, 26 14"
        fill="none"
        stroke="url(#qcTeal)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx="26" cy="28" r="2.5" fill="#f97316" />
    </svg>
  );
}
