import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, InvoiceTaxType } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/guards";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return NextResponse.json(
      { error: "Invalid invoice ID" },
      { status: 400 }
    );
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
      },
    });

    if (
      !invoice ||
      (auth.user.role !== "ADMIN" && invoice.ownerId !== auth.user.id)
    ) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

type IncomingItem = {
  id?: unknown;
  description?: unknown;
  hsn?: unknown;
  quantity?: unknown;
  unit?: unknown;
  rate?: unknown;
  gstRate?: unknown;
};

type IncomingInvoice = {
  invoiceDate?: unknown;
  taxType?: unknown;

  sellerName?: unknown;
  sellerGSTIN?: unknown;
  sellerPAN?: unknown;
  sellerAddress?: unknown;
  sellerState?: unknown;
  sellerStateCode?: unknown;
  sellerEmail?: unknown;
  sellerPhone?: unknown;

  buyerName?: unknown;
  buyerGSTIN?: unknown;
  buyerPAN?: unknown;
  buyerAddress?: unknown;
  buyerState?: unknown;
  buyerStateCode?: unknown;
  buyerEmail?: unknown;
  buyerPhone?: unknown;
  buyerAadhaar?: unknown;

  deliveryNote?: unknown;
  buyerOrderNo?: unknown;
  buyerOrderDate?: unknown;
  dispatchDocNo?: unknown;
  deliveryNoteDate?: unknown;
  dispatchedThrough?: unknown;
  destination?: unknown;

  items?: unknown;

  notes?: unknown;
  termsAndConditions?: unknown;
};

const VALID_TAX_TYPES = Object.values(InvoiceTaxType);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Parses an optional date-like value; returns null if empty/invalid. */
function parseOptionalDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateInvoiceBody(body: IncomingInvoice): string[] {
  const errors: string[] = [];

  if (
    !isNonEmptyString(body.invoiceDate as string) ||
    Number.isNaN(new Date(body.invoiceDate as string).getTime())
  ) {
    errors.push("invoiceDate must be a valid date");
  }

  if (
    !isNonEmptyString(body.taxType) ||
    !VALID_TAX_TYPES.includes(body.taxType as InvoiceTaxType)
  ) {
    errors.push(`taxType must be one of: ${VALID_TAX_TYPES.join(", ")}`);
  }

  if (!isNonEmptyString(body.sellerName)) {
    errors.push("sellerName is required");
  }

  if (!isNonEmptyString(body.buyerName)) {
    errors.push("buyerName is required");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push("items must be a non-empty array");
  } else {
    (body.items as IncomingItem[]).forEach((item, index) => {
      if (!isNonEmptyString(item.description)) {
        errors.push(`items[${index}].description is required`);
      }
      if (!isFiniteNumber(item.quantity) || item.quantity <= 0) {
        errors.push(`items[${index}].quantity must be greater than 0`);
      }
      if (!isFiniteNumber(item.rate) || item.rate < 0) {
        errors.push(`items[${index}].rate must be >= 0`);
      }
      if (!isFiniteNumber(item.gstRate) || item.gstRate < 0) {
        errors.push(`items[${index}].gstRate must be >= 0`);
      }
    });
  }

  return errors;
}

function calculateItem(item: IncomingItem, taxType: InvoiceTaxType) {
  const quantity = new Prisma.Decimal(item.quantity as number);
  const rate = new Prisma.Decimal(item.rate as number);
  const gstRate = new Prisma.Decimal(item.gstRate as number);

  const taxableAmount = quantity.times(rate);

  let cgstAmount = new Prisma.Decimal(0);
  let sgstAmount = new Prisma.Decimal(0);
  let igstAmount = new Prisma.Decimal(0);

  if (taxType === InvoiceTaxType.CGST_SGST) {
    const half = taxableAmount.times(gstRate).div(2).div(100);
    cgstAmount = half;
    sgstAmount = half;
  } else if (taxType === InvoiceTaxType.IGST) {
    igstAmount = taxableAmount.times(gstRate).div(100);
  }

  const totalAmount = taxableAmount.plus(cgstAmount).plus(sgstAmount).plus(igstAmount);

  return {
    description: (item.description as string).trim(),
    hsn: (item.hsn as string | null | undefined) ?? null,
    quantity,
    unit: (item.unit as string | null | undefined) ?? null,
    rate,
    gstRate,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return NextResponse.json(
      { error: "Invalid invoice ID" },
      { status: 400 }
    );
  }

  const invoiceId = Number(id);

  const existing = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (
    !existing ||
    (auth.user.role !== "ADMIN" && existing.ownerId !== auth.user.id)
  ) {
    return NextResponse.json(
      { error: "Invoice not found" },
      { status: 404 }
    );
  }

  let body: IncomingInvoice;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const validationErrors = validateInvoiceBody(body);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: validationErrors },
      { status: 400 }
    );
  }

  const taxType = body.taxType as InvoiceTaxType;
  const items = (body.items as IncomingItem[]).map((item) =>
    calculateItem(item, taxType)
  );

  const zero = new Prisma.Decimal(0);
  const subtotal = items.reduce((sum, i) => sum.plus(i.taxableAmount), zero);
  const totalCGST = items.reduce((sum, i) => sum.plus(i.cgstAmount), zero);
  const totalSGST = items.reduce((sum, i) => sum.plus(i.sgstAmount), zero);
  const totalIGST = items.reduce((sum, i) => sum.plus(i.igstAmount), zero);
  const roundOff = zero;
  const grandTotal = subtotal.plus(totalCGST).plus(totalSGST).plus(totalIGST).plus(roundOff);

  const invoiceDate = new Date(body.invoiceDate as string);
  // invoiceNumber, financialYear, ownerId and InvoiceSequence are never
  // touched during edit — only the snapshot/content fields and totals are
  // recalculated and persisted.

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      // Replace all items: delete existing then recreate. Simpler and safer
      // than diffing update/create/delete per item, and item rows have no
      // external references that would be broken by new IDs.
      await tx.invoiceItem.deleteMany({ where: { invoiceId } });

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          invoiceDate,
          taxType,

          sellerName: (body.sellerName as string).trim(),
          sellerGSTIN: (body.sellerGSTIN as string | null | undefined) ?? null,
          sellerPAN: (body.sellerPAN as string | null | undefined) ?? null,
          sellerAddress:
            (body.sellerAddress as string | null | undefined) ?? null,
          sellerState: (body.sellerState as string | null | undefined) ?? null,
          sellerStateCode:
            (body.sellerStateCode as string | null | undefined) ?? null,
          sellerEmail: (body.sellerEmail as string | null | undefined) ?? null,
          sellerPhone: (body.sellerPhone as string | null | undefined) ?? null,

          buyerName: (body.buyerName as string).trim(),
          buyerGSTIN: (body.buyerGSTIN as string | null | undefined) ?? null,
          buyerPAN: (body.buyerPAN as string | null | undefined) ?? null,
          buyerAddress:
            (body.buyerAddress as string | null | undefined) ?? null,
          buyerState: (body.buyerState as string | null | undefined) ?? null,
          buyerStateCode:
            (body.buyerStateCode as string | null | undefined) ?? null,
          buyerEmail: (body.buyerEmail as string | null | undefined) ?? null,
          buyerPhone: (body.buyerPhone as string | null | undefined) ?? null,
          buyerAadhaar: (body.buyerAadhaar as string | null | undefined) ?? null,

          deliveryNote: (body.deliveryNote as string | null | undefined) ?? null,
          buyerOrderNo: (body.buyerOrderNo as string | null | undefined) ?? null,
          buyerOrderDate: parseOptionalDate(body.buyerOrderDate),
          dispatchDocNo:
            (body.dispatchDocNo as string | null | undefined) ?? null,
          deliveryNoteDate: parseOptionalDate(body.deliveryNoteDate),
          dispatchedThrough:
            (body.dispatchedThrough as string | null | undefined) ?? null,
          destination: (body.destination as string | null | undefined) ?? null,

          subtotal,
          totalCGST,
          totalSGST,
          totalIGST,
          roundOff,
          grandTotal,

          notes: (body.notes as string | null | undefined) ?? null,
          termsAndConditions:
            (body.termsAndConditions as string | null | undefined) ?? null,

          items: {
            create: items,
          },
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
