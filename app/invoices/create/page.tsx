"use client";

import { useEffect, useState } from "react";
import { invoiceConfig } from "../invoiceConfig";
import {
  emptyItem,
  defaultFinancialYear,
  todayISODate,
  type InvoiceFormState,
} from "./formHelpers";
import InvoiceForm from "./InvoiceForm";

type SellerStatus = "loading" | "ready" | "missing" | "error";

export default function CreateInvoicePage() {
  const [sellerStatus, setSellerStatus] = useState<SellerStatus>("loading");
  const [form, setForm] = useState<InvoiceFormState>(() => ({
    invoiceDate: todayISODate(),
    financialYear: defaultFinancialYear(todayISODate()),
    taxType: "CGST_SGST",

    useExistingInvoiceNumber: false,
    invoiceNumber: "",

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

  if (sellerStatus === "loading") {
    return (
      <div className="min-h-full flex-1 bg-zinc-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <InvoiceForm
      mode="create"
      initialForm={form}
      sellerStatus={sellerStatus}
      title="Create New Invoice"
      subtitle="Fill in the details below to generate a new GST invoice."
    />
  );
}
