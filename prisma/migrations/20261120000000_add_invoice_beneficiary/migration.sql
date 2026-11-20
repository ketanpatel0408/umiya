-- AlterTable
ALTER TABLE "User" ADD COLUMN     "showBeneficiaryOnInvoice" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "beneficiaryName" TEXT,
ADD COLUMN     "beneficiaryTin" TEXT;
