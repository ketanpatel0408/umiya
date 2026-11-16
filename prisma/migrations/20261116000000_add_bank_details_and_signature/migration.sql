-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankBranchName" TEXT,
ADD COLUMN     "bankIfscCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "signatureImage" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankBranchName" TEXT,
ADD COLUMN     "bankIfscCode" TEXT,
ADD COLUMN     "bankName" TEXT;

-- Backfill: the bank details previously hardcoded in
-- app/invoices/invoiceConfig.ts belong to the initial Admin account (the
-- UMIYA seller), so assign them there.
UPDATE "User"
SET
  "bankName" = 'Central Bank of India',
  "bankBranchName" = 'Joravarnagar Branch',
  "bankAccountNumber" = '5389346177',
  "bankIfscCode" = 'CBIN0280988'
WHERE "username" = 'admin';

-- Snapshot each existing invoice's bank details from its owner. Invoices of
-- users without bank details stay blank until that user's details are set
-- and the invoice is saved again.
UPDATE "Invoice" AS i
SET
  "bankName" = u."bankName",
  "bankBranchName" = u."bankBranchName",
  "bankAccountNumber" = u."bankAccountNumber",
  "bankIfscCode" = u."bankIfscCode"
FROM "User" AS u
WHERE i."ownerId" = u."id";
