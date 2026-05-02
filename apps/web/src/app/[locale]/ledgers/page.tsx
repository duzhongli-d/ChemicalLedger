"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ledgerApi } from "@/lib/api-client";
import { LedgersTopBar } from "@/components/layout/LedgersTopBar";
import { LoginModal } from "@/components/auth/LoginModal";
import { StatCard } from "@/components/layout/StatCard";
import { FilterTabs, FilterTabValue } from "@/components/layout/FilterTabs";
import { SearchCreateBar } from "@/components/layout/SearchCreateBar";
import { LedgerDataTable } from "@/components/layout/LedgerDataTable";
import { Pagination } from "@/components/layout/Pagination";
import { getDaysLeft } from "@/lib/date-utils";

const PAGE_SIZE = 10;

// Mock trend data for sparklines
const mockTrends = {
  total: [12, 15, 18, 14, 20, 22, 25],
  active: [8, 10, 12, 11, 14, 15, 18],
  expiring: [2, 3, 2, 4, 3, 2, 3],
  archived: [4, 5, 6, 3, 6, 7, 7],
};

export default function LedgersPage() {
  const t = useTranslations("ledger");
  const tDash = useTranslations("dashboard");
  const queryClient = useQueryClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUsername(data.username);
      }
    } catch {
      // Not logged in
    }
  };

  const handleLoginSuccess = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } finally {
      setIsLoggedIn(false);
      setUsername("");
    }
  };

  const { data: ledgersData, isLoading } = useQuery({
    queryKey: ["ledgers"],
    queryFn: () => ledgerApi.list().then((r) => r.data),
  });

  // Filter and compute stats
  const { filteredLedgers, counts } = useMemo(() => {
    const all = Array.isArray(ledgersData) ? ledgersData : [];

    const active = all.filter((l: { status: string }) => l.status === "active");
    const expiring = active.filter((l: { effective_expiry_date: string }) => {
      const days = getDaysLeft(l.effective_expiry_date);
      return days <= 30 && days >= 0;
    });
    const archived = all.filter((l: { status: string }) => l.status === "archived");

    let filtered: typeof all = all;
    switch (activeTab) {
      case "active":
        filtered = active;
        break;
      case "expiring":
        filtered = expiring;
        break;
      case "archived":
        filtered = archived;
        break;
    }

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l: { product_name?: string; batch_no?: string; internal_batch_no?: string }) =>
          l.product_name?.toLowerCase().includes(q) ||
          l.batch_no?.toLowerCase().includes(q) ||
          l.internal_batch_no?.toLowerCase().includes(q)
      );
    }

    return {
      filteredLedgers: filtered,
      counts: {
        all: all.length,
        active: active.length,
        expiring: expiring.length,
        archived: archived.length,
      },
    };
  }, [ledgersData, activeTab, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredLedgers.length / PAGE_SIZE);
  const paginatedLedgers = filteredLedgers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: FilterTabValue) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleArchive = async (id: string) => {
    if (window.confirm(t("confirmArchive"))) {
      try {
        await ledgerApi.update(id, { status: "archived" });
        queryClient.invalidateQueries({ queryKey: ["ledgers"] });
      } catch (error) {
        console.error("Archive failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <LedgersTopBar
        isLoggedIn={isLoggedIn}
        username={username}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      <main className="pt-16 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={tDash("totalLedgers")}
            value={counts.all}
            trend={mockTrends.total}
            accentColor="orange"
          />
          <StatCard
            title={tDash("activeLedgers")}
            value={counts.active}
            trend={mockTrends.active}
            accentColor="teal"
          />
          <StatCard
            title={tDash("expiringSoon")}
            value={counts.expiring}
            trend={mockTrends.expiring}
            accentColor="amber"
          />
          <StatCard
            title={tDash("archivedLedgers")}
            value={counts.archived}
            trend={mockTrends.archived}
            accentColor="slate"
          />
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={counts}
        />

        {/* Search Bar */}
        <SearchCreateBar
          searchValue={searchQuery}
          onSearchChange={(v) => {
            setSearchQuery(v);
            setCurrentPage(1);
          }}
          isLoggedIn={isLoggedIn}
          onProtectedAction={() => setShowLoginModal(true)}
        />

        {/* Data Table */}
        <LedgerDataTable
          ledgers={paginatedLedgers}
          isLoading={isLoading}
          onArchive={handleArchive}
          isLoggedIn={isLoggedIn}
          onProtectedAction={() => setShowLoginModal(true)}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLedgers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
