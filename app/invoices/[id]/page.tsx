"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import { ArrowLeft, Printer, AlertCircle, FileX, Pencil } from "lucide-react";
import type { Invoice } from "../types";
import InvoiceDocument from "./InvoiceDocument";
import InvoiceDownloadButton from "../InvoiceDownloadButton";
import { StatusBadge, btnPrimary, btnSecondary } from "../../components/ui";
import { formatCurrency, formatDate } from "../utils";

type LoadState = "loading" | "not-found" | "error" | "ready";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  const fetchInvoice = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.status === 404) {
        setState("not-found");
        return;
      }
      if (!res.ok) throw new Error("Request failed");
      const data: Invoice = await res.json();
      setInvoice(data);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (state === "loading") {
    return (
      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton variant="rounded" width="100%" height={1120} />
        </div>
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <CenteredMessage
        icon={<FileX size={28} className="text-slate-400" />}
        title="Invoice not found"
      />
    );
  }

  if (state === "error") {
    return (
      <CenteredMessage
        icon={<AlertCircle size={28} className="text-red-500" />}
        title="Unable to load invoice."
        onRetry={fetchInvoice}
      />
    );
  }

  if (!invoice) return null;

  return (
    <div className="print-page-wrapper min-h-full flex-1 bg-slate-100">
      <div className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/invoices" className={`${btnSecondary} px-2.5`} title="Back to Invoices">
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold text-slate-900">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <StatusBadge status={invoice.status} />
              </div>
              <p className="truncate text-xs text-slate-500">
                {invoice.buyerName} · {formatDate(invoice.invoiceDate)} ·{" "}
                <span className="font-medium text-slate-700">
                  {formatCurrency(invoice.grandTotal)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/invoices/${invoice.id}/edit`} className={btnSecondary}>
              <Pencil size={16} />
              Edit
            </Link>
            <InvoiceDownloadButton invoice={invoice} className={btnSecondary} label="Download PDF" />
            <button onClick={() => window.print()} className={btnPrimary}>
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="print-page-wrapper overflow-x-auto px-4 py-8">
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}

function CenteredMessage({
  icon,
  title,
  onRetry,
}: {
  icon: React.ReactNode;
  title: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        {icon}
      </div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {onRetry ? (
        <button
          onClick={onRetry}
          className={`${btnSecondary} mt-2`}
        >
          Retry
        </button>
      ) : (
        <Link
          href="/invoices"
          className={`${btnSecondary} mt-2`}
        >
          Back to Invoices
        </Link>
      )}
    </div>
  );
}
