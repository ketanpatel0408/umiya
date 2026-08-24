"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toFormState, type InvoiceFormState } from "../../create/formHelpers";
import InvoiceForm from "../../create/InvoiceForm";
import type { Invoice } from "../../types";

type LoadStatus = "loading" | "ready" | "not-found" | "error";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceFormState | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (!active) return;
        if (res.status === 404) {
          setStatus("not-found");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data: Invoice = await res.json();
        if (!active) return;
        setInvoice(data);
        setForm(toFormState(data));
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="min-h-full flex-1 bg-zinc-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "not-found" || status === "error") {
    return (
      <div className="min-h-full flex-1 bg-zinc-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {status === "not-found" ? "Invoice not found" : "Something went wrong"}
            </h1>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InvoiceForm
      mode="edit"
      invoiceId={invoice!.id}
      initialForm={form!}
      sellerStatus="ready"
      title={`Edit Invoice ${invoice!.invoiceNumber}`}
      subtitle="Update the invoice details below. Invoice number and numbering sequence remain unchanged."
    />
  );
}
