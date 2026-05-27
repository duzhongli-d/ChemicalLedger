'use client';

import { useTranslations } from 'next-intl';

// Hero 头部区域，展示页面标题
export default function CertsHeroHeader() {
  const t = useTranslations('certs');

  return (
    <section className="bg-gradient-to-b from-primary/10 to-background py-16">
      <div className="mx-auto max-w-[1320px] px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}