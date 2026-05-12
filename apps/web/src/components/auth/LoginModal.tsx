"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  // Optional: redirect after login success
  redirectTo?: string;
  // Optional: contextual message shown when modal is triggered by feature gate
  contextMessage?: string;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, redirectTo, contextMessage }: LoginModalProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const { setAuth, isAdmin } = useAuthStore();

  const [loginMode, setLoginMode] = useState<"email" | "username">("email");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = loginMode === "email"
        ? { email: form.email, password: form.password }
        : { username: form.username, password: form.password };
      const { data } = await authApi.login(payload);
      setAuth(data.user);
      // Notify parent component
      onLoginSuccess(data.user.username || data.user.email || "");
      // Redirect based on user role
      if (data.user.role === "admin") {
        router.push(`/${locale}/admin/dashboard`);
      } else {
        router.push("/");
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 cursor-pointer"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label={t("close")}
      />

      {/* Modal Card - slate background */}
      <div
        className="relative bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("loginTitle")}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {loginMode === "email" ? t("loginWithEmail") : t("loginWithUsername")}
          </p>
        </div>

        {/* Context message banner - shown when modal is triggered by feature gate */}
        {contextMessage && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-800 dark:text-amber-200">{contextMessage}</p>
            </div>
          </div>
        )}

        {/* Login mode toggle - pill style */}
        <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => setLoginMode("email")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              loginMode === "email"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("email")}
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("username")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              loginMode === "username"
                ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("username")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity input - switches between email and username */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {loginMode === "email" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                )}
              </svg>
            </div>
            <input
              type={loginMode === "email" ? "email" : "text"}
              required
              value={loginMode === "email" ? form.email : form.username}
              onChange={(e) =>
                setForm(loginMode === "email"
                  ? { ...form, email: e.target.value }
                  : { ...form, username: e.target.value }
                )
              }
              placeholder={loginMode === "email" ? t("email") : t("username")}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
            />
            {/* Glow effect on focus */}
            <div className="absolute inset-0 rounded-xl opacity-0 focus-within:opacity-100 pointer-events-none transition-opacity duration-200" style={{ boxShadow: '0 0 20px rgba(249,115,22,0.15)' }} />
          </div>

          {/* Password input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("password")}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
            />
            <div className="absolute inset-0 rounded-xl opacity-0 focus-within:opacity-100 pointer-events-none transition-opacity duration-200" style={{ boxShadow: '0 0 20px rgba(249,115,22,0.15)' }} />
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-orange-500 focus:ring-orange-500/50 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {t("rememberMe")}
              </span>
            </label>
            <a href="#" className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
              {t("forgotPassword")}
            </a>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit button - gradient with shimmer */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3.5 px-4 rounded-xl font-medium text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
          >
            {/* Gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700" />

            {/* Shine effect */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />

            {/* Glow on hover */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 30px rgba(249,115,22,0.5), 0 0 60px rgba(249,115,22,0.3)' }} />

            {/* Button text */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t("loggingIn")}</span>
                </>
              ) : (
                t("login")
              )}
            </span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {t("contactAdminForAccount")}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
