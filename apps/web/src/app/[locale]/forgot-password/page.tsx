"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { authApi } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError(t("forgotPasswordError"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md p-8">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t("checkYourEmail")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {t("forgotPasswordInstructions")}
          </p>
          <p className="mt-4 text-sm text-slate-400">
            <Link href="/login" className="text-orange-500 hover:underline">
              {t("backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">
          {t("forgotPasswordTitle")}
        </h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
          {t("forgotPasswordHint")}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email")}
              className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 disabled:opacity-50"
          >
            {loading ? t("sending") : t("sendResetLink")}
          </button>
          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="text-orange-500 hover:underline">
              {t("backToLogin")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}