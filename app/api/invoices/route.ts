import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, InvoiceTaxType } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/guards";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const invoices = await prisma.invoice.findMany({
      // Admins see every invoice; normal users only see invoices they own.
      where: auth.user.role === "ADMIN" ? undefined : { ownerId: auth.user.id },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

const VALID_FINANCIAL_YEARS = ["2024-25", "2025-26", "2026-27"];

/** Inclusive Apr 1 - Mar 31 date ranges (ISO) for each supported Financial Year. */
const FY_DATE_RANGES: Record<string, { start: string; end: string }> = {
  "2024-25": { start: "2024-04-01", end: "2025-03-31" },
  "2025-26": { start: "2025-04-01", end: "2026-03-31" },
  "2026-27": { start: "2026-04-01", end: "2027-03-31" },
};

/** Returns true if the (UTC) date falls within the given Financial Year's range. */
function isDateInFinancialYear(date: Date, financialYear: string): boolean {
  const range = FY_DATE_RANGES[financialYear];
  if (!range) return false;
  const iso = date.toISOString().slice(0, 10);
  return iso >= range.start && iso <= range.end;
}

/** "2026-27" -> "26-27" prefix used in the invoice number. */
function financialYearPrefix(financialYear: string): string {
  const [start, end] = financialYear.split("-");
  return `${start.slice(-2)}-${end}`;
}

/** Formats a sequence number, zero-padded to at least 2 digits (no reset after 99). */
function formatSequence(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Expected shape: "24-25/001", "26-27/16", etc. (YY-YY/N...). */
const INVOICE_NUMBER_PATTERN = /^\d{2}-\d{2}\/\d+$/;

/** Thrown when a manually-entered invoice number already exists. */
class ManualInvoiceNumberConflictError extends Error {
  constructor(invoiceNumber: string) {
    super(`Invoice number ${invoiceNumber} already exists`);
    this.name = "ManualInvoiceNumberConflictError";
  }
}

type IncomingItem = {
  description?: unknown;
  hsn?: unknown;
  quantity?: unknown;
  unit?: unknown;
  rate?: unknown;
  gstRate?: unknown;
};

type IncomingInvoice = {
  invoiceNumber?: unknown;
  useExistingInvoiceNumber?: unknown;
  invoiceDate?: unknown;
  financialYear?: unknown;
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
    !isNonEmptyString(body.financialYear) ||
    !VALID_FINANCIAL_YEARS.includes(body.financialYear as string)
  ) {
    errors.push(
      `financialYear must be one of: ${VALID_FINANCIAL_YEARS.join(", ")}`
    );
  } else if (
    isNonEmptyString(body.invoiceDate as string) &&
    !Number.isNaN(new Date(body.invoiceDate as string).getTime()) &&
    !isDateInFinancialYear(
      new Date(body.invoiceDate as string),
      body.financialYear as string
    )
  ) {
    errors.push(
      `invoiceDate does not belong to financialYear ${body.financialYear}`
    );
  }

  if (body.useExistingInvoiceNumber) {
    if (!isNonEmptyString(body.invoiceNumber)) {
      errors.push("invoiceNumber is required when useExistingInvoiceNumber is true");
    } else if (
      !INVOICE_NUMBER_PATTERN.test((body.invoiceNumber as string).trim())
    ) {
      errors.push("invoiceNumber must be in the format YY-YY/NNN, e.g. 25-26/087");
    }
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

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

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
  const financialYear = body.financialYear as string;
  const prefix = financialYearPrefix(financialYear);
  const useExistingInvoiceNumber = Boolean(body.useExistingInvoiceNumber);
  const manualInvoiceNumber = useExistingInvoiceNumber
    ? (body.invoiceNumber as string).trim()
    : null;

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      let invoiceNumber: string;

      if (manualInvoiceNumber) {
        // Manual/historical invoice number: verify uniqueness explicitly
        // (the DB unique constraint on invoiceNumber is the final guard),
        // and do NOT touch the FY sequence counter.
        const existing = await tx.invoice.findUnique({
          where: { invoiceNumber: manualInvoiceNumber },
          select: { id: true },
        });
        if (existing) {
          throw new ManualInvoiceNumberConflictError(manualInvoiceNumber);
        }
        invoiceNumber = manualInvoiceNumber;
      } else {
        // Atomic, database-safe sequence allocation: upsert-then-increment in
        // a single statement via raw SQL avoids the read-modify-write race
        // condition of SELECT + JS increment + INSERT. Postgres row-level
        // locking (implicit in UPDATE ... RETURNING) serializes concurrent
        // requests for the same financialYear.
        const rows = await tx.$queryRaw<{ lastNumber: number }[]>`
          INSERT INTO "InvoiceSequence" ("financialYear", "lastNumber", "createdAt", "updatedAt")
          VALUES (${financialYear}, 1, NOW(), NOW())
          ON CONFLICT ("financialYear")
          DO UPDATE SET "lastNumber" = "InvoiceSequence"."lastNumber" + 1, "updatedAt" = NOW()
          RETURNING "lastNumber"
        `;

        const sequenceNumber = rows[0].lastNumber;
        invoiceNumber = `${prefix}/${formatSequence(sequenceNumber)}`;
      }

      return tx.invoice.create({
        data: {
          invoiceNumber,
          invoiceDate,
          financialYear,
          taxType,
          ownerId: auth.user.id,

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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (
      error instanceof ManualInvoiceNumberConflictError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002")
    ) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
