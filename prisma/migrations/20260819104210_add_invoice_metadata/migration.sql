-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "buyerAadhaar" TEXT,
ADD COLUMN     "buyerOrderDate" TIMESTAMP(3),
ADD COLUMN     "buyerOrderNo" TEXT,
ADD COLUMN     "deliveryNote" TEXT,
ADD COLUMN     "deliveryNoteDate" TIMESTAMP(3),
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "dispatchDocNo" TEXT,
ADD COLUMN     "dispatchedThrough" TEXT;
