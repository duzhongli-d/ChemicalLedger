"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

function DNAHelixAnimation() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Outer glow filter */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* DNA double helix strands - animated drawing */}
      <path
        d="M30 10 Q60 30 90 10 Q60 30 30 50 Q60 70 90 50 Q60 70 30 90 Q60 110 90 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ filter: 'url(#glow)' }}
      />
      <path
        d="M90 10 Q60 30 30 10 Q60 30 90 50 Q60 70 30 50 Q60 70 90 90 Q60 110 30 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.5s", filter: 'url(#glow)' }}
      />
      {/* Base pairs - animated opacity */}
      <line x1="42" y1="22" x2="78" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
      <line x1="42" y1="42" x2="78" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
      <line x1="42" y1="62" x2="78" y2="62" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
      <line x1="42" y1="82" x2="78" y2="82" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
      {/* Animated nodes with glow */}
      <circle cx="30" cy="10" r="4" className="animate-pulse" fill="currentColor" opacity="0.6" style={{ filter: 'url(#glow)' }} />
      <circle cx="90" cy="10" r="4" className="animate-pulse" fill="currentColor" opacity="0.6" style={{ filter: 'url(#glow)' }} />
      <circle cx="30" cy="50" r="4" className="animate-pulse" fill="currentColor" opacity="0.6" style={{ animationDelay: "0.3s", filter: 'url(#glow)' }} />
      <circle cx="90" cy="50" r="4" className="animate-pulse" fill="currentColor" opacity="0.6" style={{ animationDelay: "0.3s", filter: 'url(#glow)' }} />
      <circle cx="30" cy="90" r="4" className="animate-pulse" fill="currentColor" opacity="0.6" style={{ animationDelay: "0.6s", filter: 'url(#glow)' }} />
      <circle cx="90" cy="90" r="4" className="animate-pulse" fill="currentColor" opacity="0.6" style={{ animationDelay: "0.6s", filter: 'url(#glow)' }} />
    </svg>
  );
}

function MolecularStructure() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <defs>
        <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Atoms as circles with glow */}
      <circle cx="35" cy="35" r="10" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ filter: 'url(#glow2)' }} />
      <circle cx="85" cy="30" r="7" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.4s", filter: 'url(#glow2)' }} />
      <circle cx="60" cy="75" r="9" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.8s", filter: 'url(#glow2)' }} />
      <circle cx="90" cy="70" r="6" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "1.2s", filter: 'url(#glow2)' }} />
      <circle cx="25" cy="80" r="5" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.6s", filter: 'url(#glow2)' }} />
      {/* Bonds as lines with pulse */}
      <line x1="35" y1="35" x2="85" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
      <line x1="85" y1="30" x2="60" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
      <line x1="60" y1="75" x2="90" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
      <line x1="60" y1="75" x2="25" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
      <line x1="35" y1="35" x2="25" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.2" className="animate-pulse" style={{ animationDelay: "0.7s" }} />
      <line x1="85" y1="30" x2="90" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.2" className="animate-pulse" style={{ animationDelay: "0.9s" }} />
    </svg>
  );
}

interface TeamCardProps {
  titleKey: string;
  descKey: string;
  badgeKey: string;
  animation: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  index: number;
  isVisible: boolean;
}

function TeamCard({ titleKey, descKey, badgeKey, animation, gradientFrom, gradientTo, index, isVisible }: TeamCardProps) {
  return (
    <div
      className={`
        bg-card rounded-2xl p-6 shadow-sm border border-border overflow-hidden relative group
        transition-all duration-700 ease-out
        hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      `}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Gradient background area */}
      <div
        className="absolute inset-0 rounded-xl transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}15, ${gradientTo}15)`,
        }}
      />

      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" style={{ padding: '2px' }}>
        <div
          className="w-full h-full rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo}, ${gradientFrom})`,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
          }}
        />
      </div>

      {/* Image area with animation */}
      <div className="h-48 sm:h-56 rounded-xl mb-4 relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}20, ${gradientTo}20)`,
            animation: 'gradient-shift 4s ease infinite',
            backgroundSize: '200% 200%',
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 sm:w-32 h-28 sm:h-32 text-orange-600/50 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            {animation}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

        {/* Decorative corner accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-orange-500/30 rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-orange-500/30 rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-orange-500/30 rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-orange-500/30 rounded-br-lg" />
      </div>

      <div className="relative">
        <h3 className="font-bold text-card-foreground text-lg transition-colors group-hover:text-orange-500">{titleKey}</h3>
        <p className="text-muted-foreground text-sm mt-2">{descKey}</p>

        {/* Enhanced badge with gradient border */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(20, 184, 166, 0.1))',
            border: '1px solid rgba(249, 115, 22, 0.3)',
          }}
        >
          {/* Animated pulse indicator */}
          <span className="relative w-2 h-2 rounded-full overflow-hidden">
            <span className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75" />
            <span className="absolute inset-0 bg-orange-500 rounded-full" />
          </span>
          <span className="text-orange-600 dark:text-orange-400">{badgeKey}</span>
        </div>
      </div>
    </div>
  );
}

export function TeamShowcase() {
  const t = useTranslations("home");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-16 sm:py-20 bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-teal-500/5 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <h2
          className={`
            text-xl sm:text-2xl font-bold text-foreground mb-8 text-center font-mono
            transition-all duration-700
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
          `}
        >
          {t("team.title")}
        </h2>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <TeamCard
            titleKey={t("team.professional")}
            descKey={t("team.professionalDesc")}
            badgeKey={t("team.professionalBadge")}
            animation={<DNAHelixAnimation />}
            gradientFrom="#f97316"
            gradientTo="#14b8a6"
            index={0}
            isVisible={isVisible}
          />
          <TeamCard
            titleKey={t("team.innovation")}
            descKey={t("team.innovationDesc")}
            badgeKey={t("team.innovationBadge")}
            animation={<MolecularStructure />}
            gradientFrom="#f97316"
            gradientTo="#f59e0b"
            index={1}
            isVisible={isVisible}
          />
        </div>
      </div>
    </section>
  );
}
