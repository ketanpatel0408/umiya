-- Per-user invoice numbering: each user gets their own number template and
-- their own counter per financial year, and invoice numbers only need to be
-- unique per user.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invoiceNumberFormat" TEXT;

-- DropIndex
DROP INDEX "Invoice_invoiceNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_ownerId_invoiceNumber_key" ON "Invoice"("ownerId", "invoiceNumber");

-- The old counter was shared by all users; rebuild it per user below.
DELETE FROM "InvoiceSequence";

-- DropIndex
DROP INDEX "InvoiceSequence_financialYear_key";

-- AlterTable
ALTER TABLE "InvoiceSequence" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSequence_ownerId_financialYear_key" ON "InvoiceSequence"("ownerId", "financialYear");

-- AddForeignKey
ALTER TABLE "InvoiceSequence" ADD CONSTRAINT "InvoiceSequence_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: each user continues from the highest number they already have
-- in each financial year (existing numbers all use the old "YY-YY/N" format).
INSERT INTO "InvoiceSequence" ("ownerId", "financialYear", "lastNumber", "updatedAt")
SELECT
  "ownerId",
  "financialYear",
  MAX(CAST(substring("invoiceNumber" FROM '/([0-9]+)$') AS INTEGER)),
  NOW()
FROM "Invoice"
WHERE "invoiceNumber" ~ '^[0-9]{2}-[0-9]{2}/[0-9]+$'
GROUP BY "ownerId", "financialYear";
