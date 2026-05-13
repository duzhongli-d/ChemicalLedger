import { getTranslations } from "next-intl/server";
import CertsHeroHeader from '@/components/certs/CertsHeroHeader';
import CertificateCard from '@/components/certs/CertificateCard';
import { Footer } from '@/components/home/Footer';

const certificates = [
  {
    name: 'GMP生产许可证',
    fileName: '雅本化学DeepResearch-Feature.pdf',
    fileSize: '962 KB',
    fileType: 'PDF',
    description: 'GMP Manufacturing License',
    icon: 'gmp',
    downloadUrl: '/api/downloads?file=雅本化学DeepResearch-Feature.pdf',
  },
  {
    name: 'ISO 17025认可证书',
    fileName: 'iso-cert.pdf',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    description: 'ISO 17025 Testing Laboratory Accreditation',
    icon: 'iso',
    downloadUrl: '/api/downloads?file=iso-cert.pdf',
  },
  {
    name: '安全生产许可证',
    fileName: 'safety-cert.pdf',
    fileSize: '1.5 MB',
    fileType: 'PDF',
    description: 'Safety Production License',
    icon: 'default',
    downloadUrl: '/api/downloads?file=safety-cert.pdf',
  },
  {
    name: '环境管理体系认证',
    fileName: 'env-cert.pdf',
    fileSize: '892 KB',
    fileType: 'PDF',
    description: 'Environmental Management System Certification',
    icon: 'default',
    downloadUrl: '/api/downloads?file=env-cert.pdf',
  },
];

export default async function CertsPage() {
  const t = await getTranslations("certs");

  return (
    <div className="min-h-screen bg-background">
      <CertsHeroHeader />

      {/* Certificate Grid */}
      <section className="mx-auto max-w-[1320px] px-4 py-16">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
          {t("availableCerts")}
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {certificates.map((cert, index) => (
            <CertificateCard
              key={index}
              name={cert.name}
              fileName={cert.fileName}
              fileSize={cert.fileSize}
              fileType={cert.fileType}
              description={cert.description}
              downloadUrl={cert.downloadUrl}
              icon={cert.icon as "gmp" | "iso" | "glp" | "default"}
              index={index}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}