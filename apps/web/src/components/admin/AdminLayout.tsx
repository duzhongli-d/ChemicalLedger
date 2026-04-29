"use client";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAdmin } = useAuthStore();

  if (!isAdmin()) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
