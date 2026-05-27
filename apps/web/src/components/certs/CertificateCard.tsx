'use client';

import { useTranslations } from 'next-intl';

interface CertificateCardProps {
  name: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  description: string;
  downloadUrl: string;
  icon: 'gmp' | 'iso' | 'glp' | 'default';
  index: number;
}

const iconMap = {
  gmp: '🏭',
  iso: '📋',
  glp: '🔬',
  default: '📄',
};

export default function CertificateCard({
  name,
  fileSize,
  fileType,
  description,
  downloadUrl,
  icon,
}: CertificateCardProps) {
  const t = useTranslations('certs');

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{iconMap[icon]}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span>{fileType}</span>
            <span>{fileSize}</span>
          </div>
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            download
          >
            {t("downloadPdf")}
          </a>
        </div>
      </div>
    </div>
  );
}