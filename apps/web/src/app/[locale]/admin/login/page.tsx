"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

type LoginMode = "email" | "username";

export default function AdminLoginPage() {
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

      // Check if user has admin role
      if (data.user.role !== "admin") {
        setError("无权限访问");
        return;
      }

      // Set cookie manually since backend Set-Cookie header is stripped by nginx
      // Secure + SameSite=None for cross-origin HTTPS
      const token = encodeURIComponent(data.access_token);
      document.cookie = `access_token=${token}; path=/; max-age=${60*60*24*7}; Secure; SameSite=None`;
      console.log("DEBUG: Cookie set, now:", document.cookie);
      setAuth(data.user);
      router.push(`/${locale}/admin/dashboard`);
    } catch (err: unknown) {
      // Handle Axios error response
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        const detail = axiosError.response?.data?.detail;
        if (detail) {
          setError(detail);
          return;
        }
      }
      setError("登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-slate-600/15 via-slate-700/10 to-transparent rounded-full blur-[100px]" />
        </div>

        {/* Dot grid pattern */}
        <div className="absolute inset-0 bg-dot-grid opacity-30" />

        {/* Animated horizontal data flow lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
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

        {/* QC icon/molecule decoration */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-72">
          <svg viewBox="0 0 400 250" className="w-full h-full">
            <defs>
              <linearGradient id="adminPeakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.8)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
              </linearGradient>
              <linearGradient id="adminLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                <stop offset="50%" stopColor="rgba(59,130,246,0.8)" />
                <stop offset="100%" stopColor="rgba(100,116,139,0.6)" />
              </linearGradient>
            </defs>

            {/* Baseline */}
            <line x1="30" y1="220" x2="370" y2="220" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />

            {/* Grid lines */}
            {[55, 110, 165].map((y) => (
              <line key={y} x1="30" y1={y} x2="370" y2={y} stroke="rgba(59,130,246,0.1)" strokeWidth="0.5" strokeDasharray="4 4" />
            ))}

            {/* Main chromatogram peaks */}
            <path
              d="M 50 220 Q 70 220 85 200 Q 100 140 120 220"
              fill="none"
              stroke="url(#adminLineGradient)"
              strokeWidth="2"
              className="animate-draw-line"
            />
            <path
              d="M 130 220 Q 150 220 165 180 Q 180 80 195 220"
              fill="none"
              stroke="url(#adminLineGradient)"
              strokeWidth="2"
              className="animate-draw-line"
              style={{ animationDelay: '200ms' }}
            />
            <path
              d="M 205 220 Q 225 220 240 160 Q 255 40 270 220"
              fill="none"
              stroke="url(#adminLineGradient)"
              strokeWidth="3"
              className="animate-draw-line"
              style={{ animationDelay: '400ms' }}
            />
            <path
              d="M 280 220 Q 300 220 315 190 Q 330 130 345 220"
              fill="none"
              stroke="url(#adminLineGradient)"
              strokeWidth="2"
              className="animate-draw-line"
              style={{ animationDelay: '600ms' }}
            />

            {/* Filled peaks */}
            <path
              d="M 205 220 Q 225 220 240 160 Q 255 40 270 220 L 270 220 L 205 220 Z"
              fill="url(#adminPeakGradient)"
              className="animate-pulse-node"
              style={{ animationDelay: '500ms' }}
            />

            {/* Data point nodes */}
            <circle cx="120" cy="220" r="4" className="fill-blue-500 animate-pulse-node" style={{ animationDelay: '100ms' }} />
            <circle cx="195" cy="220" r="5" className="fill-blue-500 animate-pulse-node" style={{ animationDelay: '300ms' }} />
            <circle cx="270" cy="40" r="8" className="fill-blue-400 animate-pulse-node" style={{ animationDelay: '500ms' }} />
            <circle cx="345" cy="220" r="4" className="fill-slate-500 animate-pulse-node" style={{ animationDelay: '700ms' }} />

            {/* Glow effect on main peak */}
            <circle cx="270" cy="40" r="20" className="fill-none stroke-blue-300/40" strokeWidth="2">
              <animate attributeName="r" values="20;35;20" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Brand content */}
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <h2 className="text-3xl font-bold text-white mb-2">QC管理后台</h2>
          <p className="text-blue-400 font-mono text-sm">Admin Dashboard</p>
          <p className="text-slate-400 text-sm mt-1">雅本化学 QC Department</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-3/5 flex items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">QC管理后台</h1>
            <p className="text-blue-500 font-mono text-sm">Admin Dashboard</p>
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
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
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
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t("username")}
            </button>
          </div>

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
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
              {/* Glow effect on focus */}
              <div className="absolute inset-0 rounded-xl opacity-0 focus-within:opacity-100 pointer-events-none transition-opacity duration-200" style={{ boxShadow: '0 0 20px rgba(59,130,246,0.15)' }} />
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
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
              <div className="absolute inset-0 rounded-xl opacity-0 focus-within:opacity-100 pointer-events-none transition-opacity duration-200" style={{ boxShadow: '0 0 20px rgba(59,130,246,0.15)' }} />
            </div>

            {/* Remember me & forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {t("rememberMe")}
                </span>
              </label>
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                {t("forgotPassword")}
              </a>
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
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800" />

              {/* Shine effect */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  animation: 'shimmer 2s ease-in-out infinite',
                }}
              />

              {/* Glow on hover */}
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.3)' }} />

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

          {/* Back to user login */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t("backToUserLogin")}{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              {t("clickHere")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
