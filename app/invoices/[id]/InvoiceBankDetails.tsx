import type { Invoice } from "../types";

export default function InvoiceBankDetails({
  invoice,
  totalGSTWords,
  billAmountWords,
}: {
  invoice: Pick<
    Invoice,
    "bankName" | "bankBranchName" | "bankAccountNumber" | "bankIfscCode"
  >;
  /** Omitted for lumpsum (composition) invoices, which carry no GST. */
  totalGSTWords?: string;
  billAmountWords: string;
}) {
  return (
    <>
      <div className="border-b border-current">
        <Row label="Bank Name" value={invoice.bankName} />
        <Row label="Branch Name" value={invoice.bankBranchName} />
        <Row label="Bank A/c. No." value={invoice.bankAccountNumber} />
        <Row label="RTGS/IFSC Code" value={invoice.bankIfscCode} />
      </div>
      <div className="h-[100px] border-b border-current">
        {totalGSTWords !== undefined && (
          <div className="flex p-1 pb-0">
            <span className="w-[20%] font-semibold">Total GST</span>
            <span>:</span>
            <span className="ml-3 w-[80%]">{totalGSTWords}</span>
          </div>
        )}
        <div className="flex p-1 pb-0">
          <span className="w-[20%] font-semibold">Bill Amount</span>
          <span>:</span>
          <span className="ml-3 w-[80%]">{billAmountWords}</span>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex p-1 pb-0">
      <span className="w-36 font-semibold">{label}</span>
      <span className="font-semibold">:</span>
      <span className="ml-3 uppercase">{value ?? ""}</span>
    </div>
  );
}
