export function QCDoorLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      className={className}
      aria-label="Abachem QC Logo"
    >
      {/* Letter Q - Rounded rectangle with thicker left vertical */}
      <g transform="translate(10, 18)">
        {/* Q outer rectangle with rounded corners */}
        <rect
          x="4" y="4" width="62" height="62" rx="8" ry="8"
          fill="none" stroke="#f97316" strokeWidth="8"
        />
        {/* Q tail - diagonal stroke */}
        <path d="M 48 52 L 66 76" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
      </g>

      {/* Letter C - Matching rounded style */}
      <g transform="translate(60, 18)">
        {/* C arc - matching rounded rectangle style */}
        <path
          d="M 52 8 L 22 8 Q 4 8 4 35 L 4 35 Q 4 62 22 62 L 52 62"
          fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round"
        />
        {/* C horizontal caps */}
        <line x1="52" y1="8" x2="58" y2="8" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
        <line x1="52" y1="62" x2="58" y2="62" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
      </g>
    </svg>
  );
}
