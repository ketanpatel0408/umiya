"use client";

import { useEffect, useMemo, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { FileText, CalendarDays, IndianRupee, Receipt, AlertCircle, Building2 } from "lucide-react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardStatCard from "./components/dashboard/DashboardStatCard";
import RecentInvoices from "./components/dashboard/RecentInvoices";
import { Card, CardHeader, PageContainer, btnSecondary, initials } from "./components/ui";
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

    const byBuyer = new Map<string, { name: string; total: number; count: number }>();
    for (const invoice of invoices) {
      const key = invoice.buyerName.trim().toLowerCase();
      const entry = byBuyer.get(key) ?? { name: invoice.buyerName, total: 0, count: 0 };
      entry.total += Number(invoice.grandTotal);
      entry.count += 1;
      byBuyer.set(key, entry);
    }
    const topBuyers = [...byBuyer.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { totalInvoices, thisMonthCount, totalValue, latest, recent, topBuyers };
  }, [invoices]);

  return (
    <PageContainer>
        <DashboardHeader />

        {loading && <StatsSkeleton />}

        {!loading && error && (
          <div className="mt-6">
            <ErrorState onRetry={fetchInvoices} />
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardStatCard
                label="Total Invoices"
                value={String(stats.totalInvoices)}
                icon={FileText}
                accent="indigo"
              />
              <DashboardStatCard
                label="This Month"
                value={String(stats.thisMonthCount)}
                icon={CalendarDays}
                accent="sky"
              />
              <DashboardStatCard
                label="Total Invoice Value"
                value={formatCurrency(stats.totalValue)}
                icon={IndianRupee}
                accent="emerald"
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
                accent="amber"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <RecentInvoices invoices={stats.recent} />
              </div>
              <TopCustomers buyers={stats.topBuyers} />
            </div>
          </>
        )}
    </PageContainer>
  );
}

function TopCustomers({
  buyers,
}: {
  buyers: { name: string; total: number; count: number }[];
}) {
  const max = buyers[0]?.total || 1;
  return (
    <Card className="self-start">
      <CardHeader
        title="Top Customers"
        description="By total invoice value"
        icon={Building2}
      />
      {buyers.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">
          No customers yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {buyers.map((b) => (
            <li key={b.name} className="px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                  {initials(b.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{b.name}</p>
                    <p className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(b.total)}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.max(4, (b.total / max) * 100)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-500">
                      {b.count} {b.count === 1 ? "invoice" : "invoices"}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={32} />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-16 text-center shadow-sm">
      <AlertCircle size={28} className="text-red-500" />
      <p className="text-base font-medium text-slate-900">
        Unable to load dashboard data.
      </p>
      <button
        onClick={onRetry}
        className={`${btnSecondary} mt-1`}
      >
        Retry
      </button>
    </div>
  );
}
