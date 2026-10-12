"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import { Plus, Eye, Pencil, Search, AlertCircle, FileSearch } from "lucide-react";
import type { Invoice } from "./types";
import { formatCurrency, formatDate } from "./utils";
import {
  Card,
  PageContainer,
  PageHeader,
  StatusBadge,
  btnPrimary,
  btnSecondary,
  iconBtn,
  inputBase,
  tableHead,
} from "../components/ui";
import { FINANCIAL_YEARS } from "./create/formHelpers";
import InvoiceDownloadButton from "./InvoiceDownloadButton";

type Status = "ALL" | "DRAFT" | "ISSUED" | "CANCELLED";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "ISSUED", label: "Issued" },
  { value: "CANCELLED", label: "Cancelled" },
];

const FY_FILTER_OPTIONS = ["ALL", ...FINANCIAL_YEARS] as const;
type FyFilter = (typeof FY_FILTER_OPTIONS)[number];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("ALL");
  const [financialYear, setFinancialYear] = useState<FyFilter>("ALL");

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

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesStatus = status === "ALL" || invoice.status === status;
      const matchesFY =
        financialYear === "ALL" || invoice.financialYear === financialYear;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.buyerName.toLowerCase().includes(term);
      return matchesStatus && matchesFY && matchesSearch;
    });
  }, [invoices, search, status, financialYear]);

  const filteredTotal = filteredInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal),
    0
  );

  return (
    <PageContainer>
      <PageHeader
        title="GST Invoices"
        subtitle="View and manage previously generated GST invoices."
        actions={
          <Link href="/invoices/create" className={btnPrimary}>
            <Plus size={16} />
            Create New Invoice
          </Link>
        }
      />

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number or customer"
              className={`${inputBase} pl-9`}
            />
          </div>

          <div className="flex gap-3 sm:ml-auto">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className={`${inputBase} sm:w-40`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value === "ALL" ? "All Statuses" : option.label}
                </option>
              ))}
            </select>

            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value as FyFilter)}
              className={`${inputBase} sm:w-48`}
            >
              <option value="ALL">All Financial Years</option>
              {FINANCIAL_YEARS.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Invoice Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Taxable Amount</th>
                <th className="px-4 py-3 text-right">GST</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <LoadingRows />}

              {!loading && error && (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-4 py-12">
                    <ErrorState onRetry={fetchInvoices} />
                  </td>
                </tr>
              )}

              {!loading && !error && filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-4 py-12">
                    <EmptyState hasInvoices={invoices.length > 0} />
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredInvoices.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
                ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && filteredInvoices.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">{filteredInvoices.length}</span>{" "}
              of {invoices.length} invoices
            </span>
            <span className="text-slate-500">
              Total:{" "}
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatCurrency(filteredTotal)}
              </span>
            </span>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

const COLUMN_COUNT = 8;

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const gst =
    Number(invoice.totalCGST) +
    Number(invoice.totalSGST) +
    Number(invoice.totalIGST);

  return (
    <tr className="transition-colors hover:bg-slate-50/80">
      <td className="px-4 py-3">
        <Link
          href={`/invoices/${invoice.id}`}
          className="font-medium text-slate-900 hover:text-indigo-600"
        >
          {invoice.invoiceNumber}
        </Link>
        <p className="text-xs text-slate-500">FY {invoice.financialYear}</p>
      </td>
      <td className="px-4 py-3 text-slate-700">
        {formatDate(invoice.invoiceDate)}
      </td>
      <td className="max-w-[280px] px-4 py-3">
        <p className="truncate font-medium text-slate-800">{invoice.buyerName}</p>
        <p className="truncate font-mono text-xs text-slate-500">
          {invoice.buyerGSTIN ?? "No GSTIN"}
        </p>
      </td>
      <td className="px-4 py-3 text-right text-slate-700 tabular-nums">
        {formatCurrency(invoice.subtotal)}
      </td>
      <td className="px-4 py-3 text-right text-slate-700 tabular-nums">
        {formatCurrency(gst)}
      </td>
      <td className="px-4 py-3 text-right font-semibold text-slate-900 tabular-nums">
        {formatCurrency(invoice.grandTotal)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className={iconBtn}
            title="Edit invoice"
          >
            <Pencil size={16} />
          </Link>
          <Link
            href={`/invoices/${invoice.id}`}
            className={iconBtn}
            title="View invoice"
          >
            <Eye size={16} />
          </Link>
          <InvoiceDownloadButton invoice={invoice} className={iconBtn} />
        </div>
      </td>
    </tr>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: COLUMN_COUNT }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton variant="text" width="100%" height={20} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ hasInvoices }: { hasInvoices: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileSearch size={22} />
      </div>
      <p className="text-base font-medium text-slate-900">
        No invoices found
      </p>
      <p className="max-w-sm text-sm text-slate-500">
        {hasInvoices
          ? "No invoices match your search or filter."
          : "Create your first GST invoice to see it here."}
      </p>
      <Link
        href="/invoices/create"
        className={`${btnPrimary} mt-2`}
      >
        <Plus size={16} />
        Create New Invoice
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <AlertCircle size={28} className="text-red-500" />
      <p className="text-base font-medium text-slate-900">
        Unable to load invoices.
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
