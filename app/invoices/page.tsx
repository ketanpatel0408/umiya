"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import { Plus, Eye, Search, AlertCircle } from "lucide-react";
import type { Invoice } from "./types";
import { formatCurrency, formatDate } from "./utils";

type Status = "ALL" | "DRAFT" | "ISSUED" | "CANCELLED";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "ISSUED", label: "Issued" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("ALL");

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
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.buyerName.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, status]);

  return (
    <div className="min-h-full flex-1 bg-zinc-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              GST Invoices
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              View and manage previously generated GST invoices.
            </p>
          </div>
          <Link
            href="/invoices/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <Plus size={18} />
            Create New Invoice
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number or customer"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-zinc-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 sm:w-48"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice No.</th>
                  <th className="px-4 py-3 font-medium">Invoice Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">GSTIN</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Taxable Amount
                  </th>
                  <th className="px-4 py-3 font-medium text-right">GST</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Grand Total
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading && <LoadingRows />}

                {!loading && error && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12">
                      <ErrorState onRetry={fetchInvoices} />
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12">
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
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const gst =
    Number(invoice.totalCGST) +
    Number(invoice.totalSGST) +
    Number(invoice.totalIGST);

  return (
    <tr className="hover:bg-zinc-50">
      <td className="px-4 py-3 font-medium text-zinc-900">
        {invoice.invoiceNumber}
      </td>
      <td className="px-4 py-3 text-zinc-700">
        {formatDate(invoice.invoiceDate)}
      </td>
      <td className="px-4 py-3 text-zinc-700">{invoice.buyerName}</td>
      <td className="px-4 py-3 text-zinc-700">{invoice.buyerGSTIN ?? "-"}</td>
      <td className="px-4 py-3 text-right text-zinc-700">
        {formatCurrency(invoice.subtotal)}
      </td>
      <td className="px-4 py-3 text-right text-zinc-700">
        {formatCurrency(gst)}
      </td>
      <td className="px-4 py-3 text-right font-medium text-zinc-900">
        {formatCurrency(invoice.grandTotal)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3 text-center">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          title="View invoice"
        >
          <Eye size={18} />
        </Link>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const styles: Record<Invoice["status"], string> = {
    DRAFT: "bg-zinc-100 text-zinc-700",
    ISSUED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
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
      <p className="text-base font-medium text-zinc-900">
        No invoices found
      </p>
      <p className="max-w-sm text-sm text-zinc-500">
        {hasInvoices
          ? "No invoices match your search or filter."
          : "Create your first GST invoice to see it here."}
      </p>
      <Link
        href="/invoices/create"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
      <p className="text-base font-medium text-zinc-900">
        Unable to load invoices.
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
