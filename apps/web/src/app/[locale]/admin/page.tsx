"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export default function AdminIndexPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // If admin is logged in, redirect to dashboard
    // Otherwise redirect to admin login
    if (user?.role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [user, router]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">正在跳转...</p>
      </div>
    </div>
  );
}
