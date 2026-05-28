"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

type LoginMode = "email" | "username";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const { setAuth, isAdmin } = useAuthStore();
  const [loginMode, setLoginMode] = useState<LoginMode>("email");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = loginMode === "email"
        ? { email: form.email, password: form.password }
        : { username: form.username, password: form.password };
      const { data } = await authApi.login(payload);
      // Set cookie manually since backend Set-Cookie header is stripped by nginx
      // Secure + SameSite=None for cross-origin HTTPS
      document.cookie = `access_token=${data.access_token}; path=/; max-age=${60*60*24*7}; Secure; SameSite=None`;
      setAuth(data.user);
      if (isAdmin()) {
        router.push(`/${locale}/admin/categories`);
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/15 via-teal-600/10 to-transparent rounded-full blur-[100px]" />
        </div>

        {/* Dot grid pattern */}
        <div className="absolute inset-0 bg-dot-grid opacity-30" />

        {/* Animated horizontal data flow lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"
              style={{
                top: `${20 + i * 15}%`,
                width: "200%",
                left: "-100%",
                animation: `flow-data ${3 + i * 0.5}s linear infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Chromatogram SVG */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-72">
          <svg viewBox="0 0 400 250" className="w-full h-full">
            <defs>
              <linearGradient id="peakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(249,115,22,0.8)" />
                <stop offset="100%" stopColor="rgba(249,115,22,0)" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(249,115,22,0.3)" />
                <stop offset="50%" stopColor="rgba(249,115,22,0.8)" />
                <stop offset="100%" stopColor="rgba(20,184,166,0.6)" />
              </linearGradient>
            </defs>

            {/* Baseline */}
            <line x1="30" y1="220" x2="370" y2="220" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />

            {/* Grid lines */}
            {[55, 110, 165].map((y) => (
              <line key={y} x1="30" y1={y} x2="370" y2={y} stroke="rgba(249,115,22,0.1)" strokeWidth="0.5" strokeDasharray="4 4" />
            ))}

            {/* Main chromatogram peaks */}
            <path
              d="M 50 220 Q 70 220 85 200 Q 100 140 120 220"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-draw-line"
            />
            <path
              d="M 130 220 Q 150 220 165 180 Q 180 80 195 220"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-draw-line"
              style={{ animationDelay: '200ms' }}
            />
            <path
              d="M 205 220 Q 225 220 240 160 Q 255 40 270 220"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              className="animate-draw-line"
              style={{ animationDelay: '400ms' }}
            />
            <path
              d="M 280 220 Q 300 220 315 190 Q 330 130 345 220"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-draw-line"
              style={{ animationDelay: '600ms' }}
            />

            {/* Filled peaks */}
            <path
              d="M 205 220 Q 225 220 240 160 Q 255 40 270 220 L 270 220 L 205 220 Z"
              fill="url(#peakGradient)"
              className="animate-pulse-node"
              style={{ animationDelay: '500ms' }}
            />

            {/* Data point nodes */}
            <circle cx="120" cy="220" r="4" className="fill-orange-500 animate-pulse-node" style={{ animationDelay: '100ms' }} />
            <circle cx="195" cy="220" r="5" className="fill-orange-500 animate-pulse-node" style={{ animationDelay: '300ms' }} />
            <circle cx="270" cy="40" r="8" className="fill-orange-400 animate-pulse-node" style={{ animationDelay: '500ms' }} />
            <circle cx="345" cy="220" r="4" className="fill-teal-500 animate-pulse-node" style={{ animationDelay: '700ms' }} />

            {/* Glow effect on main peak */}
            <circle cx="270" cy="40" r="20" className="fill-none stroke-orange-300/40" strokeWidth="2">
              <animate attributeName="r" values="20;35;20" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Brand content */}
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Abachem QC</h2>
          <p className="text-orange-400 font-mono text-sm">Precision Driven, Intelligence Empowered</p>
          <p className="text-slate-400 text-sm mt-1">精准驱动，智领未来</p>
        </div>

        {/* Floating molecular decorations */}
        <div className="absolute top-1/4 right-8 opacity-20 animate-float">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-teal-400">
            <circle cx="30" cy="30" r="8" fill="currentColor" />
            <circle cx="10" cy="10" r="5" fill="currentColor" />
            <circle cx="50" cy="10" r="5" fill="currentColor" />
            <circle cx="10" cy="50" r="5" fill="currentColor" />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
            <line x1="30" y1="30" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
            <line x1="30" y1="30" x2="50" y2="10" stroke="currentColor" strokeWidth="2" />
            <line x1="30" y1="30" x2="10" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="30" y1="30" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute top-1/3 left-8 opacity-15 animate-float" style={{ animationDelay: '1s' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" className="text-orange-400">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-3/5 flex items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Abachem QC</h1>
            <p className="text-orange-500 font-mono text-sm">Precision Driven</p>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("loginTitle")}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {loginMode === "email" ? t("loginWithEmail") : t("loginWithUsername")}
            </p>
          </div>

          {/* Login mode toggle */}
          <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
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

          {/* Admin contact hint */}
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {t("contactAdminForAccount")}
          </p>

          {/* Form */}
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
              <Link href="/forgot-password" className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit button */}
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
                    <span>登录中...</span>
                  </>
                ) : (
                  t("login")
                )}
              </span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
