"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Eye, X } from "lucide-react";
import {
  emptyItem,
  computeTotals,
  validateForm,
  buildPreviewInvoice,
  type ItemForm,
  type InvoiceFormState,
} from "./formHelpers";
import { SellerSection, BuyerSection, InvoiceDetailsSection } from "./FormSections";
import { MetadataSection, NotesSection } from "./FormSectionsExtra";
import ItemsSection from "./ItemsSection";
import TotalsSummary from "./TotalsSummary";
import InvoiceDocument from "../[id]/InvoiceDocument";
import type { Invoice } from "../types";
import {
  PageContainer,
  PageHeader,
  btnPrimary,
  btnSecondary,
} from "../../components/ui";

type SellerStatus = "loading" | "ready" | "missing" | "error";

type Props = {
  mode: "create" | "edit";
  invoiceId?: number;
  initialForm: InvoiceFormState;
  sellerStatus?: SellerStatus;
  title: string;
  subtitle: string;
};

export default function InvoiceForm({
  mode,
  invoiceId,
  initialForm,
  sellerStatus = "ready",
  title,
  subtitle,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<InvoiceFormState>(initialForm);

  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const totals = useMemo(
    () => computeTotals(form.items, form.taxType),
    [form.items, form.taxType]
  );

  function updateField<K extends keyof InvoiceFormState>(
    key: K,
    value: InvoiceFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length > 1
          ? prev.items.filter((_, i) => i !== index)
          : prev.items,
    }));
  }

  async function handleSave() {
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setSaveError(null);
    if (validationErrors.length > 0) return;

    setSaving(true);
    try {
      const url = mode === "edit" ? `/api/invoices/${invoiceId}` : "/api/invoices";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: form.items.map((it) => ({
            description: it.description,
            hsn: it.hsn || null,
            quantity: Number(it.quantity),
            unit: it.unit || null,
            rate: Number(it.rate),
            gstRate: Number(it.gstRate),
          })),
        }),
      });

      const successStatus = mode === "edit" ? 200 : 201;
      if (res.status === successStatus) {
        const data = await res.json();
        router.push(`/invoices/${data.id}`);
        return;
      }

      if (res.status === 400) {
        const data = await res.json();
        setSaveError(
          Array.isArray(data.details)
            ? data.details.join(", ")
            : "Validation failed"
        );
      } else if (res.status === 404) {
        setSaveError("Invoice not found.");
      } else if (res.status === 409) {
        setSaveError("Invoice number already exists.");
      } else {
        setSaveError("Something went wrong. Please try again.");
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <PageContainer>
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={
            <Link
              href={mode === "edit" ? `/invoices/${invoiceId}` : "/invoices"}
              className={btnSecondary}
            >
              <ArrowLeft size={16} />
              {mode === "edit" ? "Cancel" : "Back"}
            </Link>
          }
        />

        {(errors.length > 0 || saveError) && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {saveError && <p className="font-medium">{saveError}</p>}
            {errors.length > 0 && (
              <ul className="list-inside list-disc">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <InvoiceDetailsSection
              form={form}
              updateField={updateField}
              mode={mode}
            />
            <SellerSection
              form={form}
              updateField={updateField}
              sellerStatus={sellerStatus}
            />
            <BuyerSection form={form} updateField={updateField} />
            <MetadataSection form={form} updateField={updateField} />
            <ItemsSection
              items={form.items}
              updateItem={updateItem}
              addItem={addItem}
              removeItem={removeItem}
            />
            <NotesSection form={form} updateField={updateField} />
          </div>

          <div className="flex flex-col gap-4 self-start lg:sticky lg:top-8">
            <TotalsSummary totals={totals} />

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={saving || sellerStatus !== "ready"}
                className={`${btnPrimary} w-full py-3`}
              >
                <Save size={16} />
                {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Save Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={`${btnSecondary} w-full py-3`}
              >
                <Eye size={16} />
                Preview Invoice
              </button>
            </div>
          </div>
        </div>
    </PageContainer>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm">
          <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Invoice Preview
            </h2>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={btnSecondary}
            >
              <X size={16} />
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-200/60 px-4 py-8">
            <InvoiceDocument
              invoice={buildPreviewInvoice(form) as unknown as Invoice}
            />
          </div>
        </div>
      )}
    </>
  );
}
