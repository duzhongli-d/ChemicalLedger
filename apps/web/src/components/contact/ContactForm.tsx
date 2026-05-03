"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { contactApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

const CATEGORIES = ["support", "technical", "feature", "business", "other"] as const;
type Category = (typeof CATEGORIES)[number];

export function ContactForm() {
  const t = useTranslations("contact");
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    name: user?.username || "",
    email: user?.email || "",
    subject: "",
    category: "" as Category | "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const mutation = useMutation({
    mutationFn: (data: typeof form) => contactApi.submit(data),
    onSuccess: () => {
      setStatus("success");
      setForm({ name: user?.username || "", email: user?.email || "", subject: "", category: "", message: "" });
    },
    onError: () => {
      setStatus("error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.category || form.message.length < 10) {
      setStatus("error");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <h3 className="font-semibold text-foreground mb-6">{t("form.submit")}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("form.name")} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("form.email")} *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("form.subject")} *
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder={t("form.subjectPlaceholder")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("form.category")} *
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            required
          >
            <option value="">--</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`form.category${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("form.message")} *
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder={t("form.messagePlaceholder")}
            rows={5}
            minLength={10}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {form.message.length}/10 min
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? t("form.submitting") : t("form.submit")}
        </button>

        {/* Status messages */}
        {status === "success" && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-lg p-3">
            {t("form.success")}
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg p-3">
            {t("form.error")}
          </div>
        )}
      </form>
    </div>
  );
}