"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toFormState, type InvoiceFormState } from "../../create/formHelpers";
import InvoiceForm from "../../create/InvoiceForm";
import type { Invoice } from "../../types";
import { PageContainer, PageHeader, btnSecondary } from "../../../components/ui";

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
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          Loading...
        </div>
      </div>
    );
  }

  if (status === "not-found" || status === "error") {
    return (
      <PageContainer>
        <PageHeader
          title={status === "not-found" ? "Invoice not found" : "Something went wrong"}
          actions={
            <Link href="/invoices" className={btnSecondary}>
              <ArrowLeft size={16} />
              Back
            </Link>
          }
        />
      </PageContainer>
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
