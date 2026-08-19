export type InvoiceStatus = "DRAFT" | "ISSUED" | "CANCELLED";
export type InvoiceTaxType = "CGST_SGST" | "IGST";

export type InvoiceItem = {
  id: number;
  invoiceId: number;
  description: string;
  hsn: string | null;
  quantity: string;
  unit: string | null;
  rate: string;
  gstRate: string;
  taxableAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  totalAmount: string;
  createdAt: string;
};

/**
 * Shape returned by GET /api/invoices and GET /api/invoices/[id].
 * Prisma Decimal fields are serialized as strings over JSON.
 */
export type Invoice = {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  financialYear: string;
  status: InvoiceStatus;
  taxType: InvoiceTaxType;

  sellerName: string;
  sellerGSTIN: string | null;
  sellerPAN: string | null;
  sellerAddress: string | null;
  sellerState: string | null;
  sellerStateCode: string | null;
  sellerEmail: string | null;
  sellerPhone: string | null;

  buyerName: string;
  buyerGSTIN: string | null;
  buyerPAN: string | null;
  buyerAddress: string | null;
  buyerState: string | null;
  buyerStateCode: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  buyerAadhaar: string | null;

  deliveryNote: string | null;
  buyerOrderNo: string | null;
  buyerOrderDate: string | null;
  dispatchDocNo: string | null;
  deliveryNoteDate: string | null;
  dispatchedThrough: string | null;
  destination: string | null;

  subtotal: string;
  totalCGST: string;
  totalSGST: string;
  totalIGST: string;
  roundOff: string;
  grandTotal: string;

  notes: string | null;
  termsAndConditions: string | null;

  createdAt: string;
  updatedAt: string;

  items: InvoiceItem[];
};
