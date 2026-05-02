"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface FloatingActionButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({
  href = "/ledger/create",
  onClick,
  className = "",
}: FloatingActionButtonProps) {
  const t = useTranslations("ledger");
  const [showTooltip, setShowTooltip] = useState(false);

  const button = (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 w-14 h-14
        bg-[#f97316] text-white rounded-full
        flex items-center justify-center
        shadow-lg shadow-orange-500/40
        hover:bg-[#ea580c] hover:shadow-orange-500/60
        active:scale-95
        transition-all duration-200
        hover:scale-110
        group
        ${className}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        className="w-6 h-6 transition-transform group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );

  return (
    <>
      {href ? (
        <Link href={href} className="fixed bottom-6 right-6">
          {button}
        </Link>
      ) : (
        button
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed bottom-24 right-6 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-fade-in"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          {t("create")}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </>
  );
}
