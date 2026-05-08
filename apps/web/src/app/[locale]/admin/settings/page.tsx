"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api-client";

type SMTPConfig = {
  enabled?: boolean;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  sender_email?: string;
  sender_name?: string;
  use_tls?: boolean;
};

type ContactConfig = {
  address?: string;
  phone?: string;
  email?: string;
  wechat?: string;
  business_hours?: string;
};

type SystemSettings = {
  smtp: SMTPConfig;
  contact: ContactConfig;
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<"contact" | "smtp">("contact");
  const [saveMsg, setSaveMsg] = useState("");

  const [contactForm, setContactForm] = useState<ContactConfig>({
    address: "",
    phone: "",
    email: "",
    wechat: "",
    business_hours: "",
  });

  const [smtpForm, setSmtpForm] = useState<SMTPConfig>({
    enabled: false,
    host: "",
    port: 587,
    username: "",
    password: "",
    sender_email: "",
    sender_name: "",
    use_tls: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () =>
      api.get<SystemSettings>("/admin/settings/").then((r) => r.data),
  });

  useEffect(() => {
    if (settings) {
      if (settings.contact) {
        setContactForm({
          address: settings.contact.address || "",
          phone: settings.contact.phone || "",
          email: settings.contact.email || "",
          wechat: settings.contact.wechat || "",
          business_hours: settings.contact.business_hours || "",
        });
      }
      if (settings.smtp) {
        setSmtpForm({
          enabled: settings.smtp.enabled || false,
          host: settings.smtp.host || "",
          port: settings.smtp.port || 587,
          username: settings.smtp.username || "",
          password: settings.smtp.password || "",
          sender_email: settings.smtp.sender_email || "",
          sender_name: settings.smtp.sender_name || "",
          use_tls: settings.smtp.use_tls ?? true,
        });
      }
    }
  }, [settings]);

  const contactMutation = useMutation({
    mutationFn: (data: ContactConfig) =>
      api.patch("/admin/settings/contact", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaveMsg("contact-success");
      setTimeout(() => setSaveMsg(""), 3000);
    },
    onError: () => {
      setSaveMsg("contact-error");
      setTimeout(() => setSaveMsg(""), 5000);
    },
  });

  const smtpMutation = useMutation({
    mutationFn: (data: SMTPConfig) =>
      api.patch("/admin/settings/smtp", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaveMsg("smtp-success");
      setTimeout(() => setSaveMsg(""), 3000);
    },
    onError: () => {
      setSaveMsg("smtp-error");
      setTimeout(() => setSaveMsg(""), 5000);
    },
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };

  const handleSmtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    smtpMutation.mutate(smtpForm);
  };

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-body-custom { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .card-enter { animation: cardEnter 0.5s ease-out forwards; opacity: 0; }
        .header-slide { animation: headerSlideIn 0.4s ease-out forwards; }
      `}</style>

      <div className="space-y-6 font-body-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 header-slide">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
              {t("settings.title")}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
              <span className="text-xs text-slate-500 font-mono-custom">SYSTEM SETTINGS</span>
            </div>
          </div>
        </div>

        {/* Save message */}
        {saveMsg && (
          <div
            className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
              saveMsg.includes("success")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {saveMsg.includes("success") ? t("settings.saveSuccess") : t("settings.saveFailed")}
          </div>
        )}

        {/* Tabs */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-6 py-2.5 text-sm font-medium font-mono-custom transition-colors ${
              activeTab === "contact"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t("settings.contact")}
          </button>
          <button
            onClick={() => setActiveTab("smtp")}
            className={`px-6 py-2.5 text-sm font-medium font-mono-custom transition-colors ${
              activeTab === "smtp"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t("settings.smtp")}
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            <p className="text-sm text-slate-500">{t("common.loading")}</p>
          </div>
        )}

        {/* Contact Tab */}
        {!isLoading && activeTab === "contact" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden card-enter">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900 font-mono-custom">{t("settings.contactInfoConfig")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t("settings.contactInfoDesc")}</p>
            </div>
            <form onSubmit={handleContactSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.address")}</label>
                  <input
                    type="text"
                    value={contactForm.address || ""}
                    onChange={(e) => setContactForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder={t("settings.addressPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.phone")}</label>
                  <input
                    type="text"
                    value={contactForm.phone || ""}
                    onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder={t("settings.phonePlaceholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.email")}</label>
                  <input
                    type="email"
                    value={contactForm.email || ""}
                    onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder={t("settings.emailPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.wechat")}</label>
                  <input
                    type="text"
                    value={contactForm.wechat || ""}
                    onChange={(e) => setContactForm((f) => ({ ...f, wechat: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder={t("settings.wechatPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.businessHours")}</label>
                <input
                  type="text"
                  value={contactForm.business_hours || ""}
                  onChange={(e) => setContactForm((f) => ({ ...f, business_hours: e.target.value }))}
                  className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={t("settings.businessHoursPlaceholder")}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono-custom"
                >
                  {contactMutation.isPending ? t("common.loading") : t("settings.saveContact")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SMTP Tab */}
        {!isLoading && activeTab === "smtp" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden card-enter">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900 font-mono-custom">{t("settings.smtpConfig")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t("settings.smtpConfigDesc")}</p>
            </div>
            <form onSubmit={handleSmtpSubmit} className="p-6 space-y-5">
              {/* Enabled switch */}
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-mono-custom">{t("settings.enabled")}</label>
                  <p className="text-xs text-slate-500 mt-0.5">{t("settings.enabledDesc")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmtpForm((f) => ({ ...f, enabled: !f.enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    smtpForm.enabled ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      smtpForm.enabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.host")}</label>
                  <input
                    type="text"
                    value={smtpForm.host || ""}
                    onChange={(e) => setSmtpForm((f) => ({ ...f, host: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="smtp.example.com"
                    disabled={!smtpForm.enabled}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.port")}</label>
                  <input
                    type="number"
                    value={smtpForm.port || ""}
                    onChange={(e) => setSmtpForm((f) => ({ ...f, port: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="587"
                    disabled={!smtpForm.enabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.username")}</label>
                  <input
                    type="text"
                    value={smtpForm.username || ""}
                    onChange={(e) => setSmtpForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="用户名或邮箱"
                    disabled={!smtpForm.enabled}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.password")}</label>
                  <input
                    type="password"
                    value={smtpForm.password || ""}
                    onChange={(e) => setSmtpForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="密码（不显示）"
                    disabled={!smtpForm.enabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.senderEmail")}</label>
                  <input
                    type="email"
                    value={smtpForm.sender_email || ""}
                    onChange={(e) => setSmtpForm((f) => ({ ...f, sender_email: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="noreply@example.com"
                    disabled={!smtpForm.enabled}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">{t("settings.senderName")}</label>
                  <input
                    type="text"
                    value={smtpForm.sender_name || ""}
                    onChange={(e) => setSmtpForm((f) => ({ ...f, sender_name: e.target.value }))}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="OFUBEST"
                    disabled={!smtpForm.enabled}
                  />
                </div>
              </div>

              {/* TLS switch */}
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-mono-custom">{t("settings.useTls")}</label>
                  <p className="text-xs text-slate-500 mt-0.5">{t("settings.tlsDesc")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmtpForm((f) => ({ ...f, use_tls: !f.use_tls }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    smtpForm.use_tls ? "bg-blue-600" : "bg-slate-300"
                  }`}
                  disabled={!smtpForm.enabled}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      smtpForm.use_tls ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={smtpMutation.isPending}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono-custom"
                >
                  {smtpMutation.isPending ? t("common.loading") : t("settings.saveSmtp")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
