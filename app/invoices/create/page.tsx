"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Eye, X } from "lucide-react";
import { invoiceConfig } from "../invoiceConfig";
import {
  emptyItem,
  defaultFinancialYear,
  todayISODate,
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

type SellerStatus = "loading" | "ready" | "missing" | "error";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus>("loading");
  const [form, setForm] = useState<InvoiceFormState>(() => ({
    invoiceDate: todayISODate(),
    financialYear: defaultFinancialYear(todayISODate()),
    taxType: "CGST_SGST",

    sellerName: "",
    sellerAddress: "",
    sellerPhone: "",
    sellerGSTIN: "",
    sellerPAN: "",
    sellerState: "",
    sellerStateCode: "",

    buyerName: "",
    buyerAddress: "",
    buyerGSTIN: "",
    buyerPAN: "",
    buyerAadhaar: "",
    buyerState: "",
    buyerStateCode: "",

    deliveryNote: "",
    buyerOrderNo: "",
    buyerOrderDate: "",
    dispatchDocNo: "",
    deliveryNoteDate: "",
    dispatchedThrough: "",
    destination: "",

    notes: "",
    termsAndConditions: invoiceConfig.defaultTerms.join("\n"),

    items: [emptyItem()],
  }));

  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Seller Details must always reflect the logged-in user, never a
  // hardcoded/default seller or another user's data.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (active) setSellerStatus("error");
          return;
        }
        const user = await res.json();
        if (!active) return;
        if (!user.sellerName) {
          setSellerStatus("missing");
          return;
        }
        setForm((prev) => ({
          ...prev,
          sellerName: user.sellerName ?? "",
          sellerAddress: user.sellerAddress ?? "",
          sellerPhone: user.sellerPhone ?? "",
          sellerGSTIN: user.sellerGSTIN ?? "",
          sellerPAN: user.sellerPAN ?? "",
          sellerState: user.sellerState ?? "",
          sellerStateCode: user.sellerStateCode ?? "",
        }));
        setSellerStatus("ready");
      } catch {
        if (active) setSellerStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(
    () => computeTotals(form.items, form.taxType),
    [form.items, form.taxType]
  );

  function updateField<K extends keyof InvoiceFormState>(
    key: K,
    value: InvoiceFormState[K]
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Financial Year is a read-only value derived from Invoice Date; the
      // backend is the ultimate source of truth, this is just for display.
      if (key === "invoiceDate") {
        next.financialYear = defaultFinancialYear(value as string);
      }
      return next;
    });
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
      const res = await fetch("/api/invoices", {
        method: "POST",
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

      if (res.status === 201) {
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
    <div className="min-h-full flex-1 bg-zinc-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Create New Invoice
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Fill in the details below to generate a new GST invoice.
            </p>
          </div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        {(errors.length > 0 || saveError) && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
          <div className="flex flex-col gap-6 lg:col-span-2">
            <InvoiceDetailsSection form={form} updateField={updateField} />
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

          <div className="flex flex-col gap-6">
            <TotalsSummary totals={totals} />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <Eye size={16} />
                Preview Invoice
              </button>
              <button
                onClick={handleSave}
                disabled={saving || sellerStatus !== "ready"}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900/60">
          <div className="no-print sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow">
            <h2 className="text-sm font-semibold text-zinc-900">
              Invoice Preview
            </h2>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              <X size={16} />
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-100 px-4 py-8">
            <InvoiceDocument
              invoice={buildPreviewInvoice(form) as unknown as Invoice}
            />
          </div>
        </div>
      )}
    </div>
  );
}
