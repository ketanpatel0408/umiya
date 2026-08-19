"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import { ArrowLeft, Printer, AlertCircle, FileX } from "lucide-react";
import type { Invoice } from "../types";
import InvoiceDocument from "./InvoiceDocument";

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
      <div className="min-h-full flex-1 bg-zinc-100 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton variant="rounded" width="100%" height={1120} />
        </div>
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <CenteredMessage
        icon={<FileX size={28} className="text-zinc-400" />}
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
    <div className="print-page-wrapper min-h-full flex-1 bg-zinc-100">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <ArrowLeft size={16} />
          Back to Invoices
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
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
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 px-4 py-16 text-center">
      {icon}
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Retry
        </button>
      ) : (
        <Link
          href="/invoices"
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Back to Invoices
        </Link>
      )}
    </div>
  );
}
