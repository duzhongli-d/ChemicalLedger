"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ledgerApi, categoryApi, CategoryResponse } from "@/lib/api-client";
import { Header } from "@/components/nav/header";
import { StatCard } from "@/components/layout/StatCard";
import { FilterTabs, FilterTabValue } from "@/components/layout/FilterTabs";
import { SearchCreateBar } from "@/components/layout/SearchCreateBar";
import { LedgerDataTable } from "@/components/layout/LedgerDataTable";
import { Pagination } from "@/components/layout/Pagination";
import { LoginModal } from "@/components/auth/LoginModal";
import { getDaysLeft } from "@/lib/date-utils";
import { useAuthStore } from "@/lib/auth-store";

const PAGE_SIZE = 10;

// Mock trend data for sparklines
const mockTrends = {
  total: [12, 15, 18, 14, 20, 22, 25],
  active: [8, 10, 12, 11, 14, 15, 18],
  expiring10: [1, 2, 1, 2, 1, 1, 1],
  expiring20: [1, 1, 1, 2, 2, 1, 2],
  expired: [0, 0, 1, 0, 0, 0, 0],
  archived: [4, 5, 6, 3, 6, 7, 7],
};

export default function LedgersPage() {
  const t = useTranslations("ledger");
  const tDash = useTranslations("dashboard");
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<FilterTabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const { data: ledgersData, isLoading, isError, error: ledgerError } = useQuery({
    queryKey: ["ledgers"],
    queryFn: () => ledgerApi.list().then((r) => r.data),
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-public"],
    queryFn: () => categoryApi.list().then((r) => r.data as CategoryResponse[]),
  });

  // Group categories by level1 for optgroup display
  const groupedCategories = useMemo(() => {
    const result: Record<string, CategoryResponse[]> = {};
    (categoriesData ?? []).forEach((c: CategoryResponse) => {
      if (!result[c.level1]) result[c.level1] = [];
      result[c.level1].push(c);
    });
    return Object.keys(result).sort().reduce((acc, key) => {
      acc[key] = result[key].sort((a, b) => a.level2.localeCompare(b.level2));
      return acc;
    }, {} as Record<string, CategoryResponse[]>);
  }, [categoriesData]);

  // Filter and compute stats
  const { filteredLedgers, counts } = useMemo(() => {
    const all = Array.isArray(ledgersData) ? ledgersData : [];

    const active = all.filter((l: { status: string }) => l.status === "active");
    const expiring10 = active.filter((l: { effective_expiry_date: string }) => {
      const days = getDaysLeft(l.effective_expiry_date);
      return days <= 10 && days >= 0;
    });
    const expiring20 = active.filter((l: { effective_expiry_date: string }) => {
      const days = getDaysLeft(l.effective_expiry_date);
      return days > 10 && days <= 20;
    });
    const expired = active.filter((l: { effective_expiry_date: string }) => {
      const days = getDaysLeft(l.effective_expiry_date);
      return days < 0;
    });
    const archived = all.filter((l: { status: string }) => l.status === "archived");

    let filtered: typeof all = all;
    switch (activeTab) {
      case "active":
        filtered = active;
        break;
      case "expiring10":
        filtered = expiring10;
        break;
      case "expiring20":
        filtered = expiring20;
        break;
      case "expired":
        filtered = expired;
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

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((l: { category?: { level2?: string } }) => l.category?.level2 === categoryFilter);
    }

    return {
      filteredLedgers: filtered,
      counts: {
        all: all.length,
        active: active.length,
        expiring10: expiring10.length,
        expiring20: expiring20.length,
        expired: expired.length,
        archived: archived.length,
      },
    };
  }, [ledgersData, activeTab, searchQuery, categoryFilter]);

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

  const handleStatCardClick = (tab: FilterTabValue) => {
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

  const handleProtectedAction = () => {
    setLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6 space-y-6">
        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg text-sm">
            {toastMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            title={tDash("totalLedgers")}
            value={counts.all}
            trend={mockTrends.total}
            accentColor="orange"
            variant="clinical"
            onClick={() => handleStatCardClick("all")}
          />
          <StatCard
            title={tDash("activeLedgers")}
            value={counts.active}
            trend={mockTrends.active}
            accentColor="teal"
            variant="clinical"
            onClick={() => handleStatCardClick("active")}
          />
          <StatCard
            title={tDash("expiring10Days")}
            value={counts.expiring10}
            trend={mockTrends.expiring10}
            accentColor="red"
            variant="clinical"
            onClick={() => handleStatCardClick("expiring10")}
          />
          <StatCard
            title={tDash("expiring20Days")}
            value={counts.expiring20}
            trend={mockTrends.expiring20}
            accentColor="amber"
            variant="clinical"
            onClick={() => handleStatCardClick("expiring20")}
          />
          <StatCard
            title={tDash("expiredNotArchived")}
            value={counts.expired}
            trend={mockTrends.expired}
            accentColor="rose"
            variant="clinical"
            onClick={() => handleStatCardClick("expired")}
          />
          <StatCard
            title={tDash("archivedLedgers")}
            value={counts.archived}
            trend={mockTrends.archived}
            accentColor="slate"
            variant="clinical"
            onClick={() => handleStatCardClick("archived")}
          />
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={counts}
        />

        {/* Search Bar with Category Filter */}
        <SearchCreateBar
          searchValue={searchQuery}
          onSearchChange={(v) => {
            setSearchQuery(v);
            setCurrentPage(1);
          }}
          isLoggedIn={isAuthenticated()}
          onProtectedAction={handleProtectedAction}
          rightContent={
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground font-mono-custom focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all min-w-[200px]"
            >
              <option value="">全部品类</option>
              {Object.entries(groupedCategories).map(([level1, cats]) => (
                <optgroup key={level1} label={level1}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.level2}>{c.level2}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          }
        />

        {/* Data Table */}
        <LedgerDataTable
          ledgers={paginatedLedgers}
          isLoading={isLoading}
          error={isError ? ledgerError : null}
          onArchive={handleArchive}
          isLoggedIn={isAuthenticated()}
          onProtectedAction={handleProtectedAction}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
          setToastMessage(t("clickAgain"));
        }}
      />
    </div>
  );
}