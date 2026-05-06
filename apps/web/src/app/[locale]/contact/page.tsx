import { ContactInfoCards } from "@/components/contact/ContactInfoCards";
import { ContactForm } from "@/components/contact/ContactForm";
import { QuickInfoPanel } from "@/components/contact/QuickInfoPanel";
import ContactHeroHeader from "@/components/contact/ContactHeroHeader";
import { Footer } from "@/components/home/Footer";

export default function ContactPage() {
  return (
    <main>
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        {/* Hero */}
        <ContactHeroHeader />

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
      <Footer />
    </main>
  );
}