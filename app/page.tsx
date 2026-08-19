"use client";

import { useEffect, useMemo, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { FileText, CalendarDays, IndianRupee, Receipt, AlertCircle } from "lucide-react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardStatCard from "./components/dashboard/DashboardStatCard";
import RecentInvoices from "./components/dashboard/RecentInvoices";
import type { Invoice } from "./invoices/types";
import { formatCurrency, formatDate } from "./invoices/utils";

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Request failed");
      const data: Invoice[] = await res.json();
      setInvoices(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const stats = useMemo(() => {
    const totalInvoices = invoices.length;

    const now = new Date();
    const thisMonthCount = invoices.filter((invoice) => {
      const d = new Date(invoice.invoiceDate);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const totalValue = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.grandTotal),
      0
    );

    const latest = [...invoices].sort(
      (a, b) =>
        new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    )[0];

    const recent = [...invoices]
      .sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      )
      .slice(0, 5);

    return { totalInvoices, thisMonthCount, totalValue, latest, recent };
  }, [invoices]);

  return (
    <div className="min-h-full flex-1 bg-zinc-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />

        {loading && <StatsSkeleton />}

        {!loading && error && (
          <div className="mt-8">
            <ErrorState onRetry={fetchInvoices} />
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardStatCard
                label="Total Invoices"
                value={String(stats.totalInvoices)}
                icon={FileText}
              />
              <DashboardStatCard
                label="This Month"
                value={String(stats.thisMonthCount)}
                icon={CalendarDays}
              />
              <DashboardStatCard
                label="Total Invoice Value"
                value={formatCurrency(stats.totalValue)}
                icon={IndianRupee}
              />
              <DashboardStatCard
                label="Latest Invoice"
                value={stats.latest ? stats.latest.invoiceNumber : "-"}
                subvalue={
                  stats.latest
                    ? `${formatDate(stats.latest.invoiceDate)} · ${formatCurrency(
                        stats.latest.grandTotal
                      )}`
                    : undefined
                }
                icon={Receipt}
              />
            </div>

            <RecentInvoices invoices={stats.recent} />
          </>
        )}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={32} />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-16 text-center">
      <AlertCircle size={28} className="text-red-500" />
      <p className="text-base font-medium text-zinc-900">
        Unable to load dashboard data.
      </p>
      <button
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
      >
        Retry
      </button>
    </div>
  );
}
