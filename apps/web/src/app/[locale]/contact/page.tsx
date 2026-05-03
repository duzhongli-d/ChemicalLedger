import { ContactInfoCards } from "@/components/contact/ContactInfoCards";
import { ContactForm } from "@/components/contact/ContactForm";
import { QuickInfoPanel } from "@/components/contact/QuickInfoPanel";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border-b border-orange-500/10">
        <div className="max-w-[1320px] mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            联系我们
          </h1>
          <p className="text-muted-foreground">
            QC技术支持与商务咨询
          </p>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 py-8 space-y-8">
        {/* Info Cards */}
        <ContactInfoCards />

        {/* Form + Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <div>
            <QuickInfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
