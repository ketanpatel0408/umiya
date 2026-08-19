import type { InvoiceTaxType } from "../types";

export type ItemForm = {
  description: string;
  hsn: string;
  quantity: string;
  unit: string;
  rate: string;
  gstRate: string;
};

export type InvoiceFormState = {
  invoiceDate: string;
  financialYear: string;
  taxType: InvoiceTaxType;

  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerGSTIN: string;
  sellerPAN: string;
  sellerState: string;
  sellerStateCode: string;

  buyerName: string;
  buyerAddress: string;
  buyerGSTIN: string;
  buyerPAN: string;
  buyerAadhaar: string;
  buyerState: string;
  buyerStateCode: string;

  deliveryNote: string;
  buyerOrderNo: string;
  buyerOrderDate: string;
  dispatchDocNo: string;
  deliveryNoteDate: string;
  dispatchedThrough: string;
  destination: string;

  notes: string;
  termsAndConditions: string;

  items: ItemForm[];
};

export function emptyItem(): ItemForm {
  return {
    description: "",
    hsn: "",
    quantity: "1",
    unit: "",
    rate: "0",
    gstRate: "18",
  };
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Converts an ISO date ("YYYY-MM-DD") to Indian display format ("DD-MM-YYYY"). */
export function isoToDisplayDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}-${m}-${y}`;
}

/** Converts an Indian display date ("DD-MM-YYYY") back to ISO ("YYYY-MM-DD"). */
export function displayToISODate(display: string): string {
  const match = display.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return "";
  const [, d, m, y] = match;
  const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return iso;
}

/** Indian financial year runs Apr 1 - Mar 31, e.g. "2026-27". */
export function defaultFinancialYear(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed; April = 3
  const startYear = month >= 3 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${endYear.toString().padStart(2, "0")}`;
}

export type ComputedTotals = {
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  roundOff: number;
  grandTotal: number;
};

/**
 * Frontend-only live calculation for user feedback. The backend recomputes
 * and persists the authoritative totals using Prisma.Decimal.
 */
export function computeTotals(
  items: ItemForm[],
  taxType: InvoiceTaxType
): ComputedTotals {
  let subtotal = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  for (const item of items) {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gstRate) || 0;
    const taxable = quantity * rate;
    subtotal += taxable;

    if (taxType === "CGST_SGST") {
      const half = (taxable * gstRate) / 2 / 100;
      totalCGST += half;
      totalSGST += half;
    } else {
      totalIGST += (taxable * gstRate) / 100;
    }
  }

  const roundOff = 0;
  const grandTotal = subtotal + totalCGST + totalSGST + totalIGST + roundOff;

  return { subtotal, totalCGST, totalSGST, totalIGST, roundOff, grandTotal };
}

/**
 * Builds a client-side-only Invoice-shaped object (matching the finalized
 * InvoiceDocument's expected props) from the current form state, for the
 * "Preview Invoice" action. This never touches the API/DB.
 */
export function buildPreviewInvoice(form: InvoiceFormState) {
  const items = form.items.map((item, index) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gstRate) || 0;
    const taxableAmount = quantity * rate;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    if (form.taxType === "CGST_SGST") {
      const half = (taxableAmount * gstRate) / 2 / 100;
      cgstAmount = half;
      sgstAmount = half;
    } else {
      igstAmount = (taxableAmount * gstRate) / 100;
    }
    const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

    return {
      id: index + 1,
      invoiceId: 0,
      description: item.description,
      hsn: item.hsn || null,
      quantity: String(quantity),
      unit: item.unit || null,
      rate: String(rate),
      gstRate: String(gstRate),
      taxableAmount: String(taxableAmount),
      cgstAmount: String(cgstAmount),
      sgstAmount: String(sgstAmount),
      igstAmount: String(igstAmount),
      totalAmount: String(totalAmount),
      createdAt: new Date().toISOString(),
    };
  });

  const totals = computeTotals(form.items, form.taxType);

  return {
    id: 0,
    invoiceNumber: "Auto-generated on save",
    invoiceDate: form.invoiceDate,
    financialYear: form.financialYear,
    status: "DRAFT" as const,
    taxType: form.taxType,

    sellerName: form.sellerName,
    sellerGSTIN: form.sellerGSTIN || null,
    sellerPAN: form.sellerPAN || null,
    sellerAddress: form.sellerAddress || null,
    sellerState: form.sellerState || null,
    sellerStateCode: form.sellerStateCode || null,
    sellerEmail: null,
    sellerPhone: form.sellerPhone || null,

    buyerName: form.buyerName,
    buyerGSTIN: form.buyerGSTIN || null,
    buyerPAN: form.buyerPAN || null,
    buyerAddress: form.buyerAddress || null,
    buyerState: form.buyerState || null,
    buyerStateCode: form.buyerStateCode || null,
    buyerEmail: null,
    buyerPhone: null,
    buyerAadhaar: form.buyerAadhaar || null,

    deliveryNote: form.deliveryNote || null,
    buyerOrderNo: form.buyerOrderNo || null,
    buyerOrderDate: form.buyerOrderDate || null,
    dispatchDocNo: form.dispatchDocNo || null,
    deliveryNoteDate: form.deliveryNoteDate || null,
    dispatchedThrough: form.dispatchedThrough || null,
    destination: form.destination || null,

    subtotal: String(totals.subtotal),
    totalCGST: String(totals.totalCGST),
    totalSGST: String(totals.totalSGST),
    totalIGST: String(totals.totalIGST),
    roundOff: String(totals.roundOff),
    grandTotal: String(totals.grandTotal),

    notes: form.notes || null,
    termsAndConditions: form.termsAndConditions || null,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    items,
  };
}

export function validateForm(form: InvoiceFormState): string[] {
  const errors: string[] = [];

  if (!form.invoiceDate || Number.isNaN(new Date(form.invoiceDate).getTime())) {
    errors.push("Invoice Date must be a valid date.");
  }
  if (!form.financialYear.trim()) errors.push("Financial Year is required.");
  if (!form.taxType) errors.push("Tax Type is required.");
  if (!form.buyerName.trim()) errors.push("Buyer Name is required.");
  if (!form.buyerAddress.trim()) errors.push("Buyer Address is required.");

  if (form.items.length === 0) {
    errors.push("At least one item is required.");
  } else {
    form.items.forEach((item, i) => {
      if (!item.description.trim()) {
        errors.push(`Item ${i + 1}: Description is required.`);
      }
      if (!(Number(item.quantity) > 0)) {
        errors.push(`Item ${i + 1}: Quantity must be greater than 0.`);
      }
      if (!(Number(item.rate) >= 0)) {
        errors.push(`Item ${i + 1}: Rate must be >= 0.`);
      }
      if (!(Number(item.gstRate) >= 0)) {
        errors.push(`Item ${i + 1}: GST % must be >= 0.`);
      }
    });
  }

  return errors;
}
