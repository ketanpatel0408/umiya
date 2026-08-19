-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceTaxType" AS ENUM ('CGST_SGST', 'IGST');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "financialYear" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "taxType" "InvoiceTaxType" NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerGSTIN" TEXT,
    "sellerPAN" TEXT,
    "sellerAddress" TEXT,
    "sellerState" TEXT,
    "sellerStateCode" TEXT,
    "sellerEmail" TEXT,
    "sellerPhone" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerGSTIN" TEXT,
    "buyerPAN" TEXT,
    "buyerAddress" TEXT,
    "buyerState" TEXT,
    "buyerStateCode" TEXT,
    "buyerEmail" TEXT,
    "buyerPhone" TEXT,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "totalCGST" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalSGST" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalIGST" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "roundOff" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "termsAndConditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "hsn" TEXT,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unit" TEXT,
    "rate" DECIMAL(15,2) NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL,
    "taxableAmount" DECIMAL(15,2) NOT NULL,
    "cgstAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "igstAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_financialYear_idx" ON "Invoice"("financialYear");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_buyerGSTIN_idx" ON "Invoice"("buyerGSTIN");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
